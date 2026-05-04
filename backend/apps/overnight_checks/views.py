from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
from apps.authentication.permissions import require
from .models import OvernightCheck
from .serializers import OvernightCheckSerializer


class OvernightCheckViewSet(viewsets.ModelViewSet):
    serializer_class = OvernightCheckSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = {
        "resident": ["exact"],
        "check_time": ["date"],
    }
    ordering_fields = ["check_time"]

    def get_permissions(self):
        if self.action in ("list", "retrieve"):
            return [require("residents.view")]
        return [require("care_notes.create")]

    def get_queryset(self):
        return OvernightCheck.objects.select_related(
            "resident", "checked_by"
        ).filter(
            resident__care_home=self.request.user.care_home
        )

    def perform_create(self, serializer):
        serializer.save(checked_by=self.request.user)
