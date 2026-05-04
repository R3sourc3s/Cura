from django.db import models
from datetime import date


class SafeguardingConcern(models.Model):
    class Category(models.TextChoices):
        PHYSICAL = "physical", "Physical Abuse"
        EMOTIONAL = "emotional", "Emotional/Psychological"
        FINANCIAL = "financial", "Financial Abuse"
        SEXUAL = "sexual", "Sexual Abuse"
        NEGLECT = "neglect", "Neglect"
        DISCRIMINATORY = "discriminatory", "Discriminatory"
        ORGANISATIONAL = "organisational", "Organisational/Institutional"
        SELF_NEGLECT = "self_neglect", "Self-Neglect"
        DOMESTIC = "domestic", "Domestic Abuse"

    class Status(models.TextChoices):
        OPEN = "open", "Open"
        INVESTIGATING = "investigating", "Under Investigation"
        REFERRED = "referred", "Referred to Authority"
        CLOSED = "closed", "Closed"

    resident = models.ForeignKey(
        "residents.Resident",
        on_delete=models.CASCADE,
        related_name="safeguarding_concerns",
    )
    raised_by = models.ForeignKey(
        "authentication.User",
        on_delete=models.SET_NULL,
        null=True,
        related_name="raised_safeguarding",
    )
    category = models.CharField(max_length=20, choices=Category.choices)
    date_raised = models.DateField(default=date.today)
    description = models.TextField()
    immediate_action_taken = models.TextField(blank=True)
    referred_to_authority = models.BooleanField(default=False)
    referral_date = models.DateField(null=True, blank=True)
    referral_reference = models.CharField(max_length=100, blank=True)
    outcome = models.TextField(blank=True)
    status = models.CharField(
        max_length=20, choices=Status.choices, default=Status.OPEN
    )
    closed_date = models.DateField(null=True, blank=True)

    class Meta:
        ordering = ["-date_raised"]

    def __str__(self):
        return f"{self.resident} — {self.category} ({self.date_raised})"
