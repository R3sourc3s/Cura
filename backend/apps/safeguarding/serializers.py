from rest_framework import serializers
from .models import SafeguardingConcern


class SafeguardingConcernSerializer(serializers.ModelSerializer):
    raised_by_name = serializers.CharField(
        source="raised_by.get_full_name", read_only=True
    )
    resident_name = serializers.CharField(
        source="resident.__str__", read_only=True
    )

    class Meta:
        model = SafeguardingConcern
        fields = [
            "id", "resident", "resident_name",
            "raised_by", "raised_by_name",
            "category", "date_raised", "description",
            "immediate_action_taken", "referred_to_authority",
            "referral_date", "referral_reference",
            "outcome", "status", "closed_date",
        ]
        read_only_fields = ["id", "raised_by"]
