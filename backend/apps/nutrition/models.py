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
