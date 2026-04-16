from django.contrib import admin
from .models import CareHome, Shift, LeaveRequest, Training


@admin.register(CareHome)
class CareHomeAdmin(admin.ModelAdmin):
    list_display = ["name", "cqc_registration_number", "bed_count", "is_active"]


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
