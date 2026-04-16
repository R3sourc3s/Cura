from rest_framework import serializers
from .models import CarePlan, CarePlanSection, CarePlanNote


class CarePlanSectionSerializer(serializers.ModelSerializer):
    class Meta:
        model = CarePlanSection
        fields = "__all__"
        read_only_fields = ["id", "updated_at"]


class CarePlanNoteSerializer(serializers.ModelSerializer):
    author_name = serializers.StringRelatedField(source="author", read_only=True)

    class Meta:
        model = CarePlanNote
        fields = "__all__"
        read_only_fields = ["id", "author", "created_at"]


class CarePlanSerializer(serializers.ModelSerializer):
    sections = CarePlanSectionSerializer(many=True, read_only=True)
    notes = CarePlanNoteSerializer(many=True, read_only=True)
    created_by_name = serializers.StringRelatedField(source="created_by", read_only=True)

    class Meta:
        model = CarePlan
        fields = "__all__"
        read_only_fields = ["id", "version", "created_at", "updated_at"]

    def create(self, validated_data):
        resident = validated_data["resident"]
        latest = CarePlan.objects.filter(resident=resident).order_by("-version").first()
        validated_data["version"] = (latest.version + 1) if latest else 1
        validated_data["created_by"] = self.context["request"].user
        return super().create(validated_data)
