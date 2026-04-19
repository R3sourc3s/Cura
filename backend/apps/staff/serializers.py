from rest_framework import serializers
from .models import CareHome, Shift, LeaveRequest, Training


class CareHomeSerializer(serializers.ModelSerializer):
    class Meta:
        model = CareHome
        fields = "__all__"


class ShiftSerializer(serializers.ModelSerializer):
    staff_member_name = serializers.StringRelatedField(source="staff_member", read_only=True)

    class Meta:
        model = Shift
        fields = "__all__"
        read_only_fields = ["id", "created_at"]


class LeaveRequestSerializer(serializers.ModelSerializer):
    staff_member_name = serializers.StringRelatedField(source="staff_member", read_only=True)

    class Meta:
        model = LeaveRequest
        fields = "__all__"
        read_only_fields = ["id", "staff_member", "created_at"]

    def create(self, validated_data):
        validated_data["staff_member"] = self.context["request"].user
        return super().create(validated_data)


class TrainingSerializer(serializers.ModelSerializer):
    staff_member_name = serializers.StringRelatedField(source="staff_member", read_only=True)

    class Meta:
        model = Training
        fields = "__all__"
        read_only_fields = ["id"]
