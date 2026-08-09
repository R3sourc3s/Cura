from rest_framework import serializers
from .models import FluidRecord, MealRecord, PEGChart, PEGFeedRecord


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


class PEGFeedRecordSerializer(serializers.ModelSerializer):
    recorded_by_name = serializers.CharField(source="recorded_by.get_full_name", read_only=True)

    class Meta:
        model = PEGFeedRecord
        fields = "__all__"
        read_only_fields = ["peg_chart", "recorded_by"]


class PEGChartSerializer(serializers.ModelSerializer):
    resident_name = serializers.CharField(source="resident.__str__", read_only=True)
    recent_feeds = PEGFeedRecordSerializer(source="feed_records", many=True, read_only=True)

    class Meta:
        model = PEGChart
        fields = "__all__"
        read_only_fields = ["created_by", "created_at", "updated_at"]

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data["recent_feeds"] = data["recent_feeds"][:10]
        return data
