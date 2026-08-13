from django.db import models
from django.conf import settings
from cura.validators import image_upload_validators


class Supplier(models.Model):
    care_home = models.ForeignKey("staff.CareHome", on_delete=models.CASCADE, related_name="pharmacy_suppliers")
    name = models.CharField(max_length=200)
    contact_name = models.CharField(max_length=200, blank=True)
    phone = models.CharField(max_length=50, blank=True)
    email = models.EmailField(blank=True)
    address = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name


class MedicationStock(models.Model):
    care_home = models.ForeignKey("staff.CareHome", on_delete=models.CASCADE, related_name="medication_stocks")
    medication_name = models.CharField(max_length=200)
    supplier = models.ForeignKey(Supplier, on_delete=models.SET_NULL, null=True, blank=True)
    quantity_on_hand = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    unit = models.CharField(max_length=50, default="tablets")
    reorder_threshold = models.DecimalField(max_digits=10, decimal_places=2, default=10)
    last_restocked = models.DateTimeField(null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["medication_name"]

    def __str__(self):
        return f"{self.medication_name} ({self.quantity_on_hand} {self.unit})"

    @property
    def is_low_stock(self):
        return self.quantity_on_hand <= self.reorder_threshold


class PurchaseOrder(models.Model):
    """A pharmacy order — real-time status tracking from draft through delivery."""

    class Status(models.TextChoices):
        DRAFT = "draft", "Draft"
        SUBMITTED = "submitted", "Submitted"
        CONFIRMED = "confirmed", "Confirmed"
        DISPATCHED = "dispatched", "Dispatched"
        DELIVERED = "delivered", "Delivered"
        CANCELLED = "cancelled", "Cancelled"

    care_home = models.ForeignKey("staff.CareHome", on_delete=models.CASCADE, related_name="purchase_orders")
    supplier = models.ForeignKey(Supplier, on_delete=models.SET_NULL, null=True, related_name="purchase_orders")
    reference = models.CharField(max_length=30, unique=True, blank=True)
    status = models.CharField(max_length=12, choices=Status.choices, default=Status.DRAFT)
    ordered_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name="purchase_orders")
    ordered_at = models.DateTimeField(null=True, blank=True)
    expected_delivery = models.DateField(null=True, blank=True)
    dispatched_at = models.DateTimeField(null=True, blank=True)
    delivered_at = models.DateTimeField(null=True, blank=True)
    tracking_reference = models.CharField(max_length=100, blank=True, help_text="Supplier courier/tracking reference")
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"PO {self.reference or self.pk} — {self.get_status_display()}"

    def save(self, *args, **kwargs):
        if not self.reference:
            from django.utils import timezone
            self.reference = f"PO-{timezone.now():%Y%m}-{PurchaseOrder.objects.count() + 1:04d}"
        super().save(*args, **kwargs)


class PurchaseOrderItem(models.Model):
    purchase_order = models.ForeignKey(PurchaseOrder, on_delete=models.CASCADE, related_name="items")
    medication_stock = models.ForeignKey(MedicationStock, on_delete=models.SET_NULL, null=True, blank=True, related_name="order_items")
    medication_name = models.CharField(max_length=200)
    quantity_ordered = models.DecimalField(max_digits=10, decimal_places=2)
    unit = models.CharField(max_length=50, default="tablets")
    unit_cost = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True)
    quantity_received = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    def __str__(self):
        return f"{self.medication_name} x{self.quantity_ordered} ({self.purchase_order.reference})"


class ControlledDrugRegister(models.Model):
    class EntryType(models.TextChoices):
        RECEIVED = "received", "Received"
        ADMINISTERED = "administered", "Administered"
        DESTROYED = "destroyed", "Destroyed"
        RETURNED = "returned", "Returned"

    care_home = models.ForeignKey("staff.CareHome", on_delete=models.CASCADE, related_name="cd_register_entries")
    medication_name = models.CharField(max_length=200)
    resident = models.ForeignKey("residents.Resident", on_delete=models.SET_NULL, null=True, blank=True)
    entry_type = models.CharField(max_length=20, choices=EntryType.choices)
    quantity = models.DecimalField(max_digits=10, decimal_places=2)
    balance_after = models.DecimalField(max_digits=10, decimal_places=2)
    witnessed_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name="witnessed_cd_entries")
    recorded_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name="recorded_cd_entries")
    recorded_at = models.DateTimeField()
    notes = models.TextField(blank=True)

    class WitnessMethod(models.TextChoices):
        MANUAL = "manual", "Manual sign-off"
        FACE_MATCH = "face_match", "Facial verification"

    witness_method = models.CharField(max_length=12, choices=WitnessMethod.choices, default=WitnessMethod.MANUAL)
    witness_confidence = models.FloatField(
        null=True, blank=True, help_text="Face-match similarity score (0–1) captured at witnessing time"
    )
    witness_photo = models.ImageField(upload_to="cd_witness_captures/", null=True, blank=True, validators=image_upload_validators())
    witness_verified_at = models.DateTimeField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-recorded_at"]

    def __str__(self):
        return f"{self.medication_name} — {self.entry_type} {self.quantity}"
