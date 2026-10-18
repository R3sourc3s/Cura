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
    is_psychotropic = models.BooleanField(
        default=False, help_text="Antipsychotic, sedative, or other psychotropic medication — tracked for CQC oversight"
    )
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


class PRNProtocol(models.Model):
    """Protocol for as-required (PRN) medications."""

    medication = models.OneToOneField(Medication, on_delete=models.CASCADE, related_name="prn_protocol")
    indication = models.TextField(help_text="When to administer this medication")
    max_dose_per_24h = models.CharField(max_length=100, blank=True)
    min_interval_hours = models.PositiveSmallIntegerField(default=4)
    effectiveness_criteria = models.TextField(blank=True, help_text="How to assess effectiveness after administration")
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"PRN protocol — {self.medication.drug_name}"


class PRNAdministration(models.Model):
    """Record of a PRN dose given."""

    class Effectiveness(models.TextChoices):
        EFFECTIVE = "effective", "Effective"
        PARTIAL = "partial", "Partially Effective"
        NO_EFFECT = "no_effect", "No Effect"
        NOT_ASSESSED = "not_assessed", "Not Yet Assessed"

    medication = models.ForeignKey(Medication, on_delete=models.CASCADE, related_name="prn_administrations")
    administered_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name="prn_given")
    administered_at = models.DateTimeField()
    reason = models.TextField()
    dose_given = models.CharField(max_length=100)
    effectiveness = models.CharField(max_length=15, choices=Effectiveness.choices, default=Effectiveness.NOT_ASSESSED)
    effectiveness_notes = models.TextField(blank=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-administered_at"]

    def __str__(self):
        return f"{self.medication.drug_name} PRN @ {self.administered_at:%Y-%m-%d %H:%M}"


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
    patch_site = models.CharField(
        max_length=50, blank=True,
        help_text="Applied site for topical/patch medications, for rotation tracking (e.g. 'Left upper arm')",
    )
    notes = models.TextField(blank=True)
    overdue_alerted_at = models.DateTimeField(
        null=True, blank=True, help_text="When staff were alerted that this dose was overdue (set once)",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-scheduled_at"]

    def __str__(self):
        return f"{self.medication} @ {self.scheduled_at:%Y-%m-%d %H:%M} — {self.status}"
