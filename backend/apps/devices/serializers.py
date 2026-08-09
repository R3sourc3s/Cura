from rest_framework import serializers
from .models import Device, DeviceReading


class DeviceReadingSerializer(serializers.ModelSerializer):
    class Meta:
        model = DeviceReading
        fields = ["id", "reading_type", "recorded_at", "data", "resulting_incident", "resulting_vital_sign", "created_at"]
        read_only_fields = fields


class DeviceSerializer(serializers.ModelSerializer):
    resident_name = serializers.CharField(source="resident.full_name", read_only=True, default=None)
    device_type_display = serializers.CharField(source="get_device_type_display", read_only=True)
    latest_reading = serializers.SerializerMethodField()

    class Meta:
        model = Device
        fields = [
            "id", "name", "device_type", "device_type_display", "external_id", "manufacturer",
            "resident", "resident_name", "battery_level", "is_active", "last_seen_at",
            "created_at", "latest_reading",
        ]
        read_only_fields = ["id", "battery_level", "last_seen_at", "created_at"]

    def get_latest_reading(self, obj):
        reading = obj.readings.first()
        return DeviceReadingSerializer(reading).data if reading else None


class DeviceIngestSerializer(serializers.Serializer):
    """Payload shape a device/gateway posts to the ingestion endpoint."""
    external_id = serializers.CharField(max_length=100)
    reading_type = serializers.ChoiceField(choices=DeviceReading.ReadingType.choices)
    recorded_at = serializers.DateTimeField(required=False)
    data = serializers.JSONField(required=False, default=dict)
    # Optional device metadata — used to auto-register a device on first contact.
    device_name = serializers.CharField(max_length=100, required=False)
    device_type = serializers.ChoiceField(choices=Device.DeviceType.choices, required=False)
    battery_level = serializers.IntegerField(required=False, min_value=0, max_value=100)
