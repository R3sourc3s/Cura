from django.db import models
from django.conf import settings


class Medication(models.Model):
    """Drug record — one per resident per prescription."""

    class Route(models.TextChoices):
        ORAL = "oral", "Oral"
        TOPICAL = "topical", "Topical"
        INJECTION = "injection", "Injection"
        INHALED = "inhaled", "Inhaled"
        OTHER = "other", "Other"

    class Frequency(models.TextChoices):
        OD = "od", "Once daily"
        BD = "bd", "Twice daily"
        TDS = "tds", "Three times daily"
        QDS = "qds", "Four times daily"
        PRN = "prn", "As required"
        WEEKLY = "weekly", "Weekly"

    resident = models.ForeignKey("residents.Resident", on_delete=models.CASCADE, related_name="medications")
    drug_name = models.CharField(max_length=200)
    dose = models.CharField(max_length=100)
    route = models.CharField(max_length=20, choices=Route.choices)
    frequency = models.CharField(max_length=20, choices=Frequency.choices)
    indication = models.CharField(max_length=300, blank=True)
    prescribed_by = models.CharField(max_length=200)
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    stock_count = models.IntegerField(default=0)
    reorder_threshold = models.IntegerField(default=7, help_text="Days of stock to trigger reorder")
    is_controlled = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["resident", "drug_name"]

    def __str__(self):
        return f"{self.resident} — {self.drug_name} {self.dose}"

    @property
    def is_low_stock(self):
        return self.stock_count <= self.reorder_threshold


class MAREntry(models.Model):
    """Medication Administration Record — one row per scheduled dose."""

    class Status(models.TextChoices):
        GIVEN = "given", "Given"
        REFUSED = "refused", "Refused"
        OMITTED = "omitted", "Omitted"
        PENDING = "pending", "Pending"

    medication = models.ForeignKey(Medication, on_delete=models.CASCADE, related_name="mar_entries")
    scheduled_at = models.DateTimeField()
    administered_at = models.DateTimeField(null=True, blank=True)
    administered_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name="mar_entries"
    )
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.PENDING)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-scheduled_at"]

    def __str__(self):
        return f"{self.medication} @ {self.scheduled_at:%Y-%m-%d %H:%M} — {self.status}"
