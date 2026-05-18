from rest_framework import serializers
from .models import LeaveType, LeaveRequest, LeaveBalance


class LeaveTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = LeaveType
        fields = "__all__"
        read_only_fields = ["care_home"]


class LeaveRequestSerializer(serializers.ModelSerializer):
    staff_name = serializers.CharField(source="staff_member.get_full_name", read_only=True)
    leave_type_name = serializers.CharField(source="leave_type.name", read_only=True)
    reviewed_by_name = serializers.CharField(source="reviewed_by.get_full_name", read_only=True)

    class Meta:
        model = LeaveRequest
        fields = "__all__"
        read_only_fields = ["staff_member", "created_at", "reviewed_by", "reviewed_at"]


class LeaveBalanceSerializer(serializers.ModelSerializer):
    staff_name = serializers.CharField(source="staff_member.get_full_name", read_only=True)
    leave_type_name = serializers.CharField(source="leave_type.name", read_only=True)
    remaining = serializers.IntegerField(read_only=True)

    class Meta:
        model = LeaveBalance
        fields = "__all__"
