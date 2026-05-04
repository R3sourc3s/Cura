from django.db import models
from django.utils import timezone


class OvernightCheck(models.Model):
    class CheckStatus(models.TextChoices):
        ASLEEP = "asleep", "Asleep"
        AWAKE = "awake", "Awake"
        UNSETTLED = "unsettled", "Unsettled"
        REPOSITIONED = "repositioned", "Repositioned"
        TOILETED = "toileted", "Toileted/Comfort Given"
        UNWELL = "unwell", "Unwell - Escalated"

    resident = models.ForeignKey(
        "residents.Resident",
        on_delete=models.CASCADE,
        related_name="overnight_checks",
    )
    checked_by = models.ForeignKey(
        "authentication.User",
        on_delete=models.SET_NULL,
        null=True,
        related_name="overnight_checks",
    )
    check_time = models.DateTimeField(default=timezone.now)
    status = models.CharField(max_length=20, choices=CheckStatus.choices)
    notes = models.CharField(max_length=300, blank=True)

    class Meta:
        ordering = ["-check_time"]

    def __str__(self):
        return f"{self.resident} — {self.status} @ {self.check_time:%Y-%m-%d %H:%M}"
