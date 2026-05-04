from rest_framework import serializers
from .models import MaintenanceIssue


class MaintenanceIssueSerializer(serializers.ModelSerializer):
    reported_by_name = serializers.CharField(source="reported_by.get_full_name", read_only=True)

    class Meta:
        model = MaintenanceIssue
        fields = [
            "id", "care_home", "reported_by", "reported_by_name",
            "assigned_to", "category", "title", "description",
            "location", "priority", "status",
            "resolved_at", "resolution_notes",
            "created_at", "updated_at",
        ]
        read_only_fields = ["id", "care_home", "reported_by", "created_at", "updated_at"]
