from rest_framework import serializers
from .models import JobPosting, Applicant


class ApplicantSerializer(serializers.ModelSerializer):
    class Meta:
        model = Applicant
        fields = "__all__"
        read_only_fields = ["applied_at", "updated_at", "updated_by"]


class JobPostingSerializer(serializers.ModelSerializer):
    applicant_count = serializers.SerializerMethodField()
    created_by_name = serializers.CharField(source="created_by.get_full_name", read_only=True)

    class Meta:
        model = JobPosting
        fields = "__all__"
        read_only_fields = ["care_home", "created_by", "created_at"]

    def get_applicant_count(self, obj):
        return obj.applicants.count()
