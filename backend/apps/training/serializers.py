from rest_framework import serializers
from .models import TrainingCourse, StaffTrainingRecord


class TrainingCourseSerializer(serializers.ModelSerializer):
    class Meta:
        model = TrainingCourse
        fields = [
            "id", "name", "category", "is_mandatory",
            "recurrence_months", "care_home",
        ]
        read_only_fields = ["id"]


class StaffTrainingRecordSerializer(serializers.ModelSerializer):
    staff_member_name = serializers.CharField(
        source="staff_member.get_full_name", read_only=True
    )
    status = serializers.SerializerMethodField()
    course_name_display = serializers.SerializerMethodField()

    class Meta:
        model = StaffTrainingRecord
        fields = [
            "id", "staff_member", "staff_member_name",
            "course", "course_name", "course_name_display",
            "completed_date", "expiry_date",
            "provider", "notes", "status",
        ]
        read_only_fields = ["id", "staff_member"]

    def get_status(self, obj):
        return obj.status

    def get_course_name_display(self, obj):
        if obj.course:
            return obj.course.name
        return obj.course_name
