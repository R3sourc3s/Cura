from django.utils import timezone
from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
from apps.authentication.permissions import require
from .models import Task
from .serializers import TaskSerializer


class TaskViewSet(viewsets.ModelViewSet):
    serializer_class = TaskSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["status", "priority", "category", "assigned_to", "resident"]
    search_fields = ["title", "description"]
    ordering_fields = ["created_at", "due_date", "priority"]

    def get_permissions(self):
        if self.action in ("list", "retrieve"):
            return [require("tasks.view")]
        if self.action == "create":
            return [require("tasks.create")]
        return [require("tasks.manage")]

    def get_queryset(self):
        return Task.objects.select_related("assigned_to", "created_by", "resident").filter(
            care_home=self.request.user.care_home
        )

    def perform_create(self, serializer):
        serializer.save(care_home=self.request.user.care_home, created_by=self.request.user)

    def perform_update(self, serializer):
        instance = self.get_object()
        old_status = instance.status
        updated = serializer.save()
        if updated.status == "completed" and old_status != "completed":
            updated.completed_at = timezone.now()
            updated.save(update_fields=["completed_at"])
