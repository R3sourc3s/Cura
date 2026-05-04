from rest_framework import viewsets, decorators, response, filters
from django_filters.rest_framework import DjangoFilterBackend
from apps.authentication.permissions import require
from .models import HandoverNote
from .serializers import HandoverNoteSerializer


class HandoverNoteViewSet(viewsets.ModelViewSet):
    serializer_class = HandoverNoteSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ["shift", "date", "priority"]
    ordering_fields = ["date", "created_at"]

    def get_permissions(self):
        if self.action in ("list", "retrieve"):
            return [require("handover.view")]
        if self.action == "mark_read":
            return [require("handover.view")]
        if self.action == "destroy":
            return [require("handover.manage")]
        return [require("handover.create")]

    def get_queryset(self):
        return HandoverNote.objects.select_related("author").prefetch_related(
            "residents_mentioned", "read_by"
        ).filter(care_home=self.request.user.care_home)

    def perform_create(self, serializer):
        serializer.save(
            care_home=self.request.user.care_home,
            author=self.request.user,
        )

    @decorators.action(detail=True, methods=["post"], url_path="mark-read")
    def mark_read(self, request, pk=None):
        note = self.get_object()
        note.read_by.add(request.user)
        return response.Response({"ok": True})
