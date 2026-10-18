"""
Seed the operational modules (incidents, vitals, care notes, billing, pharmacy, ...)
on top of the core data created by `manage.py seed`.
Run: python manage.py seed_extras

Each section is skipped if its table already has rows, so re-running is safe.
"""
import random
from datetime import date, datetime, time, timedelta
from decimal import Decimal

from django.core.management.base import BaseCommand, CommandError
from django.db import transaction
from django.utils import timezone


def ago(days=0, hours=0, minutes=0):
    return timezone.now() - timedelta(days=days, hours=hours, minutes=minutes)


def ahead(days=0, hours=0):
    return timezone.now() + timedelta(days=days, hours=hours)


def at(d, hh, mm=0):
    return timezone.make_aware(datetime.combine(d, time(hh, mm)))


class Command(BaseCommand):
    help = "Seed operational demo data (requires `manage.py seed` to have run first)"

    def handle(self, *args, **options):
        from apps.staff.models import CareHome

        self.home = CareHome.objects.filter(cqc_registration_number="CQC-2024-DEMO").first()
        if not self.home:
            raise CommandError("Demo care home not found — run `python manage.py seed` first.")
        random.seed(42)
        self._load_people()
        sections = [
            ("Wings", self._wings),
            ("Allergies", self._allergies),
            ("Policies & accreditations", self._compliance),
            ("Incidents", self._incidents),
            ("Handover notes", self._handover),
            ("Vital signs", self._vitals),
            ("Care notes", self._care_notes),
            ("Visitors", self._visitors),
            ("Maintenance", self._maintenance),
            ("Activities", self._activities),
            ("Appointments", self._appointments),
            ("Body map", self._body_map),
            ("Training", self._training),
            ("Nutrition", self._nutrition),
            ("Falls risk", self._falls_risk),
            ("Overnight checks", self._overnight),
            ("Safeguarding", self._safeguarding),
            ("Staff messages", self._messages),
            ("Pharmacy", self._pharmacy),
            ("PRN", self._prn),
            ("Recruitment", self._recruitment),
            ("Leave", self._leave),
            ("Tasks", self._tasks),
            ("Enquiries", self._enquiries),
            ("Billing", self._billing),
            ("GP & hospital", self._gp),
            ("Family portal", self._family),
            ("Skills", self._skills),
            ("Devices", self._devices),
        ]
        for label, fn in sections:
            with transaction.atomic():
                created = fn()
            status = self.style.SUCCESS("seeded") if created else "skipped (already has data)"
            self.stdout.write(f"  {label}: {status}")

    # ── helpers ────────────────────────────────────────────────────────────────
    def _load_people(self):
        from apps.authentication.models import User
        from apps.residents.models import Resident

        by = {u.username: u for u in User.objects.filter(care_home=self.home)}
        self.manager = by["s.williams"]
        self.nurses = [by["j.okonkwo"], by["p.sharma"]]
        self.carers = [by["m.thompson"], by["e.chen"], by["d.adeyemi"]]
        self.hr = by["f.macleod"]
        self.admin = by["admin"]
        self.staff = [self.manager, *self.nurses, *self.carers, self.hr]
        self.clinical = [*self.nurses, *self.carers]
        self.residents = list(Resident.objects.filter(care_home=self.home, is_active=True).order_by("room_number"))
        if not self.residents:
            raise CommandError("No residents found — run `python manage.py seed` first.")

    def _r(self):
        return random.choice(self.residents)

    # ── sections ───────────────────────────────────────────────────────────────
    def _wings(self):
        from apps.staff.models import Wing

        if Wing.objects.filter(care_home=self.home).exists():
            return False
        wings = [
            Wing.objects.create(care_home=self.home, name="Rose Wing", floor="Ground", bed_count=12,
                                lead_staff=self.nurses[0], notes="Residential care, high-dependency rooms."),
            Wing.objects.create(care_home=self.home, name="Lavender Wing", floor="First", bed_count=12,
                                lead_staff=self.nurses[1], notes="Dementia-friendly unit with sensory garden access."),
            Wing.objects.create(care_home=self.home, name="Willow Wing", floor="Second", bed_count=8,
                                lead_staff=self.carers[0], notes="Nursing care and end-of-life suites."),
        ]
        for i, r in enumerate(self.residents):
            r.wing = wings[i % len(wings)]
            r.save(update_fields=["wing"])
        return True

    def _allergies(self):
        from apps.residents.models import Allergy

        if Allergy.objects.filter(resident__care_home=self.home).exists():
            return False
        rows = [
            (0, "Penicillins", "drug", "anaphylaxis", "Swollen lips, wheeze — admitted 2019"),
            (1, "Codeine", "drug", "moderate", "Severe nausea and confusion"),
            (2, "NSAIDs", "drug", "severe", "GI bleed"),
            (3, "Latex", "environmental", "mild", "Contact dermatitis"),
            (4, "Shellfish", "food", "severe", "Urticaria and facial swelling"),
            (5, "Sulfonamides", "drug", "moderate", "Widespread rash"),
        ]
        for idx, allergen, kind, severity, reaction in rows:
            if idx < len(self.residents):
                Allergy.objects.create(resident=self.residents[idx], allergen=allergen, allergy_type=kind,
                                       severity=severity, reaction=reaction, recorded_by=self.nurses[0])
        return True

    def _compliance(self):
        from apps.compliance.models import Accreditation, AuditAction, ComplianceAudit, Policy

        if Policy.objects.filter(care_home=self.home).exists():
            return False
        policies = [
            ("Safeguarding Adults Policy", "3.1", "Sets out how staff recognise, respond to and report suspected abuse or neglect, in line with the Care Act 2014 and local authority procedures."),
            ("Medication Management Policy", "4.0", "Covers ordering, storage, administration, recording and disposal of medicines, including controlled drugs and PRN protocols (NICE SC1)."),
            ("Infection Prevention & Control", "2.4", "Hand hygiene, PPE, outbreak management and cleaning schedules aligned with the Health and Social Care Act 2008 Code of Practice."),
            ("Falls Prevention & Management", "1.8", "Multifactorial falls risk assessment on admission and monthly; post-fall protocol including head-injury observations."),
            ("Whistleblowing Policy", "2.0", "How staff can raise concerns safely, internally or with the CQC, without fear of reprisal."),
            ("Data Protection & Confidentiality", "3.2", "UK GDPR and Data Protection Act 2018 obligations, subject access requests and breach reporting within 72 hours."),
        ]
        for i, (title, version, content) in enumerate(policies):
            Policy.objects.create(care_home=self.home, title=title, version=version, content=content,
                                  review_date=date.today() + timedelta(days=30 + i * 45), approved_by=self.manager)

        accreditations = [
            ("CQC Registration", "cqc", "Care Quality Commission", "certified", "CQC-2024-DEMO", -700, 400),
            ("Cyber Essentials", "cyber", "IASME", "expiring_soon", "CE-88231", -340, 25),
            ("Data Security & Protection Toolkit", "data_protection", "NHS England", "certified", "DSPT-8KX21", -120, 245),
            ("Fire Risk Assessment", "fire_safety", "Leicestershire Fire & Rescue", "certified", "FRA-2026-114", -60, 305),
            ("ISO 9001 Quality Management", "quality", "BSI", "in_progress", "", None, None),
        ]
        for name, cat, body, status, ref, start, end in accreditations:
            Accreditation.objects.create(
                care_home=self.home, name=name, category=cat, issuing_body=body, status=status,
                reference_number=ref,
                valid_from=date.today() + timedelta(days=start) if start is not None else None,
                valid_until=date.today() + timedelta(days=end) if end is not None else None,
            )

        actions = [
            ("Update PRN protocols for all residents on as-required analgesia", "high"),
            ("Complete outstanding fire marshal training for night staff", "critical"),
            ("Replace worn pressure-relieving cushion in room 2B", "medium"),
            ("Audit care plan review dates and reschedule overdue reviews", "medium"),
            ("Refresh hand hygiene signage in Lavender Wing", "low"),
        ]
        audits = list(ComplianceAudit.objects.all()[:5])
        for audit, (desc, prio) in zip(audits, actions):
            AuditAction.objects.create(audit=audit, description=desc, priority=prio,
                                       assigned_to=random.choice([self.manager, *self.nurses]),
                                       due_date=date.today() + timedelta(days=random.randint(-5, 30)),
                                       status=random.choice(["open", "in_progress", "complete"]))
        return True

    def _incidents(self):
        from apps.incidents.models import Incident, IncidentFollowUp

        if Incident.objects.filter(care_home=self.home).exists():
            return False
        rows = [
            ("fall", "high", "under_review", 2, "Bedroom", "Found on floor beside bed at 03:10. Alert, able to state she was trying to reach the bathroom.", "Neuro obs commenced, GP informed, sensor mat placed.", True, "Small bruise to left hip."),
            ("fall", "medium", "closed", 9, "Lounge", "Lost balance when standing from armchair. Staff witnessed, lowered to floor.", "Checked for injury, physio referral made.", False, ""),
            ("medication_error", "medium", "closed", 14, "Medication room", "Evening dose of Amlodipine omitted — MAR not signed and pack unopened at morning round.", "GP advised, no harm. Staff member completed reflective practice.", False, ""),
            ("near_miss", "low", "closed", 6, "Corridor, Rose Wing", "Wet floor without signage after spillage; resident nearly slipped.", "Floor dried, signage replaced, housekeeping reminded.", False, ""),
            ("behaviour", "medium", "open", 1, "Dining room", "Became agitated during lunch and pushed another resident's plate away. No contact made.", "De-escalated, moved to quieter area. ABC chart started.", False, ""),
            ("injury", "low", "open", 0, "Bathroom", "Skin tear to right forearm during assisted wash.", "Cleaned, Steri-Strips applied, body map updated.", True, "2cm skin tear, right forearm."),
            ("fall", "critical", "under_review", 4, "Garden path", "Unwitnessed fall in garden; complained of hip pain and unable to weight-bear.", "999 called, conveyed to Leicester Royal Infirmary. Family informed.", True, "Suspected fractured neck of femur."),
        ]
        for itype, sev, status, days, loc, desc, action, injured, inj_desc in rows:
            inc = Incident.objects.create(
                care_home=self.home, resident=self._r(), reported_by=random.choice(self.clinical),
                incident_type=itype, severity=sev, status=status, incident_date=ago(days, random.randint(1, 20)),
                location=loc, description=desc, immediate_action=action, injury_sustained=injured,
                injury_description=inj_desc, reported_to_gp=sev in ("high", "critical"),
                reported_to_family=sev != "low", reported_to_cqc=sev == "critical",
            )
            if status != "open":
                IncidentFollowUp.objects.create(incident=inc, actioned_by=self.manager,
                                                note="Reviewed with staff team; risk assessment and care plan updated.")
        return True

    def _handover(self):
        from apps.handover.models import HandoverNote

        if HandoverNote.objects.filter(care_home=self.home).exists():
            return False
        notes = [
            ("normal", "Quiet shift. All residents settled by 22:00. Fluid charts up to date."),
            ("urgent", "Room 1A: reduced fluid intake today (~700ml). Please encourage drinks and monitor urine output."),
            ("normal", "Hairdresser visiting Thursday 10:00 — six residents booked, list on the notice board."),
            ("critical", "Room 2B: temperature 38.4°C at 18:00, GP out-of-hours called. Repeat obs 4-hourly."),
            ("normal", "Pharmacy delivery received and checked in. Two items outstanding — chased with supplier."),
            ("urgent", "New admission arriving tomorrow 11:00 to room 4A. Bed made, welcome pack ready."),
        ]
        for d in range(7):
            for shift in ("day", "evening", "night"):
                prio, content = random.choice(notes)
                HandoverNote.objects.create(care_home=self.home, author=random.choice(self.clinical),
                                            shift=shift, date=date.today() - timedelta(days=d),
                                            priority=prio, content=content)
        return True

    def _vitals(self):
        from apps.vitals.models import VitalSign

        if VitalSign.objects.filter(resident__care_home=self.home).exists():
            return False
        rows = []
        for r in self.residents:
            base_sys = random.randint(118, 150)
            weight = Decimal(random.randint(48, 88))
            for d in range(0, 14, 2):
                rows.append(VitalSign(
                    resident=r, recorded_by=random.choice(self.nurses), recorded_at=ago(d, random.randint(1, 10)),
                    bp_systolic=base_sys + random.randint(-10, 12), bp_diastolic=random.randint(68, 92),
                    pulse=random.randint(60, 98), temperature=Decimal(str(round(random.uniform(36.2, 37.6), 1))),
                    oxygen_saturation=random.randint(93, 99), weight=weight - Decimal(d) / 10,
                    blood_glucose=Decimal(str(round(random.uniform(4.5, 8.5), 1))) if random.random() < 0.3 else None,
                ))
        VitalSign.objects.bulk_create(rows)
        return True

    def _care_notes(self):
        from apps.care_notes.models import CareNote

        if CareNote.objects.filter(resident__care_home=self.home).exists():
            return False
        samples = {
            "personal_care": "Assisted with full wash and dressing. Skin intact, cream applied to heels.",
            "nutrition": "Ate most of breakfast (porridge and toast). Encouraged fluids — 3 cups of tea.",
            "mobility": "Walked to the lounge with frame and one carer. Steady on feet today.",
            "mood": "Bright and chatty this morning, enjoyed talking about her grandchildren.",
            "sleep": "Slept well. Checked hourly, repositioned at 02:00 and 05:00.",
            "health": "Complained of mild headache, paracetamol given per PRN protocol. Settled after 40 mins.",
            "social": "Joined the music session in the lounge and sang along to several songs.",
            "general": "Daughter visited in the afternoon. Room tidied and laundry put away.",
        }
        moods = ["good", "good", "okay", "okay", "low", "agitated"]
        rows = []
        for r in self.residents:
            for d in range(5):
                for shift, hour in (("day", 10), ("evening", 18), ("night", 2)):
                    cat = random.choice(list(samples))
                    rows.append(CareNote(resident=r, author=random.choice(self.clinical), shift=shift,
                                         category=cat, content=samples[cat], mood=random.choice(moods),
                                         recorded_at=at(date.today() - timedelta(days=d), hour, random.randint(0, 59))))
        CareNote.objects.bulk_create(rows)
        return True

    def _visitors(self):
        from apps.visitors.models import VisitorLog

        if VisitorLog.objects.filter(resident__care_home=self.home).exists():
            return False
        for r in self.residents:
            for d in random.sample(range(10), 2):
                start = ago(d, random.randint(2, 8))
                VisitorLog.objects.create(
                    resident=r, visitor_name=r.next_of_kin_name or "Family visitor", relationship="Family",
                    phone=r.next_of_kin_phone, signed_in=start,
                    signed_out=start + timedelta(minutes=random.randint(30, 120)) if d else None,
                    purpose="Social visit", health_screening_passed=True, logged_by=random.choice(self.carers),
                )
        return True

    def _maintenance(self):
        from apps.maintenance.models import MaintenanceIssue

        if MaintenanceIssue.objects.filter(care_home=self.home).exists():
            return False
        issues = [
            ("heating", "Radiator not heating in room 3A", "Resident reports room is cold; radiator cold to touch.", "Room 3A", "high", "in_progress"),
            ("equipment", "Hoist battery not holding charge", "Ceiling hoist in Willow Wing stops mid-transfer.", "Willow Wing", "urgent", "open"),
            ("plumbing", "Dripping tap in assisted bathroom", "Hot tap drips continuously.", "Bathroom 2, Rose Wing", "low", "resolved"),
            ("electrical", "Call bell intermittent in room 1B", "Call bell sometimes fails to register at the nurse station.", "Room 1B", "urgent", "in_progress"),
            ("safety", "Fire door not closing fully", "Fire door at top of stairs sticks on the frame.", "First floor landing", "high", "open"),
            ("cleaning", "Carpet stain in lounge", "Large coffee stain near the window seating.", "Main lounge", "low", "closed"),
        ]
        for cat, title, desc, loc, prio, status in issues:
            done = status in ("resolved", "closed")
            MaintenanceIssue.objects.create(
                care_home=self.home, reported_by=random.choice(self.staff), assigned_to="Tom (Maintenance)",
                category=cat, title=title, description=desc, location=loc, priority=prio, status=status,
                resolved_at=ago(random.randint(1, 5)) if done else None,
                resolution_notes="Repaired and tested." if done else "",
            )
        return True

    def _activities(self):
        from apps.activities.models import Activity, ActivityAttendance

        if Activity.objects.filter(care_home=self.home).exists():
            return False
        plan = [
            ("Chair Yoga", "group", time(10, 30), 45, "Main lounge"),
            ("Music & Memories", "group", time(14, 0), 60, "Main lounge"),
            ("Garden Club", "group", time(11, 0), 60, "Sensory garden"),
            ("Hand Massage & Nails", "one_to_one", time(15, 0), 30, "Residents' rooms"),
            ("Trip to Abbey Park", "external", time(10, 0), 180, "Abbey Park, Leicester"),
            ("Video Call with Family", "virtual", time(16, 0), 30, "Quiet room"),
            ("Baking Afternoon", "group", time(14, 30), 90, "Activity kitchen"),
            ("Quiz & Reminiscence", "group", time(15, 0), 60, "Conservatory"),
        ]
        for offset in range(-7, 8, 2):
            name, kind, t, dur, loc = random.choice(plan)
            day = date.today() + timedelta(days=offset)
            act = Activity.objects.create(care_home=self.home, name=name, activity_type=kind,
                                          organiser=random.choice(self.carers), scheduled_date=day,
                                          scheduled_time=t, duration_minutes=dur, location=loc,
                                          description=f"{name} session for residents.", is_completed=offset < 0)
            if offset < 0:
                for r in random.sample(self.residents, min(5, len(self.residents))):
                    ActivityAttendance.objects.create(activity=act, resident=r,
                                                      attended=random.random() > 0.15,
                                                      mood=random.choice(["great", "good", "good", "okay", "low"]))
        return True

    def _appointments(self):
        from apps.appointments.models import Appointment

        if Appointment.objects.filter(resident__care_home=self.home).exists():
            return False
        providers = [
            ("gp", "Dr. Patel — Knighton Surgery", "Knighton Surgery"),
            ("hospital", "Leicester Royal Infirmary — Cardiology", "Leicester Royal Infirmary"),
            ("dentist", "Smile Dental Care", "Queens Road, Leicester"),
            ("optician", "Specsavers Home Visits", "In home"),
            ("physio", "Community Physiotherapy Team", "In home"),
            ("specialist", "Memory Clinic — Dr. Evans", "Brandon Unit, LGH"),
        ]
        for i in range(14):
            kind, provider, loc = random.choice(providers)
            offset = random.randint(-20, 25)
            past = offset < 0
            Appointment.objects.create(
                resident=self._r(), appointment_type=kind, provider_name=provider, location=loc,
                scheduled_at=ahead(offset, random.randint(1, 6)),
                status=random.choice(["completed", "completed", "dna", "cancelled"]) if past else "scheduled",
                outcome="Reviewed, no changes to treatment." if past else "",
                escort_required=kind in ("hospital", "specialist"), transport_arranged=kind == "hospital",
                created_by=random.choice([self.manager, *self.nurses]),
            )
        return True

    def _body_map(self):
        from apps.body_map.models import WoundAssessment, WoundRecord

        if WoundRecord.objects.filter(resident__care_home=self.home).exists():
            return False
        wounds = [
            ("pressure_ulcer", "2", "back", 0.48, 0.78, "Sacrum", "Grade 2 pressure ulcer, partial-thickness skin loss."),
            ("skin_tear", "", "front", 0.78, 0.45, "Right forearm", "2cm skin tear following assisted wash."),
            ("bruise", "", "left", 0.5, 0.55, "Left hip", "Bruising following fall, approx 6cm diameter."),
            ("pressure_ulcer", "1", "back", 0.42, 0.95, "Left heel", "Non-blanching erythema to left heel."),
        ]
        for wtype, grade, side, x, y, label, desc in wounds:
            w = WoundRecord.objects.create(resident=self._r(), wound_type=wtype, grade=grade, body_side=side,
                                           location_x=x, location_y=y, location_label=label, description=desc,
                                           first_observed=date.today() - timedelta(days=random.randint(3, 20)),
                                           created_by=random.choice(self.nurses))
            for k in range(2):
                WoundAssessment.objects.create(
                    wound=w, assessed_by=random.choice(self.nurses),
                    assessment_date=w.first_observed + timedelta(days=k * 3),
                    length_cm=Decimal("3.0") - k, width_cm=Decimal("2.0") - Decimal("0.5") * k,
                    appearance="Granulating, no signs of infection.", treatment="Cleansed with saline.",
                    dressing_used="Allevyn foam", next_review=date.today() + timedelta(days=3),
                )
        return True

    def _training(self):
        from apps.training.models import StaffTrainingRecord, TrainingCourse

        if TrainingCourse.objects.filter(care_home=self.home).exists():
            return False
        courses = [
            ("Fire Safety Awareness", "fire", 12), ("Moving & Handling", "moving_handling", 12),
            ("Safeguarding Adults Level 2", "safeguarding", 36), ("Infection Prevention & Control", "infection_control", 12),
            ("Dementia Awareness", "dementia", 36), ("Emergency First Aid at Work", "first_aid", 36),
            ("Safe Handling of Medicines", "medication", 12), ("Mental Capacity Act & DoLS", "mental_health", 36),
        ]
        objs = [TrainingCourse.objects.create(care_home=self.home, name=n, category=c, is_mandatory=True,
                                              recurrence_months=m) for n, c, m in courses]
        for s in self.staff:
            for c in objs:
                if c.category == "medication" and s not in self.nurses:
                    continue
                done = date.today() - timedelta(days=random.randint(20, 420))
                StaffTrainingRecord.objects.create(staff_member=s, course=c, course_name=c.name, completed_date=done,
                                                   expiry_date=done + timedelta(days=30 * c.recurrence_months),
                                                   provider="Cura Learning Hub")
        return True

    def _nutrition(self):
        from apps.nutrition.models import FluidRecord, MealRecord, PEGChart, PEGFeedRecord

        if FluidRecord.objects.filter(resident__care_home=self.home).exists():
            return False
        fluids, meals = [], []
        for r in self.residents:
            for d in range(3):
                day = date.today() - timedelta(days=d)
                for hour in (8, 10, 12, 15, 18, 20):
                    fluids.append(FluidRecord(resident=r, recorded_by=random.choice(self.carers),
                                              recorded_at=at(day, hour), amount_ml=random.choice([100, 150, 200, 250]),
                                              fluid_type=random.choice(["water", "tea", "tea", "juice", "milk"])))
                for meal, hour in (("breakfast", 8), ("lunch", 12), ("dinner", 17)):
                    pct = random.choice([25, 50, 75, 100, 100])
                    meals.append(MealRecord(resident=r, recorded_by=random.choice(self.carers),
                                            recorded_at=at(day, hour, 30), meal_type=meal, completion_percent=pct,
                                            appetite="good" if pct >= 75 else "fair" if pct >= 50 else "poor"))
        FluidRecord.objects.bulk_create(fluids)
        MealRecord.objects.bulk_create(meals)

        peg = PEGChart.objects.create(resident=self.residents[-1], tube_type="peg", tube_size_fr="15",
                                      insertion_date=date.today() - timedelta(days=200),
                                      feed_regimen="Nutrison 1.5 — 1000ml over 16 hours", feed_rate_ml_per_hr=Decimal("62.5"),
                                      water_flush_ml=50, dietitian_name="Laura Bennett",
                                      next_tube_change_due=date.today() + timedelta(days=160),
                                      created_by=self.nurses[0])
        for h in range(0, 24, 4):
            PEGFeedRecord.objects.create(peg_chart=peg, recorded_by=random.choice(self.nurses), recorded_at=ago(0, h),
                                         entry_type="flush" if h % 8 else "feed", volume_ml=50 if h % 8 else 250,
                                         site_condition="normal")
        return True

    def _falls_risk(self):
        from apps.falls_risk.models import FallsRiskAssessment

        if FallsRiskAssessment.objects.filter(resident__care_home=self.home).exists():
            return False
        for r in self.residents:
            history = r.fall_risk in ("high", "critical")
            score = (25 if history else 0) + 15 + random.choice([0, 15, 30]) + random.choice([0, 10, 20])
            level = "high" if score >= 45 else "medium" if score >= 25 else "low"
            FallsRiskAssessment.objects.create(
                resident=r, assessed_by=random.choice(self.nurses),
                assessment_date=date.today() - timedelta(days=random.randint(1, 28)),
                history_of_falls=history, secondary_diagnosis=True,
                ambulatory_aid=random.choice(["none", "crutches", "furniture"]),
                gait=random.choice(["normal", "weak", "impaired"]), mental_status=random.choice(["oriented", "overestimates"]),
                total_score=score, risk_level=level,
                action_plan="Sensor mat at night, hourly checks, walking frame within reach." if level == "high" else "Monthly review.",
                next_review_date=date.today() + timedelta(days=random.randint(3, 30)),
            )
        return True

    def _overnight(self):
        from apps.overnight_checks.models import OvernightCheck

        if OvernightCheck.objects.filter(resident__care_home=self.home).exists():
            return False
        rows = []
        night = date.today() - timedelta(days=1)
        for r in self.residents:
            for hour in (22, 23, 0, 1, 2, 3, 4, 5):
                d = night if hour >= 22 else date.today()
                rows.append(OvernightCheck(resident=r, checked_by=random.choice(self.carers), check_time=at(d, hour),
                                           status=random.choice(["asleep"] * 6 + ["awake", "repositioned", "toileted", "unsettled"])))
        OvernightCheck.objects.bulk_create(rows)
        return True

    def _safeguarding(self):
        from apps.safeguarding.models import SafeguardingConcern

        if SafeguardingConcern.objects.filter(resident__care_home=self.home).exists():
            return False
        SafeguardingConcern.objects.create(
            resident=self.residents[1], raised_by=self.nurses[0], category="financial",
            date_raised=date.today() - timedelta(days=12),
            description="Resident disclosed that a relative has been withdrawing money from her account without consent.",
            immediate_action_taken="Manager informed, resident reassured, details documented verbatim.",
            referred_to_authority=True, referral_date=date.today() - timedelta(days=11),
            referral_reference="LCC-SG-48211", status="investigating",
        )
        SafeguardingConcern.objects.create(
            resident=self.residents[3], raised_by=self.carers[1], category="neglect",
            date_raised=date.today() - timedelta(days=40),
            description="Unexplained weight loss noted on return from 2-week hospital stay.",
            immediate_action_taken="GP review, MUST screen completed, food chart commenced.",
            outcome="Hospital investigation completed; no neglect found. Dietitian input arranged.",
            status="closed", closed_date=date.today() - timedelta(days=10),
        )
        return True

    def _messages(self):
        from apps.messages_board.models import StaffMessage

        if StaffMessage.objects.filter(care_home=self.home).exists():
            return False
        msgs = [
            ("general", "Reminder: staff BBQ this Saturday from 2pm in the garden — families welcome!", False),
            ("clinical", "Flu vaccination clinic for residents on Tuesday morning. Consent forms in the nurses' office.", True),
            ("management", "CQC inspection window opens next month. Please make sure your training is up to date.", True),
            ("handover", "Room 2B family asked to be called if any change in condition, any time.", False),
            ("urgent", "Lift out of service until engineer visit at 14:00 — use the Willow Wing lift.", False),
            ("general", "Thank you everyone for the lovely feedback from the Clarke family this week.", False),
        ]
        for channel, content, pinned in msgs:
            StaffMessage.objects.create(care_home=self.home, author=random.choice(self.staff), channel=channel,
                                        content=content, is_pinned=pinned)
        return True

    def _pharmacy(self):
        from apps.pharmacy.models import (ControlledDrugRegister, MedicationStock, PurchaseOrder,
                                          PurchaseOrderItem, Supplier)

        if Supplier.objects.filter(care_home=self.home).exists():
            return False
        boots = Supplier.objects.create(care_home=self.home, name="Boots Care Services", contact_name="Helen Price",
                                        phone="0115 950 6111", email="careservices@boots.example",
                                        address="1 Thane Road, Nottingham, NG90 1BS")
        local = Supplier.objects.create(care_home=self.home, name="Knighton Pharmacy", contact_name="Raj Mistry",
                                        phone="0116 270 1234", email="orders@knightonpharmacy.example",
                                        address="45 Knighton Road, Leicester, LE2 3HL")
        stock = {}
        for name, qty, unit, threshold, sup in [
            ("Paracetamol 500mg", 420, "tablets", 100, boots), ("Amlodipine 5mg", 60, "tablets", 56, boots),
            ("Metformin 500mg", 180, "tablets", 112, boots), ("Lactulose 3.35g/5ml", 2, "bottles", 3, local),
            ("Morphine Sulfate 10mg/5ml", 1, "bottles", 1, local), ("Senna 7.5mg", 30, "tablets", 60, boots),
            ("Cetraben Cream", 8, "tubs", 4, local), ("Fortisip Compact", 24, "bottles", 30, local),
        ]:
            stock[name] = MedicationStock.objects.create(care_home=self.home, medication_name=name, supplier=sup,
                                                         quantity_on_hand=qty, unit=unit, reorder_threshold=threshold,
                                                         last_restocked=ago(random.randint(3, 25)))
        orders = [
            ("PO-1001", boots, "delivered", ["Paracetamol 500mg", "Metformin 500mg"], -14),
            ("PO-1002", local, "dispatched", ["Lactulose 3.35g/5ml", "Fortisip Compact"], -2),
            ("PO-1003", boots, "draft", ["Senna 7.5mg", "Amlodipine 5mg"], 0),
        ]
        for ref, sup, status, items, days in orders:
            po = PurchaseOrder.objects.create(
                care_home=self.home, supplier=sup, reference=ref, status=status, ordered_by=self.nurses[0],
                ordered_at=ago(-days) if status != "draft" else None,
                expected_delivery=date.today() + timedelta(days=days + 3),
                delivered_at=ago(-days - 2) if status == "delivered" else None,
            )
            for n in items:
                q = Decimal(random.choice([56, 112, 168]))
                PurchaseOrderItem.objects.create(purchase_order=po, medication_stock=stock[n], medication_name=n,
                                                 quantity_ordered=q, unit=stock[n].unit, unit_cost=Decimal("0.12"),
                                                 quantity_received=q if status == "delivered" else 0)

        # Controlled drug register — running balance for one oral morphine bottle (ml)
        balance = Decimal("100")
        r = self.residents[0]
        ControlledDrugRegister.objects.create(care_home=self.home, medication_name="Morphine Sulfate 10mg/5ml",
                                              entry_type="received", quantity=balance, balance_after=balance,
                                              witnessed_by=self.nurses[1], recorded_by=self.nurses[0],
                                              recorded_at=ago(10), notes="Received from Knighton Pharmacy.")
        for d in range(9, 0, -1):
            balance -= Decimal("2.5")
            ControlledDrugRegister.objects.create(care_home=self.home, medication_name="Morphine Sulfate 10mg/5ml",
                                                  resident=r, entry_type="administered", quantity=Decimal("2.5"),
                                                  balance_after=balance, witnessed_by=self.nurses[1],
                                                  recorded_by=self.nurses[0], recorded_at=ago(d, 4))
        return True

    def _prn(self):
        from apps.medications.models import Medication, PRNAdministration, PRNProtocol

        if PRNProtocol.objects.filter(medication__resident__care_home=self.home).exists():
            return False
        prn_drugs = [
            ("Paracetamol", "1g", "Mild to moderate pain or pyrexia.", "4 doses", 4, "Pain score reduced within 1 hour."),
            ("Lorazepam", "0.5mg", "Acute agitation or distress not relieved by non-drug approaches.", "2 doses", 6,
             "Resident calmer within 45 minutes; record behaviour on ABC chart."),
            ("Lactulose", "10ml", "No bowel movement for 3 days.", "2 doses", 12, "Bowels open within 48 hours."),
            ("Salbutamol inhaler", "2 puffs", "Wheeze or shortness of breath.", "4 doses", 4, "Breathing eased, SpO2 ≥ 94%."),
        ]
        for r, (name, dose, indication, max24, interval, criteria) in zip(self.residents, prn_drugs):
            med = Medication.objects.create(
                resident=r, drug_name=name, dose=dose, route="inhaled" if "inhaler" in name else "oral",
                frequency="prn", prescribed_by=r.gp_name or "Dr. Patel", start_date=date.today() - timedelta(days=60),
                stock_count=40, reorder_threshold=10, is_psychotropic=name == "Lorazepam",
            )
            PRNProtocol.objects.create(medication=med, indication=indication, max_dose_per_24h=max24,
                                       min_interval_hours=interval, effectiveness_criteria=criteria,
                                       created_by=self.nurses[0])
            for d in (5, 3, 1):
                PRNAdministration.objects.create(medication=med, administered_by=random.choice(self.nurses),
                                                 administered_at=ago(d, random.randint(2, 12)),
                                                 reason=indication.split(".")[0], dose_given=dose,
                                                 effectiveness=random.choice(["effective", "effective", "partial", "not_assessed"]))
        return True

    def _recruitment(self):
        from apps.recruitment.models import Applicant, JobPosting

        if JobPosting.objects.filter(care_home=self.home).exists():
            return False
        jobs = [
            ("Senior Care Assistant (Nights)", "Care", "full_time", "£12.80–£13.50/hr", "open"),
            ("Registered Nurse (RGN)", "Nursing", "full_time", "£40,000–£44,000", "open"),
            ("Activities Coordinator", "Wellbeing", "part_time", "£11.90/hr", "closed"),
        ]
        names = [("Grace", "Mwangi"), ("Tom", "Hughes"), ("Aisha", "Begum"), ("Oliver", "Grant"),
                 ("Chloe", "Wright"), ("Samuel", "Osei"), ("Hannah", "Lees"), ("Kofi", "Mensah")]
        statuses = ["applied", "shortlisted", "interviewed", "offered", "rejected"]
        for title, dept, ctype, salary, status in jobs:
            job = JobPosting.objects.create(care_home=self.home, title=title, department=dept, contract_type=ctype,
                                            salary_range=salary, status=status, created_by=self.hr,
                                            description=f"We're looking for a compassionate {title} to join Sunrise Care Home.",
                                            posted_date=date.today() - timedelta(days=21),
                                            closing_date=date.today() + timedelta(days=14))
            for first, last in random.sample(names, 3):
                st = random.choice(statuses)
                Applicant.objects.create(job_posting=job, first_name=first, last_name=last,
                                         email=f"{first.lower()}.{last.lower()}@example.com", phone="07700 900" + str(random.randint(100, 999)),
                                         status=st, interview_date=ahead(random.randint(1, 10)) if st == "shortlisted" else None,
                                         right_to_work_verified=st in ("interviewed", "offered"),
                                         dbs_check_requested=st == "offered", updated_by=self.hr)
        return True

    def _leave(self):
        from apps.leave.models import LeaveBalance, LeaveRequest, LeaveType

        if LeaveType.objects.filter(care_home=self.home).exists():
            return False
        annual = LeaveType.objects.create(care_home=self.home, name="Annual Leave", days_entitlement=28, color="#0d9488")
        sick = LeaveType.objects.create(care_home=self.home, name="Sick Leave", days_entitlement=10, color="#dc2626")
        LeaveType.objects.create(care_home=self.home, name="Compassionate Leave", days_entitlement=5, color="#7c3aed")
        year = date.today().year
        for s in self.staff:
            used = random.randint(4, 18)
            LeaveBalance.objects.create(staff_member=s, leave_type=annual, year=year, entitlement=28, used=used)
            LeaveBalance.objects.create(staff_member=s, leave_type=sick, year=year, entitlement=10, used=random.randint(0, 3))
            start = date.today() + timedelta(days=random.randint(-30, 45))
            days = random.randint(1, 5)
            st = "pending" if start > date.today() and random.random() < 0.6 else random.choice(["approved", "declined"])
            LeaveRequest.objects.create(staff_member=s, leave_type=annual, start_date=start,
                                        end_date=start + timedelta(days=days - 1), days_requested=days,
                                        reason="Family holiday", status=st,
                                        reviewed_by=self.manager if st != "pending" else None,
                                        reviewed_at=ago(2) if st != "pending" else None)
        return True

    def _tasks(self):
        from apps.tasks.models import Task

        if Task.objects.filter(care_home=self.home).exists():
            return False
        tasks = [
            ("Complete monthly weights", "care", "medium"), ("Order incontinence supplies", "admin", "high"),
            ("Review care plan for room 2B", "care", "high"), ("Check fire extinguisher tags", "safety", "medium"),
            ("Chase GP for medication review", "medication", "urgent"), ("Update resident photo consent forms", "admin", "low"),
            ("Book podiatrist visit", "care", "low"), ("Test emergency lighting", "maintenance", "medium"),
            ("Audit MAR charts for gaps", "medication", "high"), ("Arrange birthday celebration for room 1A", "general", "low"),
        ]
        for title, cat, prio in tasks:
            st = random.choice(["pending", "pending", "in_progress", "completed"])
            Task.objects.create(care_home=self.home, title=title, category=cat, priority=prio, status=st,
                                assigned_to=random.choice(self.staff), created_by=self.manager,
                                resident=self._r() if cat == "care" else None,
                                due_date=ahead(random.randint(-3, 10)),
                                completed_at=ago(random.randint(0, 3)) if st == "completed" else None)
        return True

    def _enquiries(self):
        from apps.enquiries.models import Enquiry, PreAdmissionAssessment

        if Enquiry.objects.filter(care_home=self.home).exists():
            return False
        rows = [
            ("Joan Whitfield", "1939-05-18", "Karen Whitfield", "Daughter", "self_funded", "assessment_booked", "Moderate dementia, needs support with personal care and medication."),
            ("Harold Bennett", "1936-12-02", "Mark Bennett", "Son", "local_authority", "new", "Recent stroke, left-sided weakness, requires hoist."),
            ("Margaret Lyle", "1942-02-27", "Social Worker — LCC", "Professional", "local_authority", "waitlisted", "Respite care for 4 weeks while carer recovers from surgery."),
            ("Stanley Moore", "1945-08-09", "June Moore", "Wife", "mixed", "in_progress", "Parkinson's disease, falls at home, increasing care needs."),
            ("Irene Cole", "1934-04-14", "Paul Cole", "Nephew", "self_funded", "declined", "Requires 1:1 nursing beyond current staffing."),
        ]
        for name, dob, contact, rel, funding, status, needs in rows:
            enq = Enquiry.objects.create(
                care_home=self.home, prospective_resident_name=name, date_of_birth=date.fromisoformat(dob),
                contact_name=contact, contact_relationship=rel, contact_phone="07800 2" + str(random.randint(10000, 99999)),
                care_needs=needs, funding_type=funding, status=status,
                enquiry_date=date.today() - timedelta(days=random.randint(1, 30)),
                assessment_date=ahead(4, 3) if status == "assessment_booked" else None, assigned_to=self.manager,
            )
            if status in ("in_progress", "declined"):
                PreAdmissionAssessment.objects.create(
                    enquiry=enq, assessment_date=date.today() - timedelta(days=3), assessor=self.nurses[0],
                    mobility_needs="Walking frame, 1 carer for transfers.", medical_needs=needs,
                    cognitive_assessment="MMSE 21/30.", social_needs="Enjoys gardening and music.",
                    outcome="suitable" if status == "in_progress" else "not_suitable",
                )
        return True

    def _billing(self):
        from apps.billing.models import FundingSource, Invoice, InvoiceItem, Payment

        if FundingSource.objects.filter(resident__care_home=self.home).exists():
            return False
        first_of_month = date.today().replace(day=1)
        last_month_start = (first_of_month - timedelta(days=1)).replace(day=1)
        n = 1
        for r in self.residents:
            ftype = random.choice(["self_funded", "local_authority", "local_authority", "nhs", "mixed"])
            rate = Decimal(random.choice([980, 1150, 1240, 1385]))
            FundingSource.objects.create(resident=r, funding_type=ftype, weekly_rate=rate,
                                         funder_name={"local_authority": "Leicester City Council", "nhs": "NHS LLR ICB"}.get(ftype, ""),
                                         start_date=r.admission_date or date.today() - timedelta(days=365))
            for start, status in ((last_month_start, random.choice(["paid", "paid", "overdue"])), (first_of_month, "sent")):
                end = (start + timedelta(days=32)).replace(day=1) - timedelta(days=1)
                weeks = Decimal(((end - start).days + 1)) / 7
                fee = (rate * weeks).quantize(Decimal("0.01"))
                extras = Decimal("45.00")
                inv = Invoice.objects.create(
                    care_home=self.home, resident=r, invoice_number=f"INV-{start:%Y%m}-{n:03d}",
                    period_start=start, period_end=end, issue_date=start, due_date=start + timedelta(days=30),
                    status=status, subtotal=fee + extras, tax=Decimal("0"), total=fee + extras, created_by=self.admin,
                )
                n += 1
                InvoiceItem.objects.create(invoice=inv, description=f"Residential care — {weeks:.2f} weeks",
                                           quantity=weeks.quantize(Decimal("0.01")), unit_price=rate, line_total=fee)
                InvoiceItem.objects.create(invoice=inv, description="Hairdressing & chiropody", quantity=1,
                                           unit_price=extras, line_total=extras)
                if status == "paid":
                    Payment.objects.create(invoice=inv, amount=inv.total, payment_method="bank_transfer",
                                           payment_date=start + timedelta(days=random.randint(5, 25)),
                                           reference=f"BACS-{inv.invoice_number}", recorded_by=self.admin)
        return True

    def _gp(self):
        from apps.gp_integration.models import DischargeSummary, GPContact, HospitalContact, Referral

        if GPContact.objects.filter(care_home=self.home).exists():
            return False
        GPContact.objects.create(care_home=self.home, practice_name="Knighton Surgery", gp_name="Dr. Anita Patel",
                                 phone="0116 270 5049", email="knighton.surgery@nhs.example",
                                 address="12 Knighton Church Road, Leicester, LE2 3JH")
        GPContact.objects.create(care_home=self.home, practice_name="Clarendon Park Medical Centre", gp_name="Dr. Michael Hart",
                                 phone="0116 270 8932", address="70 Clarendon Park Road, Leicester, LE2 3AF")
        lri = HospitalContact.objects.create(care_home=self.home, hospital_name="Leicester Royal Infirmary",
                                             department="Acute Medicine", phone="0300 303 1573",
                                             address="Infirmary Square, Leicester, LE1 5WW")
        HospitalContact.objects.create(care_home=self.home, hospital_name="Leicester General Hospital",
                                       department="Elderly Care", phone="0300 303 1573",
                                       address="Gwendolen Road, Leicester, LE5 4PW")
        DischargeSummary.objects.create(
            resident=self.residents[3], hospital=lri, admission_date=date.today() - timedelta(days=18),
            discharge_date=date.today() - timedelta(days=6), diagnosis="Community-acquired pneumonia.",
            treatment_summary="IV antibiotics for 5 days, stepped down to oral amoxicillin.",
            follow_up_actions="GP review in 1 week; repeat chest X-ray in 6 weeks.", status="action_required",
            received_at=ago(6),
        )
        for rtype, to, reason, urgency, status in [
            ("physio", "Community Physiotherapy", "Reduced mobility following fall.", "routine", "appointment_booked"),
            ("mental_health", "Older Persons Mental Health Team", "Increasing low mood and withdrawal.", "urgent", "sent"),
            ("specialist", "Tissue Viability Nurse", "Grade 2 pressure ulcer not healing.", "urgent", "acknowledged"),
            ("community", "Speech & Language Therapy", "Coughing during meals — swallow assessment.", "routine", "pending"),
        ]:
            Referral.objects.create(resident=self._r(), referral_type=rtype, referred_to=to, reason=reason,
                                    urgency=urgency, status=status, referred_by=random.choice(self.nurses),
                                    referral_date=date.today() - timedelta(days=random.randint(1, 14)),
                                    appointment_date=ahead(5) if status == "appointment_booked" else None)
        return True

    def _family(self):
        from apps.family_portal.models import FamilyMember, FamilyMessage

        if FamilyMember.objects.filter(resident__care_home=self.home).exists():
            return False
        for r in self.residents:
            if not r.next_of_kin_name:
                continue
            first, _, last = r.next_of_kin_name.partition(" ")
            fm = FamilyMember.objects.create(resident=r, first_name=first, last_name=last or r.last_name,
                                             relationship="child", phone=r.next_of_kin_phone,
                                             email=f"{first.lower()}.{(last or r.last_name).lower()}@example.com",
                                             is_primary_contact=True, is_emergency_contact=True, portal_access=True)
            FamilyMessage.objects.create(resident=r, family_member=fm, direction="inbound",
                                         subject=f"How is {r.first_name} doing?",
                                         body=f"Hi, just checking in on {r.first_name} this week. Any news from the GP?",
                                         status=random.choice(["unread", "read", "replied"]))
            FamilyMessage.objects.create(resident=r, family_member=fm, direction="outbound", sent_by_staff=self.manager,
                                         subject=f"Update on {r.first_name}",
                                         body=f"{r.first_name} has had a settled week and enjoyed the music session on Tuesday.",
                                         status="read")
        return True

    def _skills(self):
        from apps.skills.models import Skill, StaffSkill

        if Skill.objects.filter(care_home=self.home).exists():
            return False
        defs = [
            ("Catheter care", "clinical", True), ("Venepuncture", "clinical", False), ("Syringe driver", "clinical", False),
            ("Dementia communication", "communication", True), ("Hoist operation", "care", True),
            ("End-of-life care", "care", False), ("Rota planning", "leadership", False), ("Cura system super-user", "technical", False),
        ]
        skills = [Skill.objects.create(care_home=self.home, name=n, category=c, is_mandatory=m) for n, c, m in defs]
        for s in self.staff:
            for sk in random.sample(skills, 4):
                StaffSkill.objects.create(staff_member=s, skill=sk,
                                          proficiency=random.choice(["beginner", "competent", "proficient", "expert"]),
                                          certified=random.random() < 0.5, verified_by=self.manager,
                                          acquired_date=date.today() - timedelta(days=random.randint(30, 900)))
        return True

    def _devices(self):
        from apps.devices.models import Device, DeviceReading

        if Device.objects.filter(care_home=self.home).exists():
            return False
        for i, r in enumerate(self.residents[:6]):
            kind = ["bed_sensor", "wearable", "fall_sensor"][i % 3]
            dev = Device.objects.create(care_home=self.home, resident=r, name=f"{kind.replace('_', ' ').title()} — Room {r.room_number}",
                                        device_type=kind, external_id=f"DEMO-{kind[:3].upper()}-{1000 + i}",
                                        manufacturer=random.choice(["Tunstall", "Alertacall", "Vayyar"]),
                                        battery_level=random.randint(18, 100), last_seen_at=ago(0, 0, random.randint(1, 50)),
                                        created_by=self.admin)
            for h in range(0, 12, 3):
                DeviceReading.objects.create(device=dev, reading_type="motion" if kind != "wearable" else "vitals",
                                             recorded_at=ago(0, h),
                                             data={"pulse": random.randint(60, 90)} if kind == "wearable" else {"movement": random.choice(["none", "low", "normal"])})
        return True
