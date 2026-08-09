from django.conf import settings
from django.db import models


class Device(models.Model):
    """
    A wearable, fall sensor, bed/motion sensor, or other ambient monitoring
    device registered against a care home (and optionally assigned to a
    resident). Cura's answer to the gap Empathika's own NHS DTAC filing
    admits it has: no wearable or ambient-sensor integration at all.
    """

    class DeviceType(models.TextChoices):
        WEARABLE = "wearable", "Wearable (watch / pendant)"
        FALL_SENSOR = "fall_sensor", "Fall sensor"
        BED_SENSOR = "bed_sensor", "Bed occupancy sensor"
        MOTION_SENSOR = "motion_sensor", "Motion / ambient sensor"
        DOOR_SENSOR = "door_sensor", "Door sensor"
        OTHER = "other", "Other"

    care_home = models.ForeignKey("staff.CareHome", on_delete=models.CASCADE, related_name="devices")
    resident = models.ForeignKey("residents.Resident", on_delete=models.SET_NULL, null=True, blank=True, related_name="devices")
    name = models.CharField(max_length=100)
    device_type = models.CharField(max_length=20, choices=DeviceType.choices, default=DeviceType.WEARABLE)
    external_id = models.CharField(max_length=100, unique=True, help_text="Identifier the physical device/gateway sends when reporting data")
    manufacturer = models.CharField(max_length=100, blank=True)
    battery_level = models.PositiveSmallIntegerField(null=True, blank=True, help_text="%")
    is_active = models.BooleanField(default=True)
    last_seen_at = models.DateTimeField(null=True, blank=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name="devices_registered")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.name} ({self.get_device_type_display()})"


class DeviceReading(models.Model):
    """A single data point pushed in from a device — fall alert, vitals snapshot, motion event, battery report, etc."""

    class ReadingType(models.TextChoices):
        FALL_DETECTED = "fall_detected", "Fall detected"
        VITALS = "vitals", "Vitals"
        MOTION = "motion", "Motion"
        BATTERY = "battery", "Battery report"
        OTHER = "other", "Other"

    device = models.ForeignKey(Device, on_delete=models.CASCADE, related_name="readings")
    reading_type = models.CharField(max_length=20, choices=ReadingType.choices)
    recorded_at = models.DateTimeField()
    data = models.JSONField(default=dict, blank=True, help_text="Raw payload as reported by the device")

    resulting_incident = models.ForeignKey("incidents.Incident", on_delete=models.SET_NULL, null=True, blank=True, related_name="device_readings")
    resulting_vital_sign = models.ForeignKey("vitals.VitalSign", on_delete=models.SET_NULL, null=True, blank=True, related_name="device_readings")

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-recorded_at"]

    def __str__(self):
        return f"{self.device} — {self.reading_type} @ {self.recorded_at:%Y-%m-%d %H:%M}"
