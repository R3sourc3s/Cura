from django.utils import timezone
from rest_framework import viewsets, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from apps.authentication.permissions import require
from .models import VisitorLog
from .serializers import VisitorLogSerializer


class VisitorLogViewSet(viewsets.ModelViewSet):
    serializer_class = VisitorLogSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ["resident"]
    ordering_fields = ["signed_in"]

    def get_permissions(self):
        if self.action in ("list", "retrieve"):
            return [require("residents.view")]
        if self.action == "destroy":
            return [require("residents.delete")]
        return [require("residents.edit")]

    def get_queryset(self):
        return VisitorLog.objects.select_related("logged_by", "resident").filter(
            resident__care_home=self.request.user.care_home
        )

    def perform_create(self, serializer):
        serializer.save(logged_by=self.request.user)

    @action(detail=True, methods=["post"], url_path="sign-out")
    def sign_out(self, request, pk=None):
        log = self.get_object()
        if not log.signed_out:
            log.signed_out = timezone.now()
            log.save(update_fields=["signed_out"])
        serializer = self.get_serializer(log)
        return Response(serializer.data)
