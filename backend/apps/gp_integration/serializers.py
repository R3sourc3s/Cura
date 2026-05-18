from rest_framework import serializers
from .models import GPContact, HospitalContact, DischargeSummary, Referral


class GPContactSerializer(serializers.ModelSerializer):
    class Meta:
        model = GPContact
        fields = "__all__"
        read_only_fields = ["care_home"]


class HospitalContactSerializer(serializers.ModelSerializer):
    class Meta:
        model = HospitalContact
        fields = "__all__"
        read_only_fields = ["care_home"]


class DischargeSummarySerializer(serializers.ModelSerializer):
    resident_name = serializers.CharField(source="resident.full_name", read_only=True)
    hospital_name = serializers.CharField(source="hospital.hospital_name", read_only=True)
    reviewed_by_name = serializers.CharField(source="reviewed_by.get_full_name", read_only=True)

    class Meta:
        model = DischargeSummary
        fields = "__all__"
        read_only_fields = ["created_at"]


class ReferralSerializer(serializers.ModelSerializer):
    resident_name = serializers.CharField(source="resident.full_name", read_only=True)
    referred_by_name = serializers.CharField(source="referred_by.get_full_name", read_only=True)

    class Meta:
        model = Referral
        fields = "__all__"
        read_only_fields = ["referred_by", "created_at"]
