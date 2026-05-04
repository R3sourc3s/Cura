from rest_framework import serializers
from .models import FallsRiskAssessment


class FallsRiskAssessmentSerializer(serializers.ModelSerializer):
    assessed_by_name = serializers.CharField(
        source="assessed_by.get_full_name", read_only=True
    )
    resident_name = serializers.CharField(
        source="resident.__str__", read_only=True
    )

    class Meta:
        model = FallsRiskAssessment
        fields = [
            "id", "resident", "resident_name",
            "assessed_by", "assessed_by_name",
            "assessment_date",
            "history_of_falls", "secondary_diagnosis",
            "ambulatory_aid", "iv_access", "gait", "mental_status",
            "total_score", "risk_level",
            "action_plan", "next_review_date",
        ]
        read_only_fields = ["id", "assessed_by", "total_score", "risk_level"]
