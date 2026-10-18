from django.db import models
from cura.validators import image_upload_validators


class Resident(models.Model):
    class RiskLevel(models.TextChoices):
        LOW = "low", "Low"
        MEDIUM = "medium", "Medium"
        HIGH = "high", "High"
        CRITICAL = "critical", "Critical"

    care_home = models.ForeignKey("staff.CareHome", on_delete=models.CASCADE, related_name="residents")
    wing = models.ForeignKey(
        "staff.Wing", on_delete=models.SET_NULL, null=True, blank=True, related_name="residents"
    )
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    date_of_birth = models.DateField()
    nhs_number = models.CharField(max_length=20, unique=True, blank=True)
    room_number = models.CharField(max_length=10)
    admission_date = models.DateField()
    discharge_date = models.DateField(null=True, blank=True)
    photo = models.ImageField(upload_to="residents/", null=True, blank=True, validators=image_upload_validators())

    # Key contacts
    next_of_kin_name = models.CharField(max_length=200, blank=True)
    next_of_kin_phone = models.CharField(max_length=20, blank=True)
    gp_name = models.CharField(max_length=200, blank=True)
    gp_phone = models.CharField(max_length=20, blank=True)

    # Risk
    fall_risk = models.CharField(max_length=10, choices=RiskLevel.choices, default=RiskLevel.LOW)
    pressure_ulcer_risk = models.CharField(max_length=10, choices=RiskLevel.choices, default=RiskLevel.LOW)
    ai_risk_score = models.IntegerField(default=0, help_text="0–100 composite AI risk score")

    # Status
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["last_name", "first_name"]

    def __str__(self):
        return f"{self.first_name} {self.last_name} (Room {self.room_number})"

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"

    @property
    def age(self):
        from django.utils import timezone
        from datetime import date
        today = timezone.now().date()
        dob = self.date_of_birth
        if isinstance(dob, str):
            dob = date.fromisoformat(dob)
        return today.year - dob.year - ((today.month, today.day) < (dob.month, dob.day))


class Condition(models.Model):
    resident = models.ForeignKey(Resident, on_delete=models.CASCADE, related_name="conditions")
    name = models.CharField(max_length=200)
    icd_code = models.CharField(max_length=20, blank=True)
    diagnosed_date = models.DateField(null=True, blank=True)
    notes = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.resident} — {self.name}"


class Allergy(models.Model):
    """Recorded allergy or adverse drug reaction. Drug allergies are checked on prescribing and administration."""

    class AllergyType(models.TextChoices):
        DRUG = "drug", "Drug"
        FOOD = "food", "Food"
        ENVIRONMENTAL = "environmental", "Environmental"
        OTHER = "other", "Other"

    class Severity(models.TextChoices):
        MILD = "mild", "Mild"
        MODERATE = "moderate", "Moderate"
        SEVERE = "severe", "Severe"
        ANAPHYLAXIS = "anaphylaxis", "Anaphylaxis"

    resident = models.ForeignKey(Resident, on_delete=models.CASCADE, related_name="allergies")
    allergen = models.CharField(max_length=200, help_text="Drug, drug class (e.g. 'Penicillins'), food or substance")
    allergy_type = models.CharField(max_length=20, choices=AllergyType.choices, default=AllergyType.DRUG)
    severity = models.CharField(max_length=20, choices=Severity.choices, default=Severity.MODERATE)
    reaction = models.CharField(max_length=300, blank=True, help_text="e.g. 'Rash', 'Swollen lips and wheeze'")
    recorded_by = models.ForeignKey(
        "authentication.User", on_delete=models.SET_NULL, null=True, blank=True, related_name="+"
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-is_active", "allergen"]
        verbose_name_plural = "allergies"

    def __str__(self):
        return f"{self.resident} — {self.allergen} ({self.severity})"
