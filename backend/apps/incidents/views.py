from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
from apps.authentication.permissions import require
from apps.integrations.webhooks import dispatch as dispatch_webhook
from .models import Incident, IncidentFollowUp
from .serializers import IncidentSerializer, IncidentListSerializer, IncidentFollowUpSerializer

_INCIDENT_PERMS = {
    "list":           ["incidents.view"],
    "retrieve":       ["incidents.view"],
    "create":         ["incidents.create"],
    "update":         ["incidents.manage"],
    "partial_update": ["incidents.manage"],
    "destroy":        ["incidents.manage"],
}


class IncidentViewSet(viewsets.ModelViewSet):
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ["incident_type", "severity", "status", "resident"]
    ordering_fields = ["incident_date", "severity", "created_at"]

    def get_permissions(self):
        return [require(*_INCIDENT_PERMS.get(self.action, ["incidents.view"]))]

    def get_serializer_class(self):
        if self.action == "list":
            return IncidentListSerializer
        return IncidentSerializer

    def get_queryset(self):
        return Incident.objects.select_related(
            "resident", "reported_by", "care_home"
        ).prefetch_related("follow_ups").filter(
            care_home=self.request.user.care_home
        )

    def perform_create(self, serializer):
        incident = serializer.save(
            care_home=self.request.user.care_home,
            reported_by=self.request.user,
        )
        dispatch_webhook(incident.care_home, "incident.created", {
            "id": incident.id, "incident_type": incident.incident_type, "severity": incident.severity,
            "resident_id": incident.resident_id, "incident_date": incident.incident_date.isoformat(),
        })


class IncidentFollowUpViewSet(viewsets.ModelViewSet):
    serializer_class = IncidentFollowUpSerializer

    def get_permissions(self):
        if self.action in ("list", "retrieve"):
            return [require("incidents.view")]
        return [require("incidents.create")]

    def get_queryset(self):
        return IncidentFollowUp.objects.filter(
            incident_id=self.kwargs["incident_pk"],
            incident__care_home=self.request.user.care_home,
        )

    def perform_create(self, serializer):
        serializer.save(
            incident_id=self.kwargs["incident_pk"],
            actioned_by=self.request.user,
        )
