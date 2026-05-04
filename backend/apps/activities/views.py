from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
from apps.authentication.permissions import require
from .models import Activity, ActivityAttendance
from .serializers import ActivitySerializer, ActivityAttendanceSerializer


class ActivityViewSet(viewsets.ModelViewSet):
    serializer_class = ActivitySerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ["care_home", "activity_type", "is_completed", "scheduled_date"]

    def get_permissions(self):
        if self.action in ("list", "retrieve"):
            return [require("residents.view")]
        return [require("residents.edit")]

    def get_queryset(self):
        return Activity.objects.select_related(
            "organiser", "care_home"
        ).filter(
            care_home=self.request.user.care_home
        )

    def perform_create(self, serializer):
        serializer.save(
            care_home=self.request.user.care_home,
            organiser=self.request.user,
        )


class ActivityAttendanceViewSet(viewsets.ModelViewSet):
    serializer_class = ActivityAttendanceSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["activity", "resident", "attended"]

    def get_permissions(self):
        if self.action in ("list", "retrieve"):
            return [require("residents.view")]
        return [require("residents.edit")]

    def get_queryset(self):
        return ActivityAttendance.objects.select_related(
            "activity", "resident"
        ).filter(
            activity__care_home=self.request.user.care_home
        )
