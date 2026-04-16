from rest_framework import serializers
from .models import Medication, MAREntry


class MAREntrySerializer(serializers.ModelSerializer):
    administered_by_name = serializers.StringRelatedField(source="administered_by", read_only=True)

    class Meta:
        model = MAREntry
        fields = "__all__"
        read_only_fields = ["id", "created_at"]


class MedicationSerializer(serializers.ModelSerializer):
    is_low_stock = serializers.ReadOnlyField()
    recent_mar = MAREntrySerializer(source="mar_entries", many=True, read_only=True)

    class Meta:
        model = Medication
        fields = "__all__"
        read_only_fields = ["id", "created_at"]
