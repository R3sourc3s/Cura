from rest_framework import serializers
from .models import Enquiry, PreAdmissionAssessment


class PreAdmissionAssessmentSerializer(serializers.ModelSerializer):
    assessor_name = serializers.CharField(source="assessor.get_full_name", read_only=True)

    class Meta:
        model = PreAdmissionAssessment
        fields = "__all__"
        read_only_fields = ["created_at"]


class EnquirySerializer(serializers.ModelSerializer):
    assigned_to_name = serializers.CharField(source="assigned_to.get_full_name", read_only=True)
    has_assessment = serializers.SerializerMethodField()

    class Meta:
        model = Enquiry
        fields = "__all__"
        read_only_fields = ["care_home", "created_at", "updated_at"]

    def get_has_assessment(self, obj):
        return hasattr(obj, "assessment")
