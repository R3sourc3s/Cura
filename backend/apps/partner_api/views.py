from rest_framework import viewsets, mixins, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend

from apps.integrations.auth import APIKeyAuthentication
from apps.residents.models import Resident
from apps.medications.models import Medication
from apps.incidents.models import Incident
from apps.pharmacy.models import MedicationStock, PurchaseOrder
from apps.pharmacy.services import apply_status_transition
from .permissions import HasAPIKey, ReadOnlyUnlessReadWriteKey
from .serializers import (
    PartnerResidentSerializer, PartnerMedicationSerializer, PartnerLowStockSerializer,
    PartnerIncidentSerializer, PartnerPurchaseOrderSerializer,
)

_THROTTLE_SCOPE = "partner_api"


class PartnerBaseViewSet(viewsets.GenericViewSet):
    authentication_classes = [APIKeyAuthentication]
    permission_classes = [HasAPIKey, ReadOnlyUnlessReadWriteKey]
    throttle_scope = _THROTTLE_SCOPE

    def _care_home(self):
        return self.request.user.care_home


class PartnerResidentViewSet(mixins.ListModelMixin, mixins.RetrieveModelMixin, PartnerBaseViewSet):
    """Read-only resident directory for partner systems (pharmacy, GP, hospital)."""
    serializer_class = PartnerResidentSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ["is_active"]
    search_fields = ["first_name", "last_name", "nhs_number"]

    def get_queryset(self):
        return Resident.objects.filter(care_home=self._care_home())


class PartnerMedicationViewSet(mixins.ListModelMixin, mixins.RetrieveModelMixin, PartnerBaseViewSet):
    """Active medication list — for pharmacy dispensing / GP reconciliation partners."""
    serializer_class = PartnerMedicationSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["resident", "is_active", "is_controlled"]

    def get_queryset(self):
        return Medication.objects.select_related("resident").filter(resident__care_home=self._care_home())

    @action(detail=False, methods=["get"], url_path="low-stock")
    def low_stock(self, request):
        qs = MedicationStock.objects.filter(care_home=self._care_home())
        low = [s for s in qs if s.is_low_stock]
        return Response(PartnerLowStockSerializer(low, many=True).data)


class PartnerIncidentViewSet(mixins.ListModelMixin, mixins.RetrieveModelMixin, PartnerBaseViewSet):
    """Recent incidents — for oversight/analytics partners."""
    serializer_class = PartnerIncidentSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ["incident_type", "severity", "status"]
    ordering_fields = ["incident_date"]

    def get_queryset(self):
        return Incident.objects.select_related("resident").filter(care_home=self._care_home())


class PartnerPurchaseOrderViewSet(mixins.ListModelMixin, mixins.RetrieveModelMixin,
                                   mixins.UpdateModelMixin, PartnerBaseViewSet):
    """
    Lets a pharmacy partner push real-time order status back into Cura
    (submitted → confirmed → dispatched → delivered), closing the loop that
    Empathika's own compliance filing admits it cannot do (no API/integration
    channel). Requires a read_write-scoped key; delivery restocks automatically.
    """
    serializer_class = PartnerPurchaseOrderSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["status"]

    def get_queryset(self):
        return PurchaseOrder.objects.select_related("supplier").filter(care_home=self._care_home())

    def perform_update(self, serializer):
        previous_status = self.get_object().status
        order = serializer.save()
        if order.status != previous_status:
            apply_status_transition(order, order.status)
