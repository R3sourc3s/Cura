from rest_framework import generics, filters
from django_filters.rest_framework import DjangoFilterBackend
from apps.authentication.permissions import require
from .models import AuditLog
from .serializers import AuditLogSerializer


class AuditLogListView(generics.ListAPIView):
    serializer_class = AuditLogSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ["action", "model_name", "user"]
    ordering_fields = ["timestamp"]

    def get_permissions(self):
        return [require("audit.view")]

    def get_queryset(self):
        qs = AuditLog.objects.select_related("user").filter(
            user__care_home=self.request.user.care_home
        )
        model = self.request.query_params.get("model")
        if model:
            qs = qs.filter(model_name__iexact=model)
        return qs
