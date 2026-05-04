from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from .models import StaffMessage
from .serializers import StaffMessageSerializer


class StaffMessageViewSet(viewsets.ModelViewSet):
    serializer_class = StaffMessageSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ["channel"]
    ordering_fields = ["created_at"]
    ordering = ["created_at"]

    def get_queryset(self):
        return StaffMessage.objects.select_related("author").filter(
            care_home=self.request.user.care_home
        )

    def perform_create(self, serializer):
        serializer.save(
            author=self.request.user,
            care_home=self.request.user.care_home,
        )
