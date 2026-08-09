from rest_framework import serializers
from .models import ComplianceAudit, AuditAction, Policy, Accreditation


class AccreditationSerializer(serializers.ModelSerializer):
    is_expiring_soon = serializers.ReadOnlyField()

    class Meta:
        model = Accreditation
        fields = "__all__"
        read_only_fields = ["id", "care_home", "created_at", "updated_at"]


class AuditActionSerializer(serializers.ModelSerializer):
    class Meta:
        model = AuditAction
        fields = "__all__"


class ComplianceAuditSerializer(serializers.ModelSerializer):
    actions = AuditActionSerializer(many=True, read_only=True)

    class Meta:
        model = ComplianceAudit
        fields = "__all__"
        read_only_fields = ["id", "created_at"]


class PolicySerializer(serializers.ModelSerializer):
    class Meta:
        model = Policy
        fields = "__all__"
        read_only_fields = ["id", "created_at", "updated_at"]
