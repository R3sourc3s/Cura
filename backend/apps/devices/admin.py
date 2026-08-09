from django.contrib import admin
from .models import Device, DeviceReading


@admin.register(Device)
class DeviceAdmin(admin.ModelAdmin):
    list_display = ["name", "device_type", "care_home", "resident", "is_active", "battery_level", "last_seen_at"]
    list_filter = ["device_type", "is_active", "care_home"]
    search_fields = ["name", "external_id"]


@admin.register(DeviceReading)
class DeviceReadingAdmin(admin.ModelAdmin):
    list_display = ["device", "reading_type", "recorded_at", "resulting_incident", "resulting_vital_sign"]
    list_filter = ["reading_type"]
