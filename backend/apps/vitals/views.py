from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
from apps.authentication.permissions import require
from .models import VitalSign
from .serializers import VitalSignSerializer


class VitalSignViewSet(viewsets.ModelViewSet):
    serializer_class = VitalSignSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ["resident"]
    ordering_fields = ["recorded_at"]

    def get_permissions(self):
        if self.action in ("list", "retrieve"):
            return [require("residents.view")]
        if self.action == "destroy":
            return [require("residents.delete")]
        return [require("residents.edit")]

    def get_queryset(self):
        return VitalSign.objects.select_related("recorded_by").filter(
            resident__care_home=self.request.user.care_home
        )

    def perform_create(self, serializer):
        serializer.save(recorded_by=self.request.user)
