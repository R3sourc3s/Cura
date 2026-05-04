from django.db import models
from datetime import date


class FallsRiskAssessment(models.Model):
    class RiskLevel(models.TextChoices):
        LOW = "low"
        MEDIUM = "medium"
        HIGH = "high"

    resident = models.ForeignKey(
        "residents.Resident",
        on_delete=models.CASCADE,
        related_name="falls_assessments",
    )
    assessed_by = models.ForeignKey(
        "authentication.User",
        on_delete=models.SET_NULL,
        null=True,
        related_name="falls_assessments",
    )
    assessment_date = models.DateField(default=date.today)

    # Morse Fall Scale items
    history_of_falls = models.BooleanField(default=False)
    secondary_diagnosis = models.BooleanField(default=False)
    ambulatory_aid = models.CharField(
        max_length=20,
        choices=[
            ("none", "None/Bedrest/Nurse"),
            ("crutches", "Crutches/Cane/Walker"),
            ("furniture", "Furniture"),
        ],
        default="none",
    )
    iv_access = models.BooleanField(default=False)
    gait = models.CharField(
        max_length=20,
        choices=[
            ("normal", "Normal/Bedrest/Immobile"),
            ("weak", "Weak"),
            ("impaired", "Impaired"),
        ],
        default="normal",
    )
    mental_status = models.CharField(
        max_length=20,
        choices=[
            ("oriented", "Oriented to ability"),
            ("overestimates", "Overestimates/forgets"),
        ],
        default="oriented",
    )

    total_score = models.PositiveIntegerField(default=0)
    risk_level = models.CharField(
        max_length=10, choices=RiskLevel.choices, default=RiskLevel.LOW
    )
    action_plan = models.TextField(blank=True)
    next_review_date = models.DateField(null=True, blank=True)

    class Meta:
        ordering = ["-assessment_date"]

    def save(self, *args, **kwargs):
        score = 0
        if self.history_of_falls:
            score += 25
        if self.secondary_diagnosis:
            score += 15
        aid_scores = {"none": 0, "crutches": 15, "furniture": 30}
        score += aid_scores.get(self.ambulatory_aid, 0)
        if self.iv_access:
            score += 20
        gait_scores = {"normal": 0, "weak": 10, "impaired": 20}
        score += gait_scores.get(self.gait, 0)
        if self.mental_status == "overestimates":
            score += 15
        self.total_score = score
        if score < 25:
            self.risk_level = self.RiskLevel.LOW
        elif score < 45:
            self.risk_level = self.RiskLevel.MEDIUM
        else:
            self.risk_level = self.RiskLevel.HIGH
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.resident} — {self.risk_level} ({self.assessment_date})"
