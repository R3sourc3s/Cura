from django.utils import timezone

from apps.incidents.models import Incident
from apps.vitals.models import VitalSign
from apps.integrations.webhooks import dispatch as dispatch_webhook
from .models import Device, DeviceReading

# Keys in the ingest payload's `data` dict that map directly onto VitalSign fields.
_VITAL_FIELDS = ["bp_systolic", "bp_diastolic", "pulse", "temperature", "oxygen_saturation", "weight", "blood_glucose"]


def ingest_reading(care_home, validated_data: dict) -> DeviceReading:
    """
    Resolves (or auto-registers) the reporting device, stores the raw reading,
    and — for readings that warrant it — auto-creates the downstream clinical
    record (a Fall incident, or a VitalSign snapshot) so staff don't have to
    manually transcribe what the sensor already knows.
    """
    device, _created = Device.objects.get_or_create(
        care_home=care_home,
        external_id=validated_data["external_id"],
        defaults={
            "name": validated_data.get("device_name") or validated_data["external_id"],
            "device_type": validated_data.get("device_type", Device.DeviceType.WEARABLE),
        },
    )

    recorded_at = validated_data.get("recorded_at") or timezone.now()
    battery_level = validated_data.get("battery_level")

    update_fields = ["last_seen_at"]
    device.last_seen_at = timezone.now()
    if battery_level is not None:
        device.battery_level = battery_level
        update_fields.append("battery_level")
    device.save(update_fields=update_fields)

    reading = DeviceReading.objects.create(
        device=device,
        reading_type=validated_data["reading_type"],
        recorded_at=recorded_at,
        data=validated_data.get("data") or {},
    )

    if reading.reading_type == DeviceReading.ReadingType.FALL_DETECTED and device.resident_id:
        description = f"Automatically detected by {device.name} ({device.get_device_type_display()})."
        if reading.data:
            description += f" Raw sensor data: {reading.data}"
        incident = Incident.objects.create(
            care_home=care_home,
            resident=device.resident,
            incident_type=Incident.IncidentType.FALL,
            severity=Incident.Severity.HIGH,
            incident_date=recorded_at,
            description=description,
            reported_by=None,
        )
        reading.resulting_incident = incident
        reading.save(update_fields=["resulting_incident"])
        dispatch_webhook(care_home, "device.fall_detected", {
            "device_id": device.id, "device_name": device.name, "resident_id": device.resident_id,
            "incident_id": incident.id, "recorded_at": recorded_at.isoformat(),
        })

    elif reading.reading_type == DeviceReading.ReadingType.VITALS and device.resident_id:
        vitals_kwargs = {k: v for k, v in reading.data.items() if k in _VITAL_FIELDS and v is not None}
        if vitals_kwargs:
            vital_sign = VitalSign.objects.create(
                resident=device.resident,
                recorded_by=None,
                recorded_at=recorded_at,
                notes=f"Recorded automatically by {device.name}.",
                **vitals_kwargs,
            )
            reading.resulting_vital_sign = vital_sign
            reading.save(update_fields=["resulting_vital_sign"])
            dispatch_webhook(care_home, "device.vitals_recorded", {
                "device_id": device.id, "device_name": device.name, "resident_id": device.resident_id,
                "vital_sign_id": vital_sign.id, "recorded_at": recorded_at.isoformat(),
            })

    return reading
