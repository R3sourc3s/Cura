from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    class Role(models.TextChoices):
        ADMIN = "admin", "Admin"
        MANAGER = "manager", "Care Manager"
        NURSE = "nurse", "Nurse"
        CARER = "carer", "Carer"
        HR = "hr", "HR"

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

    class Meta:
        db_table = "auth_user"

    def __str__(self):
        return f"{self.get_full_name()} ({self.role})"
