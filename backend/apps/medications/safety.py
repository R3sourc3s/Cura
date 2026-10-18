"""
Medication safety checks run before a dose is prescribed or recorded as given.

Each check returns a list of `SafetyIssue`s. The views turn a non-empty list into
a 409 response; the client can resubmit with `safety_override_reason` to proceed
past *overridable* issues (the reason is recorded and managers are notified).
Non-overridable issues — a severe/anaphylactic allergy match, or a dose that has
already been given — can't be bypassed through the API.

The allergy cross-reference below covers common UK drug classes only. It is a
safety net, not a substitute for a licensed drug database (dm+d / BNF), which
is what interaction checking would need.
"""
import re
from dataclasses import asdict, dataclass
from datetime import timedelta

from django.utils import timezone
from rest_framework import status
from rest_framework.exceptions import APIException

# Allergen (as staff typically record it) → drug names that belong to that class.
DRUG_CLASS_MEMBERS = {
    "penicillin": ["amoxicillin", "ampicillin", "flucloxacillin", "co-amoxiclav", "phenoxymethylpenicillin",
                   "benzylpenicillin", "piperacillin", "tazocin", "pivmecillinam", "temocillin"],
    "cephalosporin": ["cefalexin", "cefuroxime", "ceftriaxone", "cefradine", "cefaclor", "cefixime", "cefotaxime"],
    "sulfonamide": ["co-trimoxazole", "sulfamethoxazole", "sulfasalazine"],
    "nsaid": ["ibuprofen", "naproxen", "diclofenac", "aspirin", "celecoxib", "etoricoxib", "mefenamic acid",
              "indometacin", "meloxicam", "ketoprofen"],
    "opioid": ["morphine", "codeine", "co-codamol", "dihydrocodeine", "oxycodone", "tramadol", "fentanyl",
               "buprenorphine", "tapentadol", "diamorphine"],
    "macrolide": ["erythromycin", "clarithromycin", "azithromycin"],
    "tetracycline": ["doxycycline", "lymecycline", "oxytetracycline", "minocycline"],
    "quinolone": ["ciprofloxacin", "levofloxacin", "ofloxacin", "moxifloxacin"],
    "ace inhibitor": ["ramipril", "lisinopril", "enalapril", "perindopril", "captopril"],
    "statin": ["atorvastatin", "simvastatin", "rosuvastatin", "pravastatin"],
}

NON_OVERRIDABLE_ALLERGY = {"severe", "anaphylaxis"}
DUPLICATE_WINDOW = timedelta(minutes=60)


@dataclass
class SafetyIssue:
    code: str          # allergy | duplicate_dose | prn_interval | prn_max_daily
    message: str
    overridable: bool


class SafetyCheckFailed(APIException):
    status_code = status.HTTP_409_CONFLICT
    default_code = "medication_safety"

    def __init__(self, issues):
        super().__init__()
        # Set the body directly: APIException would coerce every value (including booleans) to a string.
        self.detail = {
            "detail": issues[0].message if len(issues) == 1 else f"{len(issues)} medication safety issues found.",
            "safety_issues": [asdict(i) for i in issues],
            "overridable": all(i.overridable for i in issues),
        }


def _normalise(text):
    return re.sub(r"[^a-z0-9 -]", " ", (text or "").lower()).strip()


def _has_word(term, text):
    """Whole-word match, so 'statin' doesn't hit 'nystatin' and 'iron' doesn't hit 'spironolactone'."""
    return re.search(rf"(?<![a-z0-9-]){re.escape(term)}s?(?![a-z0-9-])", text) is not None


def _class_key(allergen):
    """Map 'Penicillins', 'penicillin allergy', 'NSAIDs' etc. to a DRUG_CLASS_MEMBERS key."""
    a = _normalise(allergen)
    for key in DRUG_CLASS_MEMBERS:
        if _has_word(key, a):
            return key
    return None


def allergy_matches(resident, drug_name):
    """Active drug allergies on `resident` that `drug_name` falls under."""
    drug = _normalise(drug_name)
    if not drug:
        return []
    matches = []
    for allergy in resident.allergies.filter(is_active=True, allergy_type="drug"):
        allergen = _normalise(allergy.allergen)
        if not allergen:
            continue
        direct = _has_word(allergen, drug) or _has_word(drug.split()[0], allergen)
        key = _class_key(allergy.allergen)
        in_class = key is not None and (
            _has_word(key, drug) or any(_has_word(m, drug) for m in DRUG_CLASS_MEMBERS[key])
        )
        if direct or in_class:
            matches.append(allergy)
    return matches


