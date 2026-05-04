from rest_framework import serializers
from .models import OvernightCheck


class OvernightCheckSerializer(serializers.ModelSerializer):
    checked_by_name = serializers.CharField(
        source="checked_by.get_full_name", read_only=True
    )
    resident_name = serializers.CharField(
        source="resident.__str__", read_only=True
    )

    class Meta:
        model = OvernightCheck
        fields = [
            "id", "resident", "resident_name",
            "checked_by", "checked_by_name",
            "check_time", "status", "notes",
        ]
        read_only_fields = ["id", "checked_by"]
