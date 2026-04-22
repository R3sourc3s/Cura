from rest_framework import viewsets, decorators, response
from django_filters.rest_framework import DjangoFilterBackend
from apps.authentication.permissions import require
from .models import Medication, MAREntry
from .serializers import MedicationSerializer, MAREntrySerializer

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
    filterset_fields = ["resident", "is_active", "is_controlled", "route", "frequency"]

    def get_permissions(self):
        return [require(*_MED_PERMS.get(self.action, ["medications.view"]))]

    def get_queryset(self):
        return Medication.objects.select_related("resident").filter(
            resident__care_home=self.request.user.care_home
        )

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

    def perform_create(self, serializer):
        serializer.save(administered_by=self.request.user)
