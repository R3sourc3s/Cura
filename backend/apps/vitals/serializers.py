from rest_framework import serializers
from .models import VitalSign


class VitalSignSerializer(serializers.ModelSerializer):
    recorded_by_name = serializers.CharField(source="recorded_by.get_full_name", read_only=True)

    class Meta:
        model = VitalSign
        fields = [
            "id", "resident", "recorded_by", "recorded_by_name", "recorded_at",
            "bp_systolic", "bp_diastolic", "pulse", "temperature",
            "oxygen_saturation", "weight", "blood_glucose",
            "notes", "created_at",
        ]
        read_only_fields = ["id", "recorded_by", "created_at"]
