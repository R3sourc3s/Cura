from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
from .models import CareHome, Shift, LeaveRequest, Training
from .serializers import CareHomeSerializer, ShiftSerializer, LeaveRequestSerializer, TrainingSerializer


class CareHomeViewSet(viewsets.ModelViewSet):
    queryset = CareHome.objects.all()
    serializer_class = CareHomeSerializer


class ShiftViewSet(viewsets.ModelViewSet):
    queryset = Shift.objects.select_related("staff_member", "care_home")
    serializer_class = ShiftSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ["care_home", "staff_member", "date", "shift_type", "is_agency"]
    ordering_fields = ["date", "start_time"]


class LeaveRequestViewSet(viewsets.ModelViewSet):
    queryset = LeaveRequest.objects.select_related("staff_member", "approved_by")
    serializer_class = LeaveRequestSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["staff_member", "status", "leave_type"]


class TrainingViewSet(viewsets.ModelViewSet):
    queryset = Training.objects.select_related("staff_member")
    serializer_class = TrainingSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["staff_member", "status"]
