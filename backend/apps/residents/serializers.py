from rest_framework import serializers
from .models import Resident, Condition


class ConditionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Condition
        fields = "__all__"
        read_only_fields = ["id"]


class ResidentSerializer(serializers.ModelSerializer):
    conditions = ConditionSerializer(many=True, read_only=True)
    full_name = serializers.ReadOnlyField()
    age = serializers.ReadOnlyField()
    wing_name = serializers.CharField(source="wing.name", read_only=True)

    class Meta:
        model = Resident
        fields = "__all__"
        read_only_fields = ["id", "care_home", "ai_risk_score", "created_at", "updated_at"]


class ResidentListSerializer(serializers.ModelSerializer):
    full_name = serializers.ReadOnlyField()
    age = serializers.ReadOnlyField()
    conditions = ConditionSerializer(many=True, read_only=True)
    wing_name = serializers.CharField(source="wing.name", read_only=True)

    class Meta:
        model = Resident
        fields = [
            "id", "full_name", "first_name", "last_name", "age", "photo",
            "room_number", "wing", "wing_name", "nhs_number", "admission_date",
            "fall_risk", "pressure_ulcer_risk", "ai_risk_score",
            "is_active", "conditions",
        ]
