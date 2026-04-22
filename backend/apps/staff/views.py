from rest_framework import viewsets, filters
from django_filters import rest_framework as df
from django_filters.rest_framework import DjangoFilterBackend
from apps.authentication.permissions import require, user_has_perm
from .models import CareHome, Shift, LeaveRequest, Training
from .serializers import CareHomeSerializer, ShiftSerializer, LeaveRequestSerializer, TrainingSerializer


class CareHomeViewSet(viewsets.ModelViewSet):
    queryset = CareHome.objects.all()
    serializer_class = CareHomeSerializer

    def get_permissions(self):
        # Only admins can manage care homes
        return [require("team.manage")]


class ShiftFilter(df.FilterSet):
    date_gte = df.DateFilter(field_name="date", lookup_expr="gte")
    date_lte = df.DateFilter(field_name="date", lookup_expr="lte")

    class Meta:
        model = Shift
        fields = ["care_home", "staff_member", "date", "shift_type", "is_agency"]


class ShiftViewSet(viewsets.ModelViewSet):
    serializer_class = ShiftSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_class = ShiftFilter
    ordering_fields = ["date", "start_time"]
    ordering = ["date", "start_time"]

    def get_permissions(self):
        if self.action in ("list", "retrieve"):
            return [require("staff.view")]
        return [require("staff.manage")]

    def get_queryset(self):
        return Shift.objects.select_related("staff_member", "care_home").filter(
            care_home=self.request.user.care_home
        )

    def perform_create(self, serializer):
        serializer.save(care_home=self.request.user.care_home)


class LeaveRequestViewSet(viewsets.ModelViewSet):
    serializer_class = LeaveRequestSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["staff_member", "status", "leave_type"]

    def get_permissions(self):
        if self.action == "create":
            return [require("staff.request_leave")]
        if self.action in ("update", "partial_update", "destroy"):
            return [require("staff.manage")]
        return [require("staff.view")]

    def get_queryset(self):
        user = self.request.user
        base = LeaveRequest.objects.select_related("staff_member", "approved_by").filter(
            staff_member__care_home=user.care_home
        )
        # Non-managers only see their own requests
        if not user_has_perm(user, "staff.manage"):
            base = base.filter(staff_member=user)
        return base

    def perform_create(self, serializer):
        serializer.save(staff_member=self.request.user)


class TrainingViewSet(viewsets.ModelViewSet):
    serializer_class = TrainingSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["staff_member", "status"]

    def get_permissions(self):
        if self.action in ("list", "retrieve"):
            return [require("staff.view")]
        return [require("staff.manage")]

    def get_queryset(self):
        return Training.objects.select_related("staff_member").filter(
            staff_member__care_home=self.request.user.care_home
        )
