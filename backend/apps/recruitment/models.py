from django.db import models
from django.conf import settings


class JobPosting(models.Model):
    class Status(models.TextChoices):
        DRAFT = "draft", "Draft"
        OPEN = "open", "Open"
        CLOSED = "closed", "Closed"
        FILLED = "filled", "Filled"

    class ContractType(models.TextChoices):
        FULL_TIME = "full_time", "Full Time"
        PART_TIME = "part_time", "Part Time"
        BANK = "bank", "Bank"
        AGENCY = "agency", "Agency"

    care_home = models.ForeignKey("staff.CareHome", on_delete=models.CASCADE, related_name="job_postings")
    title = models.CharField(max_length=200)
    department = models.CharField(max_length=100, blank=True)
    contract_type = models.CharField(max_length=20, choices=ContractType.choices, default=ContractType.FULL_TIME)
    description = models.TextField(blank=True)
    salary_range = models.CharField(max_length=100, blank=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.DRAFT)
    posted_date = models.DateField(null=True, blank=True)
    closing_date = models.DateField(null=True, blank=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.title} ({self.status})"


class Applicant(models.Model):
    class AppStatus(models.TextChoices):
        APPLIED = "applied", "Applied"
        SHORTLISTED = "shortlisted", "Shortlisted"
        INTERVIEWED = "interviewed", "Interviewed"
        OFFERED = "offered", "Offered"
        HIRED = "hired", "Hired"
        REJECTED = "rejected", "Rejected"
        WITHDRAWN = "withdrawn", "Withdrawn"

    job_posting = models.ForeignKey(JobPosting, on_delete=models.CASCADE, related_name="applicants")
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField()
    phone = models.CharField(max_length=50, blank=True)
    status = models.CharField(max_length=20, choices=AppStatus.choices, default=AppStatus.APPLIED)
    applied_at = models.DateTimeField(auto_now_add=True)
    interview_date = models.DateTimeField(null=True, blank=True)
    notes = models.TextField(blank=True)
    right_to_work_verified = models.BooleanField(default=False)
    dbs_check_requested = models.BooleanField(default=False)
    updated_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-applied_at"]

    def __str__(self):
        return f"{self.first_name} {self.last_name} — {self.status}"
