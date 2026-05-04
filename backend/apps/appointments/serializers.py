from rest_framework import serializers
from .models import Appointment


class AppointmentSerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(
        source="created_by.get_full_name",
        read_only=True,
    )
    resident_name = serializers.CharField(
        source="resident.full_name",
        read_only=True,
    )

    class Meta:
        model = Appointment
        fields = [
            "id", "resident", "resident_name",
            "appointment_type", "provider_name", "location",
            "scheduled_at", "status",
            "outcome", "follow_up_required", "follow_up_notes",
            "escort_required", "transport_arranged",
            "created_by", "created_by_name",
            "created_at", "updated_at",
        ]
        read_only_fields = ["id", "created_by", "created_at", "updated_at"]
