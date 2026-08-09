from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    class Role(models.TextChoices):
        ADMIN = "admin", "Admin"
        MANAGER = "manager", "Care Manager"
        NURSE = "nurse", "Nurse"
        CARER = "carer", "Carer"
        HR = "hr", "HR"
        FAMILY = "family", "Family"

    role = models.CharField(max_length=20, choices=Role.choices, default=Role.CARER)
    care_home = models.ForeignKey(
        "staff.CareHome",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="users",
    )
    phone = models.CharField(max_length=20, blank=True)
    avatar = models.ImageField(upload_to="avatars/", null=True, blank=True)
    is_group_admin = models.BooleanField(
        default=False,
        help_text="Can view the cross-home Group Oversight dashboard for their care home's group.",
    )

    class Meta:
        db_table = "auth_user"

    def __str__(self):
        return f"{self.get_full_name()} ({self.role})"


class FamilyContact(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="family_contact")
    resident = models.ForeignKey(
        "residents.Resident",
        on_delete=models.CASCADE,
        related_name="family_contacts",
    )
    relationship = models.CharField(max_length=100, blank=True)

    def __str__(self):
        return f"{self.user.get_full_name()} → {self.resident}"
