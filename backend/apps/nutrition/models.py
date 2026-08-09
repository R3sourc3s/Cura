from django.db import models
from django.utils import timezone


class FluidRecord(models.Model):
    FLUID_TYPE_CHOICES = [
        ("water", "Water"),
        ("tea", "Tea"),
        ("coffee", "Coffee"),
        ("juice", "Juice"),
        ("milk", "Milk"),
        ("supplement", "Supplement"),
        ("soup", "Soup"),
        ("iv", "IV Fluids"),
        ("other", "Other"),
    ]

    resident = models.ForeignKey(
        "residents.Resident",
        on_delete=models.CASCADE,
        related_name="fluid_records",
    )
    recorded_by = models.ForeignKey(
        "authentication.User",
        on_delete=models.SET_NULL,
        null=True,
        related_name="fluid_records",
    )
    recorded_at = models.DateTimeField(default=timezone.now)
    fluid_type = models.CharField(max_length=30, choices=FLUID_TYPE_CHOICES)
    amount_ml = models.PositiveIntegerField()
    notes = models.CharField(max_length=200, blank=True)

    class Meta:
        ordering = ["-recorded_at"]

    def __str__(self):
        return f"{self.resident} — {self.fluid_type} {self.amount_ml}ml @ {self.recorded_at:%Y-%m-%d %H:%M}"


class MealRecord(models.Model):
    MEAL_TYPE_CHOICES = [
        ("breakfast", "Breakfast"),
        ("lunch", "Lunch"),
        ("dinner", "Dinner"),
        ("snack", "Snack"),
    ]
    APPETITE_CHOICES = [
        ("good", "Good"),
        ("fair", "Fair"),
        ("poor", "Poor"),
    ]

    resident = models.ForeignKey(
        "residents.Resident",
        on_delete=models.CASCADE,
        related_name="meal_records",
    )
    recorded_by = models.ForeignKey(
        "authentication.User",
        on_delete=models.SET_NULL,
        null=True,
        related_name="meal_records",
    )
    recorded_at = models.DateTimeField(default=timezone.now)
    meal_type = models.CharField(max_length=20, choices=MEAL_TYPE_CHOICES)
    completion_percent = models.PositiveIntegerField(default=100)
    appetite = models.CharField(max_length=20, choices=APPETITE_CHOICES, default="good")
    notes = models.CharField(max_length=300, blank=True)

    class Meta:
        ordering = ["-recorded_at"]

    def __str__(self):
        return f"{self.resident} — {self.meal_type} ({self.completion_percent}%) @ {self.recorded_at:%Y-%m-%d %H:%M}"


class PEGChart(models.Model):
    """One PEG/enteral feeding tube record per resident — the tube itself plus its feed regimen."""

    class TubeType(models.TextChoices):
        PEG = "peg", "PEG (Percutaneous Endoscopic Gastrostomy)"
        RIG = "rig", "RIG (Radiologically Inserted Gastrostomy)"
        NG = "ng", "NG (Nasogastric)"
        JEJUNOSTOMY = "jejunostomy", "Jejunostomy"

    class SiteCondition(models.TextChoices):
        NORMAL = "normal", "Normal"
        REDNESS = "redness", "Redness"
        LEAKING = "leaking", "Leaking"
        GRANULATION = "granulation", "Granulation Tissue"
        INFECTED = "infected", "Signs of Infection"

    resident = models.OneToOneField("residents.Resident", on_delete=models.CASCADE, related_name="peg_chart")
    tube_type = models.CharField(max_length=20, choices=TubeType.choices, default=TubeType.PEG)
    tube_size_fr = models.CharField(max_length=20, blank=True, help_text="French gauge size, e.g. 16Fr")
    insertion_date = models.DateField(null=True, blank=True)
    feed_regimen = models.CharField(max_length=200, blank=True, help_text="e.g. Nutrison 1.5kcal @ 80ml/hr, 20:00–08:00")
    feed_rate_ml_per_hr = models.DecimalField(max_digits=6, decimal_places=1, null=True, blank=True)
    water_flush_ml = models.PositiveIntegerField(default=0, help_text="Standard water flush before/after feeds/meds")
    dietitian_name = models.CharField(max_length=200, blank=True)
    next_tube_change_due = models.DateField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    notes = models.TextField(blank=True)
    created_by = models.ForeignKey("authentication.User", on_delete=models.SET_NULL, null=True, related_name="created_peg_charts")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"PEG chart — {self.resident}"


class PEGFeedRecord(models.Model):
    """A single feed/flush/site-check entry against a resident's PEG chart."""

    class EntryType(models.TextChoices):
        FEED = "feed", "Feed Administered"
        FLUSH = "flush", "Water Flush"
        SITE_CHECK = "site_check", "Site Check"
        MEDICATION = "medication", "Medication via Tube"

    peg_chart = models.ForeignKey(PEGChart, on_delete=models.CASCADE, related_name="feed_records")
    recorded_by = models.ForeignKey("authentication.User", on_delete=models.SET_NULL, null=True, related_name="peg_feed_records")
    recorded_at = models.DateTimeField(default=timezone.now)
    entry_type = models.CharField(max_length=15, choices=EntryType.choices, default=EntryType.FEED)
    volume_ml = models.PositiveIntegerField(null=True, blank=True)
    site_condition = models.CharField(max_length=15, choices=PEGChart.SiteCondition.choices, blank=True)
    tolerated_well = models.BooleanField(default=True)
    notes = models.CharField(max_length=300, blank=True)

    class Meta:
        ordering = ["-recorded_at"]

    def __str__(self):
        return f"{self.peg_chart.resident} — {self.get_entry_type_display()} @ {self.recorded_at:%Y-%m-%d %H:%M}"
