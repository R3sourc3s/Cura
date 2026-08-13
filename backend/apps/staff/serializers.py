from rest_framework import serializers
from .models import CareHome, CareHomeGroup, Shift, LeaveRequest, Training, Wing


class CareHomeGroupSerializer(serializers.ModelSerializer):
    care_home_count = serializers.SerializerMethodField()

    class Meta:
        model = CareHomeGroup
        fields = ["id", "name", "created_at", "care_home_count"]
        read_only_fields = ["id", "created_at"]

    def get_care_home_count(self, obj):
        return obj.care_homes.count()


class CareHomeSerializer(serializers.ModelSerializer):
    group_name = serializers.CharField(source="group.name", read_only=True, default=None)

    class Meta:
        model = CareHome
        fields = "__all__"


class WingSerializer(serializers.ModelSerializer):
    lead_staff_name = serializers.CharField(source="lead_staff.get_full_name", read_only=True)
    resident_count = serializers.SerializerMethodField()

    class Meta:
        model = Wing
        fields = "__all__"
        read_only_fields = ["care_home", "created_at"]

    def get_resident_count(self, obj):
        return obj.residents.filter(is_active=True).count()


class ShiftSerializer(serializers.ModelSerializer):
    staff_member_name = serializers.StringRelatedField(source="staff_member", read_only=True)

    class Meta:
        model = Shift
        fields = "__all__"
        read_only_fields = ["id", "care_home", "created_at"]


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
