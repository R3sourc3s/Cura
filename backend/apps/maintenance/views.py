from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
from apps.authentication.permissions import require
from .models import MaintenanceIssue
from .serializers import MaintenanceIssueSerializer


class MaintenanceIssueViewSet(viewsets.ModelViewSet):
    serializer_class = MaintenanceIssueSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ["status", "priority", "category"]
    ordering_fields = ["created_at", "priority"]

    def get_permissions(self):
        if self.action in ("list", "retrieve"):
            return [require("staff.view")]
        if self.action == "destroy":
            return [require("staff.manage")]
        return [require("staff.view")]

    def get_queryset(self):
        return MaintenanceIssue.objects.select_related("reported_by", "care_home").filter(
            care_home=self.request.user.care_home
        )

    def perform_create(self, serializer):
        serializer.save(
            reported_by=self.request.user,
            care_home=self.request.user.care_home,
        )
