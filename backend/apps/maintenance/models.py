from django.db import models


class MaintenanceIssue(models.Model):
    class Priority(models.TextChoices):
        LOW = "low", "Low"
        MEDIUM = "medium", "Medium"
        HIGH = "high", "High"
        URGENT = "urgent", "Urgent"

    class Status(models.TextChoices):
        OPEN = "open", "Open"
        IN_PROGRESS = "in_progress", "In Progress"
        RESOLVED = "resolved", "Resolved"
        CLOSED = "closed", "Closed"

    class Category(models.TextChoices):
        ELECTRICAL = "electrical", "Electrical"
        PLUMBING = "plumbing", "Plumbing"
        HEATING = "heating", "Heating"
        EQUIPMENT = "equipment", "Equipment"
        SAFETY = "safety", "Safety"
        CLEANING = "cleaning", "Cleaning"
        OTHER = "other", "Other"

    care_home = models.ForeignKey(
        "staff.CareHome", on_delete=models.CASCADE, related_name="maintenance_issues"
    )
    reported_by = models.ForeignKey(
        "authentication.User", on_delete=models.SET_NULL, null=True
    )
    assigned_to = models.CharField(max_length=200, blank=True)
    category = models.CharField(max_length=20, choices=Category.choices)
    title = models.CharField(max_length=200)
    description = models.TextField()
    location = models.CharField(max_length=200, blank=True)
    priority = models.CharField(max_length=10, choices=Priority.choices, default="medium")
    status = models.CharField(max_length=15, choices=Status.choices, default="open")
    resolved_at = models.DateTimeField(null=True, blank=True)
    resolution_notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"[{self.priority.upper()}] {self.title} ({self.status})"
