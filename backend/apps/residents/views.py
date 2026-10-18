from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
from apps.authentication.permissions import require
from apps.integrations.webhooks import dispatch as dispatch_webhook
from .models import Resident, Condition, Allergy
from .serializers import ResidentSerializer, ResidentListSerializer, ConditionSerializer, AllergySerializer

_RESIDENT_PERMS = {
    "list":           ["residents.view"],
    "retrieve":       ["residents.view"],
    "create":         ["residents.create"],
    "update":         ["residents.edit"],
    "partial_update": ["residents.edit"],
    "destroy":        ["residents.delete"],
}

_CONDITION_PERMS = {
    "list":           ["residents.view"],
    "retrieve":       ["residents.view"],
    "create":         ["residents.edit"],
    "update":         ["residents.edit"],
    "partial_update": ["residents.edit"],
    "destroy":        ["residents.delete"],
}


class ResidentViewSet(viewsets.ModelViewSet):
    queryset = Resident.objects.select_related("care_home", "wing").prefetch_related("conditions", "allergies")
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["care_home", "is_active", "fall_risk", "wing"]
    search_fields = ["first_name", "last_name", "nhs_number", "room_number"]
    ordering_fields = ["last_name", "ai_risk_score", "admission_date"]

    def get_permissions(self):
        return [require(*_RESIDENT_PERMS.get(self.action, ["residents.view"]))]

    def get_serializer_class(self):
        if self.action == "list":
            return ResidentListSerializer
        return ResidentSerializer

    def get_queryset(self):
        return super().get_queryset().filter(care_home=self.request.user.care_home)

    def perform_create(self, serializer):
        resident = serializer.save(care_home=self.request.user.care_home)
        if resident.is_active:
            dispatch_webhook(resident.care_home, "resident.admitted", {
                "id": resident.id, "full_name": resident.full_name,
                "room_number": resident.room_number, "admission_date": resident.admission_date.isoformat(),
            })


class ConditionViewSet(viewsets.ModelViewSet):
    queryset = Condition.objects.select_related("resident")
    serializer_class = ConditionSerializer

    def get_permissions(self):
        return [require(*_CONDITION_PERMS.get(self.action, ["residents.view"]))]

    def get_queryset(self):
        return super().get_queryset().filter(resident_id=self.kwargs.get("resident_pk"))


class AllergyViewSet(viewsets.ModelViewSet):
    serializer_class = AllergySerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["resident", "allergy_type", "severity", "is_active"]

    def get_permissions(self):
        if self.action in ("list", "retrieve"):
            return [require("residents.view")]
        return [require("residents.edit")]

    def get_queryset(self):
        return Allergy.objects.select_related("resident", "recorded_by").filter(
            resident__care_home=self.request.user.care_home
        )

    def perform_create(self, serializer):
        serializer.save(recorded_by=self.request.user)
