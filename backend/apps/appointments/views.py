from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
from apps.authentication.permissions import require
from .models import Appointment
from .serializers import AppointmentSerializer


class AppointmentViewSet(viewsets.ModelViewSet):
    serializer_class = AppointmentSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ["resident", "appointment_type", "status"]
    ordering_fields = ["scheduled_at"]

    def get_permissions(self):
        if self.action in ("list", "retrieve"):
            return [require("residents.view")]
        if self.action == "destroy":
            return [require("residents.delete")]
        return [require("residents.edit")]

    def get_queryset(self):
        return Appointment.objects.select_related(
            "resident", "created_by"
        ).filter(
            resident__care_home=self.request.user.care_home
        )

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
