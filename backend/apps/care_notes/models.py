from django.db import models


class CareNote(models.Model):
    class Shift(models.TextChoices):
        DAY = "day", "Day"
        EVENING = "evening", "Evening"
        NIGHT = "night", "Night"

    class Category(models.TextChoices):
        PERSONAL_CARE = "personal_care", "Personal Care"
        NUTRITION = "nutrition", "Nutrition"
        MOBILITY = "mobility", "Mobility"
        MOOD = "mood", "Mood"
        SLEEP = "sleep", "Sleep"
        HEALTH = "health", "Health"
        SOCIAL = "social", "Social"
        GENERAL = "general", "General"

    class MoodChoice(models.TextChoices):
        GOOD = "good", "Good"
        OKAY = "okay", "Okay"
        LOW = "low", "Low"
        AGITATED = "agitated", "Agitated"
        DISTRESSED = "distressed", "Distressed"

    resident = models.ForeignKey(
        "residents.Resident", on_delete=models.CASCADE, related_name="care_notes"
    )
    author = models.ForeignKey(
        "authentication.User", on_delete=models.SET_NULL, null=True
    )
    shift = models.CharField(max_length=10, choices=Shift.choices)
    category = models.CharField(max_length=20, choices=Category.choices)
    content = models.TextField()
    mood = models.CharField(max_length=15, choices=MoodChoice.choices, blank=True)
    recorded_at = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-recorded_at"]

    def __str__(self):
        return f"{self.resident} — {self.category} ({self.recorded_at:%Y-%m-%d %H:%M})"
