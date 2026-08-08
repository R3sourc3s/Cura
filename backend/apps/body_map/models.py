from django.db import models


class WoundRecord(models.Model):
    class WoundType(models.TextChoices):
        PRESSURE_ULCER = "pressure_ulcer", "Pressure Ulcer"
        LACERATION = "laceration", "Laceration"
        BRUISE = "bruise", "Bruise"
        BURN = "burn", "Burn"
        SURGICAL = "surgical", "Surgical Wound"
        SKIN_TEAR = "skin_tear", "Skin Tear"
        OTHER = "other", "Other"

    class Grade(models.TextChoices):
        G1 = "1", "Grade 1"
        G2 = "2", "Grade 2"
        G3 = "3", "Grade 3"
        G4 = "4", "Grade 4"
        UNSTAGEABLE = "unstageable", "Unstageable"

    BODY_SIDE_CHOICES = [
        ("front", "Front"), ("back", "Back"), ("left", "Left Side"), ("right", "Right Side"),
        ("head-front", "Head — Front"), ("head-back", "Head — Back"),
        ("head-left", "Head — Left"), ("head-right", "Head — Right"), ("head-top", "Head — Top"),
    ]

    resident = models.ForeignKey(
        "residents.Resident",
        on_delete=models.CASCADE,
        related_name="wounds",
    )
    wound_type = models.CharField(max_length=20, choices=WoundType.choices)
    grade = models.CharField(max_length=12, choices=Grade.choices, blank=True)
    body_side = models.CharField(max_length=12, choices=BODY_SIDE_CHOICES)
    location_x = models.FloatField(help_text="X position as % of body diagram width")
    location_y = models.FloatField(help_text="Y position as % of body diagram height")
    location_label = models.CharField(max_length=100, blank=True)
    description = models.TextField()
    first_observed = models.DateField()
    healed_date = models.DateField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_by = models.ForeignKey(
        "authentication.User",
        on_delete=models.SET_NULL,
        null=True,
        related_name="created_wounds",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.get_wound_type_display()} — {self.resident} ({self.first_observed})"


class WoundAssessment(models.Model):
    wound = models.ForeignKey(
        WoundRecord,
        on_delete=models.CASCADE,
        related_name="assessments",
    )
    assessed_by = models.ForeignKey(
        "authentication.User",
        on_delete=models.SET_NULL,
        null=True,
        related_name="wound_assessments",
    )
    assessment_date = models.DateField()
    length_cm = models.DecimalField(max_digits=5, decimal_places=1, null=True, blank=True)
    width_cm = models.DecimalField(max_digits=5, decimal_places=1, null=True, blank=True)
    depth_cm = models.DecimalField(max_digits=5, decimal_places=1, null=True, blank=True)
    appearance = models.TextField(blank=True)
    treatment = models.TextField(blank=True)
    dressing_used = models.CharField(max_length=200, blank=True)
    next_review = models.DateField(null=True, blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-assessment_date"]

    def __str__(self):
        return f"Assessment of {self.wound} on {self.assessment_date}"
