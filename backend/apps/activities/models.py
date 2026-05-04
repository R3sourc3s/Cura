from django.db import models


class Activity(models.Model):
    class ActivityType(models.TextChoices):
        GROUP = "group", "Group"
        ONE_TO_ONE = "one_to_one", "One to One"
        EXTERNAL = "external", "External"
        VIRTUAL = "virtual", "Virtual"

    care_home = models.ForeignKey(
        "staff.CareHome",
        on_delete=models.CASCADE,
        related_name="activities",
    )
    name = models.CharField(max_length=200)
    activity_type = models.CharField(
        max_length=15,
        choices=ActivityType.choices,
        default=ActivityType.GROUP,
    )
    organiser = models.ForeignKey(
        "authentication.User",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="organised_activities",
    )
    scheduled_date = models.DateField()
    scheduled_time = models.TimeField(null=True, blank=True)
    duration_minutes = models.PositiveIntegerField(default=60)
    location = models.CharField(max_length=200, blank=True)
    description = models.TextField(blank=True)
    is_completed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-scheduled_date"]

    def __str__(self):
        return f"{self.name} ({self.scheduled_date})"


class ActivityAttendance(models.Model):
    class Mood(models.TextChoices):
        GREAT = "great", "Great"
        GOOD = "good", "Good"
        OKAY = "okay", "Okay"
        LOW = "low", "Low"
        REFUSED = "refused", "Refused"

    activity = models.ForeignKey(
        Activity,
        on_delete=models.CASCADE,
        related_name="attendances",
    )
    resident = models.ForeignKey(
        "residents.Resident",
        on_delete=models.CASCADE,
        related_name="activity_attendances",
    )
    attended = models.BooleanField(default=True)
    mood = models.CharField(max_length=10, choices=Mood.choices, blank=True)
    notes = models.TextField(blank=True)

    class Meta:
        unique_together = [["activity", "resident"]]

    def __str__(self):
        return f"{self.resident} — {self.activity}"
