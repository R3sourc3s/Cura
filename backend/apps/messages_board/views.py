from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
from apps.authentication.permissions import require
from .models import StaffMessage
from .serializers import StaffMessageSerializer


class StaffMessageViewSet(viewsets.ModelViewSet):
    serializer_class = StaffMessageSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ["channel"]
    ordering_fields = ["created_at"]
    ordering = ["created_at"]

    def get_permissions(self):
        if self.action in ("list", "retrieve"):
            return [require("messages.view")]
        return [require("messages.create")]

    def get_queryset(self):
        return StaffMessage.objects.select_related("author").filter(
            care_home=self.request.user.care_home
        )

    def perform_create(self, serializer):
        serializer.save(
            author=self.request.user,
            care_home=self.request.user.care_home,
        )
