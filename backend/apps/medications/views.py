from rest_framework import viewsets, decorators, response
from django_filters.rest_framework import DjangoFilterBackend
from .models import Medication, MAREntry
from .serializers import MedicationSerializer, MAREntrySerializer


class MedicationViewSet(viewsets.ModelViewSet):
    queryset = Medication.objects.select_related("resident")
    serializer_class = MedicationSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["resident", "is_active", "is_controlled", "route", "frequency"]

    @decorators.action(detail=False, methods=["get"])
    def low_stock(self, request):
        """Return all medications below reorder threshold."""
        qs = self.get_queryset().filter(is_active=True)
        low = [m for m in qs if m.is_low_stock]
        return response.Response(MedicationSerializer(low, many=True).data)


class MAREntryViewSet(viewsets.ModelViewSet):
    queryset = MAREntry.objects.select_related("medication", "administered_by")
    serializer_class = MAREntrySerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["medication", "status"]

    def perform_create(self, serializer):
        serializer.save(administered_by=self.request.user)
