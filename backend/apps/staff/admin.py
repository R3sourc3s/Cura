from django.contrib import admin
from .models import CareHome, CareHomeGroup, Shift, LeaveRequest, Training, Wing


@admin.register(CareHomeGroup)
class CareHomeGroupAdmin(admin.ModelAdmin):
    list_display = ["name", "created_at"]


@admin.register(CareHome)
class CareHomeAdmin(admin.ModelAdmin):
    list_display = ["name", "group", "cqc_registration_number", "bed_count", "is_active"]
    list_filter = ["group", "is_active"]


@admin.register(Wing)
class WingAdmin(admin.ModelAdmin):
    list_display = ["name", "care_home", "floor", "bed_count", "lead_staff", "is_active"]
    list_filter = ["care_home", "is_active"]


@admin.register(Shift)
class ShiftAdmin(admin.ModelAdmin):
    list_display = ["staff_member", "date", "shift_type", "start_time", "end_time", "is_agency"]
    list_filter = ["shift_type", "is_agency", "care_home"]


@admin.register(LeaveRequest)
class LeaveRequestAdmin(admin.ModelAdmin):
    list_display = ["staff_member", "leave_type", "start_date", "end_date", "status"]
    list_filter = ["status", "leave_type"]


@admin.register(Training)
class TrainingAdmin(admin.ModelAdmin):
    list_display = ["staff_member", "course_name", "status", "expiry_date"]
    list_filter = ["status"]
