from django.db import models
from django.conf import settings


class Enquiry(models.Model):
    class Status(models.TextChoices):
        NEW = "new", "New"
        IN_PROGRESS = "in_progress", "In Progress"
        ASSESSMENT_BOOKED = "assessment_booked", "Assessment Booked"
        WAITLISTED = "waitlisted", "Waitlisted"
        ADMITTED = "admitted", "Admitted"
        DECLINED = "declined", "Declined"
        WITHDRAWN = "withdrawn", "Withdrawn"

    class FundingType(models.TextChoices):
        SELF_FUNDED = "self_funded", "Self-Funded"
        LOCAL_AUTHORITY = "local_authority", "Local Authority"
        NHS = "nhs", "NHS Continuing Healthcare"
        MIXED = "mixed", "Mixed Funding"
        UNKNOWN = "unknown", "Unknown"

    care_home = models.ForeignKey("staff.CareHome", on_delete=models.CASCADE, related_name="enquiries")
    prospective_resident_name = models.CharField(max_length=200)
    date_of_birth = models.DateField(null=True, blank=True)
    contact_name = models.CharField(max_length=200)
    contact_relationship = models.CharField(max_length=100, blank=True)
    contact_phone = models.CharField(max_length=50, blank=True)
    contact_email = models.EmailField(blank=True)
    care_needs = models.TextField(blank=True)
    funding_type = models.CharField(max_length=20, choices=FundingType.choices, default=FundingType.UNKNOWN)
    status = models.CharField(max_length=30, choices=Status.choices, default=Status.NEW)
    enquiry_date = models.DateField()
    assessment_date = models.DateTimeField(null=True, blank=True)
    notes = models.TextField(blank=True)
    assigned_to = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-enquiry_date"]

    def __str__(self):
        return f"{self.prospective_resident_name} — {self.status}"


class PreAdmissionAssessment(models.Model):
    class Outcome(models.TextChoices):
        SUITABLE = "suitable", "Suitable for Admission"
        NOT_SUITABLE = "not_suitable", "Not Suitable"
        FURTHER_INFO = "further_info", "Further Information Required"
        PENDING = "pending", "Pending Review"

    enquiry = models.OneToOneField(Enquiry, on_delete=models.CASCADE, related_name="assessment")
    assessment_date = models.DateField()
    assessor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    mobility_needs = models.TextField(blank=True)
    medical_needs = models.TextField(blank=True)
    cognitive_assessment = models.TextField(blank=True)
    social_needs = models.TextField(blank=True)
    outcome = models.CharField(max_length=20, choices=Outcome.choices, default=Outcome.PENDING)
    outcome_notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-assessment_date"]

    def __str__(self):
        return f"Assessment for {self.enquiry.prospective_resident_name}"
