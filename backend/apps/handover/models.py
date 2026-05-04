from django.db import models


class HandoverNote(models.Model):
    class Shift(models.TextChoices):
        DAY = "day", "Day"
        EVENING = "evening", "Evening"
        NIGHT = "night", "Night"

    class Priority(models.TextChoices):
        NORMAL = "normal", "Normal"
        URGENT = "urgent", "Urgent"
        CRITICAL = "critical", "Critical"

    care_home = models.ForeignKey("staff.CareHome", on_delete=models.CASCADE, related_name="handover_notes")
    author = models.ForeignKey("authentication.User", on_delete=models.SET_NULL, null=True, related_name="handover_notes")
    residents_mentioned = models.ManyToManyField("residents.Resident", blank=True, related_name="handover_mentions")
    read_by = models.ManyToManyField("authentication.User", blank=True, related_name="read_handover_notes")

    shift = models.CharField(max_length=10, choices=Shift.choices)
    date = models.DateField()
    priority = models.CharField(max_length=10, choices=Priority.choices, default=Priority.NORMAL)
    content = models.TextField()

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-date", "-created_at"]

    def __str__(self):
        return f"{self.get_shift_display()} handover — {self.date}"
