from django.db import models
from django.conf import settings


class GPContact(models.Model):
    care_home = models.ForeignKey("staff.CareHome", on_delete=models.CASCADE, related_name="gp_contacts")
    practice_name = models.CharField(max_length=200)
    gp_name = models.CharField(max_length=200)
    phone = models.CharField(max_length=50, blank=True)
    fax = models.CharField(max_length=50, blank=True)
    email = models.EmailField(blank=True)
    address = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["practice_name"]

    def __str__(self):
        return f"{self.gp_name} — {self.practice_name}"


class HospitalContact(models.Model):
    care_home = models.ForeignKey("staff.CareHome", on_delete=models.CASCADE, related_name="hospital_contacts")
    hospital_name = models.CharField(max_length=200)
    department = models.CharField(max_length=200, blank=True)
    phone = models.CharField(max_length=50, blank=True)
    address = models.TextField(blank=True)
    notes = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["hospital_name"]

    def __str__(self):
        return f"{self.hospital_name} — {self.department}"


class DischargeSummary(models.Model):
    class Status(models.TextChoices):
        RECEIVED = "received", "Received"
        REVIEWED = "reviewed", "Reviewed"
        ACTION_REQUIRED = "action_required", "Action Required"
        COMPLETED = "completed", "Completed"

    resident = models.ForeignKey("residents.Resident", on_delete=models.CASCADE, related_name="discharge_summaries")
    hospital = models.ForeignKey(HospitalContact, on_delete=models.SET_NULL, null=True, blank=True)
    admission_date = models.DateField()
    discharge_date = models.DateField()
    diagnosis = models.TextField(blank=True)
    treatment_summary = models.TextField(blank=True)
    follow_up_actions = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.RECEIVED)
    reviewed_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    received_at = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-discharge_date"]

    def __str__(self):
        return f"{self.resident} discharge {self.discharge_date}"


class Referral(models.Model):
    class ReferralType(models.TextChoices):
        GP = "gp", "GP"
        SPECIALIST = "specialist", "Specialist"
        HOSPITAL = "hospital", "Hospital"
        COMMUNITY = "community", "Community Service"
        MENTAL_HEALTH = "mental_health", "Mental Health"
        PHYSIO = "physio", "Physiotherapy"
        OTHER = "other", "Other"

    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        SENT = "sent", "Sent"
        ACKNOWLEDGED = "acknowledged", "Acknowledged"
        APPOINTMENT_BOOKED = "appointment_booked", "Appointment Booked"
        COMPLETED = "completed", "Completed"
        REJECTED = "rejected", "Rejected"

    resident = models.ForeignKey("residents.Resident", on_delete=models.CASCADE, related_name="referrals")
    referral_type = models.CharField(max_length=20, choices=ReferralType.choices)
    referred_to = models.CharField(max_length=200)
    reason = models.TextField()
    urgency = models.CharField(max_length=20, choices=[("routine", "Routine"), ("urgent", "Urgent"), ("emergency", "Emergency")], default="routine")
    status = models.CharField(max_length=30, choices=Status.choices, default=Status.PENDING)
    referred_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name="referrals_made")
    referral_date = models.DateField()
    appointment_date = models.DateTimeField(null=True, blank=True)
    outcome = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-referral_date"]

    def __str__(self):
        return f"{self.resident} — {self.referral_type} to {self.referred_to}"
