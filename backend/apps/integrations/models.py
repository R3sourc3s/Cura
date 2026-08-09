import hashlib
import secrets
from django.conf import settings
from django.db import models


class APIKey(models.Model):
    """
    A partner-facing API credential. Cura's open-integration answer to the gap
    Empathika's own NHS DTAC filing admits it has ("no API integration or
    channels exists for other consumers to integrate with CareApps").

    The raw key is only ever shown once, at creation time — only its SHA-256
    hash and a short display prefix are stored.
    """

    class Scope(models.TextChoices):
        READ_ONLY = "read_only", "Read-only"
        READ_WRITE = "read_write", "Read & write"

    care_home = models.ForeignKey("staff.CareHome", on_delete=models.CASCADE, related_name="api_keys")
    name = models.CharField(max_length=100, help_text="What this key is for, e.g. 'Lloyds Pharmacy integration'")
    prefix = models.CharField(max_length=20, unique=True, editable=False)
    key_hash = models.CharField(max_length=64, unique=True, editable=False)
    scope = models.CharField(max_length=12, choices=Scope.choices, default=Scope.READ_ONLY)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name="api_keys_created")
    is_active = models.BooleanField(default=True)
    last_used_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    revoked_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.name} ({self.prefix}…)"

    @staticmethod
    def generate() -> tuple[str, str, str]:
        """Returns (raw_key, prefix, key_hash). raw_key is shown once and never persisted."""
        secret = secrets.token_urlsafe(32)
        prefix = "cura_" + secrets.token_hex(4)
        raw_key = f"{prefix}.{secret}"
        return raw_key, prefix, APIKey.hash_key(raw_key)

    @staticmethod
    def hash_key(raw_key: str) -> str:
        return hashlib.sha256(raw_key.encode()).hexdigest()


class WebhookSubscription(models.Model):
    """A partner endpoint that receives push notifications for selected event types."""

    EVENT_CHOICES = [
        ("incident.created", "Incident created"),
        ("medication.low_stock", "Medication low stock"),
        ("purchase_order.delivered", "Purchase order delivered"),
        ("prn.administered", "PRN medication administered"),
        ("controlled_drug.recorded", "Controlled drug register entry recorded"),
        ("resident.admitted", "Resident admitted"),
        ("device.fall_detected", "Wearable/sensor fall detected"),
        ("device.vitals_recorded", "Wearable/sensor vitals recorded"),
        ("device.offline", "Device stopped reporting"),
    ]

    care_home = models.ForeignKey("staff.CareHome", on_delete=models.CASCADE, related_name="webhook_subscriptions")
    name = models.CharField(max_length=100, blank=True)
    target_url = models.URLField()
    event_types = models.JSONField(default=list, help_text="Event type strings this subscription listens for")
    secret = models.CharField(max_length=64, editable=False, blank=True)
    is_active = models.BooleanField(default=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def save(self, *args, **kwargs):
        if not self.secret:
            self.secret = secrets.token_hex(32)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.name or self.target_url} ({len(self.event_types)} events)"


class WebhookDelivery(models.Model):
    """Delivery log — lets an operator see whether their partner's endpoint is actually receiving events."""

    subscription = models.ForeignKey(WebhookSubscription, on_delete=models.CASCADE, related_name="deliveries")
    event_type = models.CharField(max_length=50)
    payload = models.JSONField()
    status_code = models.IntegerField(null=True, blank=True)
    success = models.BooleanField(default=False)
    error = models.CharField(max_length=300, blank=True)
    delivered_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-delivered_at"]

    def __str__(self):
        return f"{self.event_type} → {self.subscription.target_url} ({'ok' if self.success else 'failed'})"
