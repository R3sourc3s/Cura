from rest_framework import serializers
from .models import FluidRecord, MealRecord


class FluidRecordSerializer(serializers.ModelSerializer):
    recorded_by_name = serializers.CharField(
        source="recorded_by.get_full_name", read_only=True
    )
    resident_name = serializers.CharField(
        source="resident.__str__", read_only=True
    )

    class Meta:
        model = FluidRecord
        fields = [
            "id", "resident", "resident_name",
            "recorded_by", "recorded_by_name",
            "recorded_at", "fluid_type", "amount_ml", "notes",
        ]
        read_only_fields = ["id", "recorded_by"]


class MealRecordSerializer(serializers.ModelSerializer):
    recorded_by_name = serializers.CharField(
        source="recorded_by.get_full_name", read_only=True
    )
    resident_name = serializers.CharField(
        source="resident.__str__", read_only=True
    )

    class Meta:
        model = MealRecord
        fields = [
            "id", "resident", "resident_name",
            "recorded_by", "recorded_by_name",
            "recorded_at", "meal_type", "completion_percent",
            "appetite", "notes",
        ]
        read_only_fields = ["id", "recorded_by"]
