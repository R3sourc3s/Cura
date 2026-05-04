from django.db import models


class TrainingCourse(models.Model):
    CATEGORY_CHOICES = [
        ("fire", "Fire Safety"),
        ("moving_handling", "Moving & Handling"),
        ("safeguarding", "Safeguarding"),
        ("infection_control", "Infection Control"),
        ("dementia", "Dementia Care"),
        ("first_aid", "First Aid"),
        ("medication", "Medication"),
        ("mental_health", "Mental Health"),
        ("other", "Other"),
    ]

    name = models.CharField(max_length=200)
    category = models.CharField(max_length=30, choices=CATEGORY_CHOICES)
    is_mandatory = models.BooleanField(default=True)
    recurrence_months = models.PositiveIntegerField(default=12)
    care_home = models.ForeignKey(
        "staff.CareHome",
        on_delete=models.CASCADE,
        related_name="training_courses",
    )

    def __str__(self):
        return self.name


class StaffTrainingRecord(models.Model):
    class Status(models.TextChoices):
        VALID = "valid"
        EXPIRING_SOON = "expiring_soon"
        EXPIRED = "expired"
        NOT_COMPLETED = "not_completed"

    staff_member = models.ForeignKey(
        "authentication.User",
        on_delete=models.CASCADE,
        related_name="training_records",
    )
    course = models.ForeignKey(
        TrainingCourse,
        on_delete=models.CASCADE,
        related_name="records",
        null=True,
        blank=True,
    )
    course_name = models.CharField(max_length=200, blank=True)
    completed_date = models.DateField(null=True, blank=True)
    expiry_date = models.DateField(null=True, blank=True)
    provider = models.CharField(max_length=200, blank=True)
    notes = models.TextField(blank=True)

    @property
    def status(self):
        if not self.completed_date:
            return self.Status.NOT_COMPLETED
        if not self.expiry_date:
            return self.Status.VALID
        from django.utils import timezone
        today = timezone.now().date()
        if self.expiry_date < today:
            return self.Status.EXPIRED
        if (self.expiry_date - today).days <= 30:
            return self.Status.EXPIRING_SOON
        return self.Status.VALID

    class Meta:
        ordering = ["-completed_date"]

    def __str__(self):
        name = self.course.name if self.course else self.course_name
        return f"{self.staff_member} — {name}"
