from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
from apps.authentication.permissions import require
from .models import FamilyMember, FamilyMessage
from .serializers import FamilyMemberSerializer, FamilyMessageSerializer


class FamilyMemberViewSet(viewsets.ModelViewSet):
    serializer_class = FamilyMemberSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ["resident", "relationship", "is_primary_contact", "is_emergency_contact"]
    search_fields = ["first_name", "last_name", "email"]

    def get_permissions(self):
        if self.action in ("list", "retrieve"):
            return [require("family.view")]
        return [require("family.manage")]

    def get_queryset(self):
        return FamilyMember.objects.select_related("resident").filter(
            resident__care_home=self.request.user.care_home
        )


class FamilyMessageViewSet(viewsets.ModelViewSet):
    serializer_class = FamilyMessageSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["status", "direction", "resident"]
    search_fields = ["subject", "body"]
    ordering_fields = ["sent_at"]

    def get_permissions(self):
        if self.action in ("list", "retrieve"):
            return [require("family.view")]
        return [require("family.manage")]

    def get_queryset(self):
        return FamilyMessage.objects.select_related("resident", "family_member", "sent_by_staff").filter(
            resident__care_home=self.request.user.care_home
        )

    def perform_create(self, serializer):
        serializer.save(sent_by_staff=self.request.user)
