from django.db import models
from django.conf import settings


class Task(models.Model):
    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        IN_PROGRESS = "in_progress", "In Progress"
        COMPLETED = "completed", "Completed"
        CANCELLED = "cancelled", "Cancelled"

    class Priority(models.TextChoices):
        LOW = "low", "Low"
        MEDIUM = "medium", "Medium"
        HIGH = "high", "High"
        URGENT = "urgent", "Urgent"

    class Category(models.TextChoices):
        CARE = "care", "Care"
        ADMIN = "admin", "Administrative"
        MAINTENANCE = "maintenance", "Maintenance"
        MEDICATION = "medication", "Medication"
        SAFETY = "safety", "Safety"
        GENERAL = "general", "General"

    care_home = models.ForeignKey("staff.CareHome", on_delete=models.CASCADE, related_name="tasks")
    title = models.CharField(max_length=300)
    description = models.TextField(blank=True)
    category = models.CharField(max_length=20, choices=Category.choices, default=Category.GENERAL)
    priority = models.CharField(max_length=10, choices=Priority.choices, default=Priority.MEDIUM)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    assigned_to = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name="assigned_tasks")
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name="created_tasks")
    resident = models.ForeignKey("residents.Resident", on_delete=models.SET_NULL, null=True, blank=True, related_name="tasks")
    due_date = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"[{self.priority}] {self.title} — {self.status}"
