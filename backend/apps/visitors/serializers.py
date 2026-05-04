from rest_framework import serializers
from .models import VisitorLog


class VisitorLogSerializer(serializers.ModelSerializer):
    logged_by_name = serializers.CharField(source="logged_by.get_full_name", read_only=True)
    resident_name = serializers.CharField(source="resident.__str__", read_only=True)

    class Meta:
        model = VisitorLog
        fields = [
            "id", "resident", "resident_name",
            "visitor_name", "relationship", "phone",
            "signed_in", "signed_out", "purpose",
            "health_screening_passed", "screening_notes",
            "logged_by", "logged_by_name",
            "is_signed_out", "created_at",
        ]
        read_only_fields = ["id", "logged_by", "is_signed_out", "created_at"]
