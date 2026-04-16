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

    class Meta:
        model = Resident
        fields = "__all__"
        read_only_fields = ["id", "ai_risk_score", "created_at", "updated_at"]


class ResidentListSerializer(serializers.ModelSerializer):
    full_name = serializers.ReadOnlyField()
    age = serializers.ReadOnlyField()

    class Meta:
        model = Resident
        fields = ["id", "full_name", "age", "room_number", "fall_risk", "ai_risk_score", "is_active"]
