from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
from apps.authentication.permissions import require
from .models import TrainingCourse, StaffTrainingRecord
from .serializers import TrainingCourseSerializer, StaffTrainingRecordSerializer


class TrainingCourseViewSet(viewsets.ModelViewSet):
    serializer_class = TrainingCourseSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ["care_home", "category", "is_mandatory"]

    def get_permissions(self):
        if self.action in ("list", "retrieve"):
            return [require("staff.view")]
        return [require("staff.manage")]

    def get_queryset(self):
        return TrainingCourse.objects.filter(
            care_home=self.request.user.care_home
        )


class StaffTrainingRecordViewSet(viewsets.ModelViewSet):
    serializer_class = StaffTrainingRecordSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ["staff_member", "course"]

    def get_permissions(self):
        if self.action in ("list", "retrieve"):
            return [require("staff.view")]
        return [require("staff.manage")]

    def get_queryset(self):
        return StaffTrainingRecord.objects.select_related(
            "staff_member", "course"
        ).filter(
            staff_member__care_home=self.request.user.care_home
        )

    def perform_create(self, serializer):
        serializer.save(staff_member=self.request.user)
