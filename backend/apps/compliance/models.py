from django.db import models
from django.conf import settings


class ComplianceAudit(models.Model):
    class Domain(models.TextChoices):
        SAFE = "safe", "Safe"
        EFFECTIVE = "effective", "Effective"
        CARING = "caring", "Caring"
        RESPONSIVE = "responsive", "Responsive"
        WELL_LED = "well_led", "Well-Led"

    class Rating(models.TextChoices):
        OUTSTANDING = "outstanding", "Outstanding"
        GOOD = "good", "Good"
        REQUIRES_IMPROVEMENT = "requires_improvement", "Requires Improvement"
        INADEQUATE = "inadequate", "Inadequate"

    care_home = models.ForeignKey("staff.CareHome", on_delete=models.CASCADE, related_name="audits")
    domain = models.CharField(max_length=20, choices=Domain.choices)
    score = models.IntegerField(help_text="0–100")
    rating = models.CharField(max_length=30, choices=Rating.choices)
    conducted_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True
    )
    audit_date = models.DateField()
    next_audit_date = models.DateField(null=True, blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-audit_date"]

    def __str__(self):
        return f"{self.care_home} — {self.domain} ({self.score}/100)"


class AuditAction(models.Model):
    class Priority(models.TextChoices):
        LOW = "low", "Low"
        MEDIUM = "medium", "Medium"
        HIGH = "high", "High"
        CRITICAL = "critical", "Critical"

    class Status(models.TextChoices):
        OPEN = "open", "Open"
        IN_PROGRESS = "in_progress", "In Progress"
        COMPLETE = "complete", "Complete"

    audit = models.ForeignKey(ComplianceAudit, on_delete=models.CASCADE, related_name="actions")
    description = models.TextField()
    priority = models.CharField(max_length=10, choices=Priority.choices)
    assigned_to = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True
    )
    due_date = models.DateField()
    status = models.CharField(max_length=15, choices=Status.choices, default=Status.OPEN)
    completed_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.audit} — {self.description[:60]}"


class Policy(models.Model):
    care_home = models.ForeignKey("staff.CareHome", on_delete=models.CASCADE, related_name="policies")
    title = models.CharField(max_length=300)
    version = models.CharField(max_length=20)
    content = models.TextField()
    review_date = models.DateField()
    approved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["title"]
        verbose_name_plural = "Policies"

    def __str__(self):
        return f"{self.title} v{self.version}"
