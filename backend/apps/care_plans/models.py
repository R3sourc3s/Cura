from django.db import models
from django.conf import settings


class CarePlan(models.Model):
    class Status(models.TextChoices):
        DRAFT = "draft", "Draft"
        ACTIVE = "active", "Active"
        UNDER_REVIEW = "under_review", "Under Review"
        ARCHIVED = "archived", "Archived"

    resident = models.ForeignKey("residents.Resident", on_delete=models.CASCADE, related_name="care_plans")
    version = models.PositiveIntegerField(default=1)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.DRAFT)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name="created_care_plans"
    )
    reviewed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name="reviewed_care_plans"
    )
    next_review_date = models.DateField(null=True, blank=True)
    ai_generated = models.BooleanField(default=False)
    ai_summary = models.TextField(blank=True, help_text="AI-generated plain-English summary")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-version"]

    def __str__(self):
        return f"{self.resident} — Care Plan v{self.version} ({self.status})"


class CarePlanSection(models.Model):
    """A named section within a care plan (e.g. Mobility, Nutrition, Cognition)."""

    care_plan = models.ForeignKey(CarePlan, on_delete=models.CASCADE, related_name="sections")
    title = models.CharField(max_length=200)
    content = models.TextField()
    risk_level = models.CharField(
        max_length=10,
        choices=[("low", "Low"), ("medium", "Medium"), ("high", "High")],
        default="low",
    )
    order = models.PositiveIntegerField(default=0)
    last_updated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True
    )
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["order"]

    def __str__(self):
        return f"{self.care_plan} — {self.title}"


class CarePlanNote(models.Model):
    """Time-stamped progress notes attached to a care plan."""

    care_plan = models.ForeignKey(CarePlan, on_delete=models.CASCADE, related_name="notes")
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    body = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
