from rest_framework import serializers
from .models import Resident, Condition, Allergy


class ConditionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Condition
        fields = "__all__"
        read_only_fields = ["id"]


class AllergySerializer(serializers.ModelSerializer):
    recorded_by_name = serializers.CharField(source="recorded_by.get_full_name", read_only=True, default="")

    class Meta:
        model = Allergy
        fields = "__all__"
        read_only_fields = ["id", "recorded_by", "created_at"]

    def validate_resident(self, resident):
        # Residents from another care home must look nonexistent, same as a 404 on the resident itself.
        if resident.care_home_id != self.context["request"].user.care_home_id:
            raise serializers.ValidationError("Invalid pk \"%s\" - object does not exist." % resident.pk)
        return resident


def _active_allergies(resident):
    # Uses the prefetch cache when present instead of issuing a filtered query per resident.
    return AllergySerializer([a for a in resident.allergies.all() if a.is_active], many=True).data


class ResidentSerializer(serializers.ModelSerializer):
    conditions = ConditionSerializer(many=True, read_only=True)
    allergies = serializers.SerializerMethodField()
    full_name = serializers.ReadOnlyField()
    age = serializers.ReadOnlyField()
    wing_name = serializers.CharField(source="wing.name", read_only=True)

    class Meta:
        model = Resident
        fields = "__all__"
        read_only_fields = ["id", "care_home", "ai_risk_score", "created_at", "updated_at"]

    def get_allergies(self, obj):
        return _active_allergies(obj)


class ResidentListSerializer(serializers.ModelSerializer):
    allergies = serializers.SerializerMethodField()
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
            "is_active", "conditions", "allergies",
        ]

    def get_allergies(self, obj):
        return _active_allergies(obj)
