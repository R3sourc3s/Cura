from rest_framework import serializers
from .models import APIKey, WebhookSubscription, WebhookDelivery
from .url_safety import is_safe_webhook_url


class APIKeySerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(source="created_by.get_full_name", read_only=True)

    class Meta:
        model = APIKey
        fields = ["id", "name", "prefix", "scope", "created_by", "created_by_name", "is_active", "last_used_at", "created_at", "revoked_at"]
        read_only_fields = ["id", "prefix", "created_by", "last_used_at", "created_at", "revoked_at"]


class WebhookDeliverySerializer(serializers.ModelSerializer):
    class Meta:
        model = WebhookDelivery
        fields = ["id", "event_type", "status_code", "success", "error", "delivered_at"]


class WebhookSubscriptionSerializer(serializers.ModelSerializer):
    recent_deliveries = WebhookDeliverySerializer(source="deliveries", many=True, read_only=True)

    class Meta:
        model = WebhookSubscription
        fields = ["id", "name", "target_url", "event_types", "secret", "is_active", "created_by", "created_at", "recent_deliveries"]
        read_only_fields = ["id", "secret", "created_by", "created_at"]

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data["recent_deliveries"] = data["recent_deliveries"][:10]
        return data

    def validate_event_types(self, value):
        valid = {k for k, _ in WebhookSubscription.EVENT_CHOICES}
        invalid = set(value) - valid
        if invalid:
            raise serializers.ValidationError(f"Unknown event type(s): {', '.join(sorted(invalid))}")
        return value

    def validate_target_url(self, value):
        safe, reason = is_safe_webhook_url(value)
        if not safe:
            raise serializers.ValidationError(reason)
        return value
