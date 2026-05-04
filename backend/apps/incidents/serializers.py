from rest_framework import serializers
from .models import Incident, IncidentFollowUp


class IncidentFollowUpSerializer(serializers.ModelSerializer):
    actioned_by_name = serializers.CharField(source="actioned_by.get_full_name", read_only=True)

    class Meta:
        model = IncidentFollowUp
        fields = ["id", "incident", "note", "actioned_by", "actioned_by_name", "created_at"]
        read_only_fields = ["id", "actioned_by", "created_at"]


class IncidentSerializer(serializers.ModelSerializer):
    reported_by_name = serializers.CharField(source="reported_by.get_full_name", read_only=True)
    resident_name = serializers.CharField(source="resident.full_name", read_only=True)
    follow_ups = IncidentFollowUpSerializer(many=True, read_only=True)

    class Meta:
        model = Incident
        fields = [
            "id", "care_home", "resident", "resident_name",
            "reported_by", "reported_by_name",
            "incident_type", "severity", "status",
            "incident_date", "location", "description",
            "immediate_action", "injury_sustained", "injury_description",
            "witnesses", "reported_to_gp", "reported_to_family", "reported_to_cqc",
            "created_at", "updated_at", "follow_ups",
        ]
        read_only_fields = ["id", "care_home", "reported_by", "created_at", "updated_at"]


class IncidentListSerializer(serializers.ModelSerializer):
    reported_by_name = serializers.CharField(source="reported_by.get_full_name", read_only=True)
    resident_name = serializers.CharField(source="resident.full_name", read_only=True)

    class Meta:
        model = Incident
        fields = [
            "id", "resident", "resident_name", "reported_by_name",
            "incident_type", "severity", "status",
            "incident_date", "injury_sustained", "created_at",
        ]
