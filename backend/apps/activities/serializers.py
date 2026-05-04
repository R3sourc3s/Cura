from rest_framework import serializers
from .models import Activity, ActivityAttendance


class ActivityAttendanceSerializer(serializers.ModelSerializer):
    class Meta:
        model = ActivityAttendance
        fields = [
            "id", "activity", "resident",
            "attended", "mood", "notes",
        ]
        read_only_fields = ["id"]


class ActivitySerializer(serializers.ModelSerializer):
    organiser_name = serializers.CharField(
        source="organiser.get_full_name",
        read_only=True,
    )
    attendee_count = serializers.SerializerMethodField()

    class Meta:
        model = Activity
        fields = [
            "id", "care_home", "name", "activity_type",
            "organiser", "organiser_name",
            "scheduled_date", "scheduled_time",
            "duration_minutes", "location", "description",
            "is_completed", "created_at", "attendee_count",
        ]
        read_only_fields = ["id", "care_home", "organiser", "created_at"]

    def get_attendee_count(self, obj):
        return obj.attendances.filter(attended=True).count()
