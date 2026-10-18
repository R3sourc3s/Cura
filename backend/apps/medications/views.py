from rest_framework import viewsets, decorators, response
from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend
from apps.authentication.permissions import require
from apps.integrations.webhooks import dispatch as dispatch_webhook
from .models import Medication, MAREntry, PRNProtocol, PRNAdministration
from .serializers import MedicationSerializer, MAREntrySerializer, PRNProtocolSerializer, PRNAdministrationSerializer
from . import safety


def _override_reason(request):
    return (request.data.get("safety_override_reason") or "").strip()


def _with_note(notes, extra):
    return f"{notes}\n{extra}".strip() if extra else notes

_MED_PERMS = {
    "list":           ["medications.view"],
    "retrieve":       ["medications.view"],
    "low_stock":      ["medications.view"],
    "create":         ["medications.create"],
    "update":         ["medications.edit"],
    "partial_update": ["medications.edit"],
    "destroy":        ["medications.delete"],
}

_MAR_PERMS = {
    "list":           ["medications.view"],
    "retrieve":       ["medications.view"],
    "create":         ["medications.administer"],
    "update":         ["medications.administer"],
    "partial_update": ["medications.administer"],
    "destroy":        ["medications.delete"],
}


class MedicationViewSet(viewsets.ModelViewSet):
    serializer_class = MedicationSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["resident", "is_active", "is_controlled", "is_psychotropic", "route", "frequency"]

    def get_permissions(self):
        return [require(*_MED_PERMS.get(self.action, ["medications.view"]))]

    def get_queryset(self):
        return Medication.objects.select_related("resident").filter(
            resident__care_home=self.request.user.care_home
        )

    def _check_prescribing(self, serializer):
        data = serializer.validated_data
        resident = data.get("resident") or serializer.instance.resident
        drug_name = data.get("drug_name") or serializer.instance.drug_name
        changed = serializer.instance is None or "drug_name" in data or "resident" in data
        if not changed:
            return {}
        note = safety.enforce(
            safety.check_allergies(resident, drug_name), _override_reason(self.request),
            user=self.request.user, resident=resident, drug_name=drug_name,
        )
        notes = data.get("notes", serializer.instance.notes if serializer.instance else "")
        return {"notes": _with_note(notes, note)} if note else {}

    def perform_create(self, serializer):
        serializer.save(**self._check_prescribing(serializer))

    def perform_update(self, serializer):
        serializer.save(**self._check_prescribing(serializer))

    @decorators.action(detail=False, methods=["get"])
    def low_stock(self, request):
        qs = self.get_queryset().filter(is_active=True)
        low = [m for m in qs if m.is_low_stock]
        return response.Response(MedicationSerializer(low, many=True).data)


class MAREntryViewSet(viewsets.ModelViewSet):
    serializer_class = MAREntrySerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["medication", "status", "medication__resident"]

    def get_permissions(self):
        return [require(*_MAR_PERMS.get(self.action, ["medications.view"]))]

    def get_queryset(self):
        return MAREntry.objects.select_related(
            "medication__resident", "administered_by"
        ).filter(medication__resident__care_home=self.request.user.care_home)

    def _save_dose(self, serializer):
        data = serializer.validated_data
        entry = serializer.instance
        new_status = data.get("status", entry.status if entry else MAREntry.Status.PENDING)
        if new_status != MAREntry.Status.GIVEN:
            serializer.save(**({} if entry else {"administered_by": self.request.user}))
            return
        medication = data.get("medication") or entry.medication
        note = safety.enforce(
            safety.check_mar_dose(entry, medication), _override_reason(self.request),
            user=self.request.user, resident=medication.resident, drug_name=medication.drug_name,
        )
        extra = {"administered_by": self.request.user}
        if not data.get("administered_at"):
            extra["administered_at"] = timezone.now()
        if note:
            extra["notes"] = _with_note(data.get("notes", entry.notes if entry else ""), note)
        serializer.save(**extra)

    def perform_create(self, serializer):
        self._save_dose(serializer)

    def perform_update(self, serializer):
        self._save_dose(serializer)


class PRNProtocolViewSet(viewsets.ModelViewSet):
    serializer_class = PRNProtocolSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["medication"]

    def get_permissions(self):
        if self.action in ("list", "retrieve"):
            return [require("medications.view")]
        return [require("medications.edit")]

    def get_queryset(self):
        return PRNProtocol.objects.select_related("medication__resident").filter(
            medication__resident__care_home=self.request.user.care_home
        )

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class PRNAdministrationViewSet(viewsets.ModelViewSet):
    serializer_class = PRNAdministrationSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["medication", "effectiveness"]

    def get_permissions(self):
        if self.action in ("list", "retrieve"):
            return [require("medications.view")]
        return [require("medications.administer")]

    def get_queryset(self):
        qs = PRNAdministration.objects.select_related(
            "medication__resident", "administered_by"
        ).filter(medication__resident__care_home=self.request.user.care_home)
        resident = self.request.query_params.get("resident")
        if resident and resident.isdigit():
            qs = qs.filter(medication__resident_id=resident)
        return qs

    def perform_create(self, serializer):
        medication = serializer.validated_data["medication"]
        administered_at = serializer.validated_data.get("administered_at") or timezone.now()
        note = safety.enforce(
            safety.check_prn_dose(medication, administered_at), _override_reason(self.request),
            user=self.request.user, resident=medication.resident, drug_name=medication.drug_name,
        )
        extra = {"administered_by": self.request.user, "administered_at": administered_at}
        if note:
            extra["effectiveness_notes"] = _with_note(serializer.validated_data.get("effectiveness_notes", ""), note)
        admin = serializer.save(**extra)
        dispatch_webhook(admin.medication.resident.care_home, "prn.administered", {
            "id": admin.id, "medication_id": admin.medication_id, "drug_name": admin.medication.drug_name,
            "resident_id": admin.medication.resident_id, "administered_at": admin.administered_at.isoformat(),
        })
