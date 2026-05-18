from django.db import models
from django.conf import settings


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
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-recorded_at"]

    def __str__(self):
        return f"{self.medication_name} — {self.entry_type} {self.quantity}"