def check_allergies(resident, drug_name):
    issues = []
    for a in allergy_matches(resident, drug_name):
        reaction = f" (reaction: {a.reaction})" if a.reaction else ""
        issues.append(SafetyIssue(
            code="allergy",
            message=f"{resident.full_name} has a recorded {a.get_severity_display().lower()} allergy to "
                    f"{a.allergen}{reaction}. {drug_name} may cause a reaction.",
            overridable=a.severity not in NON_OVERRIDABLE_ALLERGY,
        ))
    return issues


def check_mar_dose(entry, medication):
    """Run before a MAR entry is recorded as given. `entry` is the existing instance or None."""
    from .models import MAREntry

    issues = check_allergies(medication.resident, medication.drug_name)
    if entry is not None and entry.status == MAREntry.Status.GIVEN:
        issues.append(SafetyIssue(
            code="duplicate_dose",
            message=f"This dose of {medication.drug_name} was already recorded as given"
                    f"{' by ' + entry.administered_by.get_full_name() if entry.administered_by else ''}.",
            overridable=False,
        ))
        return issues
    since = timezone.now() - DUPLICATE_WINDOW
    recent = MAREntry.objects.filter(medication=medication, status=MAREntry.Status.GIVEN, administered_at__gte=since)
    if entry is not None:
        recent = recent.exclude(pk=entry.pk)
    last = recent.order_by("-administered_at").first()
    if last:
        mins = int((timezone.now() - last.administered_at).total_seconds() // 60)
        issues.append(SafetyIssue(
            code="duplicate_dose",
            message=f"{medication.drug_name} was already given {mins} minute{'s' if mins != 1 else ''} ago. "
                    "Giving it again may be a double dose.",
            overridable=True,
        ))
    return issues


def _max_doses(text):
    """Parse a count-based 24h limit like '4 doses' or '3 times'. Amount-based limits ('4g') return None."""
    m = re.match(r"^\s*(\d+)\s*(doses?|times?|x|administrations?)?\s*(in|per|/|$)", (text or "").lower())
    if not m or (m.group(2) is None and m.group(3) != ""):
        return None
    return int(m.group(1))


def check_prn_dose(medication, administered_at):
    from .models import PRNAdministration

    issues = check_allergies(medication.resident, medication.drug_name)
    protocol = getattr(medication, "prn_protocol", None)
    if protocol is None:
        return issues
    prior = PRNAdministration.objects.filter(medication=medication, administered_at__lte=administered_at)

    last = prior.order_by("-administered_at").first()
    if last and protocol.min_interval_hours:
        gap = administered_at - last.administered_at
        if gap < timedelta(hours=protocol.min_interval_hours):
            hrs, mins = divmod(int(gap.total_seconds() // 60), 60)
            issues.append(SafetyIssue(
                code="prn_interval",
                message=f"Last {medication.drug_name} PRN dose was {hrs}h {mins}m ago — the protocol requires at "
                        f"least {protocol.min_interval_hours}h between doses.",
                overridable=True,
            ))

    limit = _max_doses(protocol.max_dose_per_24h)
    if limit is not None:
        given = prior.filter(administered_at__gt=administered_at - timedelta(hours=24)).count()
        if given >= limit:
            issues.append(SafetyIssue(
                code="prn_max_daily",
                message=f"{given} PRN doses of {medication.drug_name} already given in the last 24 hours — the "
                        f"protocol maximum is {protocol.max_dose_per_24h}.",
                overridable=True,
            ))
    return issues


def enforce(issues, override_reason, *, user, resident, drug_name):
    """Raise if there are issues the caller can't (or didn't) override; otherwise log the override."""
    if not issues:
        return ""
    if not override_reason or not all(i.overridable for i in issues):
        raise SafetyCheckFailed(issues)

    from apps.authentication.models import User
    from apps.notifications.services import notify

    summary = "; ".join(i.message for i in issues)
    managers = User.objects.filter(care_home=resident.care_home, role__in=["manager", "admin"], is_active=True)
    notify(
        managers.exclude(pk=user.pk), "medication",
        f"Safety override by {user.get_full_name() or user.username} for {resident.full_name} — {drug_name}: "
        f"{override_reason}"[:300],
        f"/dashboard/residents/{resident.pk}",
        email=True, email_subject="Medication safety override",
    )
    return f"[Safety override] {summary} Reason: {override_reason}"
