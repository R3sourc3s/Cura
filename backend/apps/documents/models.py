from datetime import date

from django.db import models
from cura.validators import document_upload_validators


class Document(models.Model):
    class Category(models.TextChoices):
        POLICY = "policy", "Policy"
        PROCEDURE = "procedure", "Procedure"
        CERTIFICATE = "certificate", "Certificate"
        DBS = "dbs", "DBS Check"
        CONTRACT = "contract", "Contract"
        RESIDENT = "resident", "Resident Document"
        RISK_ASSESSMENT = "risk_assessment", "Risk Assessment"
        OTHER = "other", "Other"

    care_home = models.ForeignKey(
        "staff.CareHome",
        on_delete=models.CASCADE,
        related_name="documents",
    )
    resident = models.ForeignKey(
        "residents.Resident",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="documents",
    )
    staff_member = models.ForeignKey(
        "authentication.User",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="staff_documents",
    )
    uploaded_by = models.ForeignKey(
        "authentication.User",
        on_delete=models.SET_NULL,
        null=True,
        related_name="uploaded_documents",
    )
    category = models.CharField(max_length=20, choices=Category.choices)
    title = models.CharField(max_length=300)
    # Legacy single-file fields — retained for old records; new uploads use DocumentFile.
    file = models.FileField(upload_to="documents/%Y/%m/", blank=True, validators=document_upload_validators())
    file_size = models.PositiveIntegerField(default=0)
    file_type = models.CharField(max_length=50, blank=True)
    version = models.CharField(max_length=20, blank=True)
    expiry_date = models.DateField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.title} ({self.get_category_display()})"

    @property
    def is_expired(self):
        return bool(self.expiry_date and self.expiry_date < date.today())

    @property
    def total_size(self):
        return sum(f.file_size for f in self.files.all())


class DocumentFile(models.Model):
    document = models.ForeignKey(
        Document,
        on_delete=models.CASCADE,
        related_name="files",
    )
    file = models.FileField(upload_to="documents/%Y/%m/", validators=document_upload_validators())
    original_name = models.CharField(max_length=300, blank=True)
    file_size = models.PositiveIntegerField(default=0)
    file_type = models.CharField(max_length=100, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["created_at", "id"]

    def __str__(self):
        return self.original_name or self.file.name
