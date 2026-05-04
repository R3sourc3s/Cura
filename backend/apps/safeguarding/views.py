from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
from apps.authentication.permissions import require
from .models import SafeguardingConcern
from .serializers import SafeguardingConcernSerializer


class SafeguardingConcernViewSet(viewsets.ModelViewSet):
    serializer_class = SafeguardingConcernSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ["status", "resident"]
    ordering_fields = ["date_raised"]

    def get_permissions(self):
        if self.action in ("list", "retrieve"):
            return [require("incidents.view")]
        if self.action == "create":
            return [require("incidents.create")]
        return [require("incidents.manage")]

    def get_queryset(self):
        return SafeguardingConcern.objects.select_related(
            "resident", "raised_by"
        ).filter(
            resident__care_home=self.request.user.care_home
        )

    def perform_create(self, serializer):
        serializer.save(raised_by=self.request.user)
