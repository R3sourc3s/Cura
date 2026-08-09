from rest_framework import serializers
from apps.residents.models import Resident
from apps.medications.models import Medication
from apps.incidents.models import Incident
from apps.pharmacy.models import MedicationStock, PurchaseOrder


class PartnerResidentSerializer(serializers.ModelSerializer):
    full_name = serializers.ReadOnlyField()

    class Meta:
        model = Resident
        fields = ["id", "full_name", "first_name", "last_name", "date_of_birth", "nhs_number", "room_number", "is_active"]


class PartnerMedicationSerializer(serializers.ModelSerializer):
    resident_name = serializers.CharField(source="resident.full_name", read_only=True)

    class Meta:
        model = Medication
        fields = ["id", "resident", "resident_name", "drug_name", "dose", "route", "frequency", "is_controlled", "is_active"]


class PartnerLowStockSerializer(serializers.ModelSerializer):
    is_low_stock = serializers.ReadOnlyField()

    class Meta:
        model = MedicationStock
        fields = ["id", "medication_name", "quantity_on_hand", "unit", "reorder_threshold", "is_low_stock"]


class PartnerIncidentSerializer(serializers.ModelSerializer):
    resident_name = serializers.CharField(source="resident.full_name", read_only=True)

    class Meta:
        model = Incident
        fields = ["id", "resident", "resident_name", "incident_type", "severity", "status", "incident_date", "created_at"]


class PartnerPurchaseOrderSerializer(serializers.ModelSerializer):
    supplier_name = serializers.CharField(source="supplier.name", read_only=True)

    class Meta:
        model = PurchaseOrder
        fields = ["id", "reference", "supplier", "supplier_name", "status", "expected_delivery", "tracking_reference", "created_at"]
        read_only_fields = ["id", "reference", "supplier", "supplier_name", "expected_delivery", "created_at"]
