from rest_framework import serializers
from .models import Medication, MAREntry, PRNProtocol, PRNAdministration


class MAREntrySerializer(serializers.ModelSerializer):
    administered_by_name = serializers.StringRelatedField(source="administered_by", read_only=True)
    drug_name = serializers.CharField(source="medication.drug_name", read_only=True)
    resident_name = serializers.CharField(source="medication.resident.full_name", read_only=True)
    resident_id = serializers.IntegerField(source="medication.resident.id", read_only=True)

    class Meta:
        model = MAREntry
        fields = "__all__"
        read_only_fields = ["id", "administered_by", "overdue_alerted_at", "created_at"]


class PRNProtocolSerializer(serializers.ModelSerializer):
    class Meta:
        model = PRNProtocol
        fields = "__all__"
        read_only_fields = ["id", "created_by", "created_at"]


class PRNAdministrationSerializer(serializers.ModelSerializer):
    administered_by_name = serializers.CharField(source="administered_by.get_full_name", read_only=True)
    drug_name = serializers.CharField(source="medication.drug_name", read_only=True)

    class Meta:
        model = PRNAdministration
        fields = "__all__"
        read_only_fields = ["id", "administered_by", "created_at"]
        extra_kwargs = {"administered_at": {"required": False}}


class MedicationSerializer(serializers.ModelSerializer):
    is_low_stock = serializers.ReadOnlyField()
    recent_mar = MAREntrySerializer(source="mar_entries", many=True, read_only=True)
    prn_protocol = PRNProtocolSerializer(read_only=True)

    class Meta:
        model = Medication
        fields = "__all__"
        read_only_fields = ["id", "created_at"]
