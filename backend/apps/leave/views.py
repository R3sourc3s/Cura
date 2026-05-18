import datetime
from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
from apps.authentication.permissions import require
from .models import LeaveType, LeaveRequest, LeaveBalance
from .serializers import LeaveTypeSerializer, LeaveRequestSerializer, LeaveBalanceSerializer


class LeaveTypeViewSet(viewsets.ModelViewSet):
    serializer_class = LeaveTypeSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ["name"]

    def get_permissions(self):
        if self.action in ("list", "retrieve"):
            return [require("leave.view")]
        return [require("leave.manage")]

    def get_queryset(self):
        return LeaveType.objects.filter(care_home=self.request.user.care_home)

    def perform_create(self, serializer):
        serializer.save(care_home=self.request.user.care_home)


class LeaveRequestViewSet(viewsets.ModelViewSet):
    serializer_class = LeaveRequestSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ["status", "leave_type", "staff_member"]
    ordering_fields = ["created_at", "start_date"]

    def get_permissions(self):
        if self.action in ("list", "retrieve"):
            return [require("leave.view")]
        if self.action == "create":
            return [require("leave.request")]
        return [require("leave.manage")]

    def get_queryset(self):
        return LeaveRequest.objects.select_related("staff_member", "leave_type", "reviewed_by").filter(
            staff_member__care_home=self.request.user.care_home
        )

    def perform_create(self, serializer):
        serializer.save(staff_member=self.request.user)

    def perform_update(self, serializer):
        instance = self.get_object()
        old_status = instance.status
        updated = serializer.save()
        if updated.status != old_status and updated.status in ("approved", "declined"):
            from django.utils import timezone
            updated.reviewed_by = self.request.user
            updated.reviewed_at = timezone.now()
            updated.save(update_fields=["reviewed_by", "reviewed_at"])


class LeaveBalanceViewSet(viewsets.ModelViewSet):
    serializer_class = LeaveBalanceSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["staff_member", "leave_type", "year"]

    def get_permissions(self):
        if self.action in ("list", "retrieve"):
            return [require("leave.view")]
        return [require("leave.manage")]

    def get_queryset(self):
        return LeaveBalance.objects.select_related("staff_member", "leave_type").filter(
            staff_member__care_home=self.request.user.care_home
        )
