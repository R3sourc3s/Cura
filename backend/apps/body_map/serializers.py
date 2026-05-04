from rest_framework import serializers
from .models import WoundRecord, WoundAssessment


class WoundAssessmentSerializer(serializers.ModelSerializer):
    assessed_by_name = serializers.CharField(
        source="assessed_by.get_full_name",
        read_only=True,
    )

    class Meta:
        model = WoundAssessment
        fields = [
            "id", "wound",
            "assessed_by", "assessed_by_name",
            "assessment_date",
            "length_cm", "width_cm", "depth_cm",
            "appearance", "treatment", "dressing_used",
            "next_review", "notes", "created_at",
        ]
        read_only_fields = ["id", "assessed_by", "created_at"]


class WoundRecordSerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(
        source="created_by.get_full_name",
        read_only=True,
    )
    latest_assessment = serializers.SerializerMethodField()

    class Meta:
        model = WoundRecord
        fields = [
            "id", "resident",
            "wound_type", "grade",
            "body_side", "location_x", "location_y", "location_label",
            "description", "first_observed", "healed_date",
            "is_active",
            "created_by", "created_by_name",
            "created_at", "latest_assessment",
        ]
        read_only_fields = ["id", "created_by", "created_at"]

    def get_latest_assessment(self, obj):
        assessment = obj.assessments.first()
        if assessment is None:
            return None
        return WoundAssessmentSerializer(assessment, context=self.context).data
