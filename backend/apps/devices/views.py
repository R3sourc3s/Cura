from rest_framework import viewsets, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend

from apps.authentication.permissions import require
from apps.integrations.auth import APIKeyAuthentication
from apps.partner_api.permissions import HasAPIKey, ReadOnlyUnlessReadWriteKey
from .models import Device, DeviceReading
from .serializers import DeviceSerializer, DeviceReadingSerializer, DeviceIngestSerializer
from .services import ingest_reading

_DEVICE_PERMS = {
    "list":           ["devices.view"],
    "retrieve":       ["devices.view"],
    "create":         ["devices.manage"],
    "update":         ["devices.manage"],
    "partial_update": ["devices.manage"],
    "destroy":        ["devices.manage"],
}


class DeviceViewSet(viewsets.ModelViewSet):
    serializer_class = DeviceSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["device_type", "resident", "is_active"]

    def get_permissions(self):
        return [require(*_DEVICE_PERMS.get(self.action, ["devices.view"]))]

    def get_queryset(self):
        return Device.objects.select_related("resident").prefetch_related("readings").filter(
            care_home=self.request.user.care_home
        )

    def perform_create(self, serializer):
        serializer.save(care_home=self.request.user.care_home, created_by=self.request.user)


class DeviceReadingViewSet(viewsets.ReadOnlyModelViewSet):
    """Read-only reading history for a device — nested under /devices/{device_pk}/readings/."""
    serializer_class = DeviceReadingSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["reading_type"]

    def get_permissions(self):
        return [require("devices.view")]

    def get_queryset(self):
        return DeviceReading.objects.filter(
            device_id=self.kwargs["device_pk"],
            device__care_home=self.request.user.care_home,
        )


class DeviceIngestView(APIView):
    """
    API-key-secured ingestion endpoint for wearables, fall sensors, and other
    ambient monitoring hardware/gateways. Requires a read_write-scoped Cura
    API key (see apps.integrations). Auto-registers unknown devices on first
    contact and auto-links fall/vitals readings to Incident/VitalSign records.
    """
    authentication_classes = [APIKeyAuthentication]
    permission_classes = [HasAPIKey, ReadOnlyUnlessReadWriteKey]
    throttle_scope = "device_ingest"

    def post(self, request):
        serializer = DeviceIngestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        reading = ingest_reading(request.user.care_home, serializer.validated_data)
        return Response(DeviceReadingSerializer(reading).data, status=status.HTTP_201_CREATED)
