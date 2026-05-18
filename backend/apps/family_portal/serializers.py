from rest_framework import serializers
from .models import FamilyMember, FamilyMessage


class FamilyMemberSerializer(serializers.ModelSerializer):
    resident_name = serializers.CharField(source="resident.full_name", read_only=True)

    class Meta:
        model = FamilyMember
        fields = "__all__"
        read_only_fields = ["created_at"]


class FamilyMessageSerializer(serializers.ModelSerializer):
    resident_name = serializers.CharField(source="resident.full_name", read_only=True)
    family_member_name = serializers.SerializerMethodField()
    sent_by_name = serializers.CharField(source="sent_by_staff.get_full_name", read_only=True)

    class Meta:
        model = FamilyMessage
        fields = "__all__"
        read_only_fields = ["sent_by_staff", "sent_at"]

    def get_family_member_name(self, obj):
        if obj.family_member:
            return f"{obj.family_member.first_name} {obj.family_member.last_name}"
        return None
