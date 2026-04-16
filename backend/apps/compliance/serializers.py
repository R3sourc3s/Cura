from rest_framework import serializers
from .models import ComplianceAudit, AuditAction, Policy


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
