import os

from rest_framework import serializers
from .models import Document, DocumentFile


class DocumentFileSerializer(serializers.ModelSerializer):
    file_url = serializers.SerializerMethodField()
    name = serializers.SerializerMethodField()

    class Meta:
        model = DocumentFile
        fields = ["id", "name", "file_url", "file_size", "file_type", "created_at"]

    def get_file_url(self, obj):
        if not obj.file:
            return ""
        request = self.context.get("request")
        return request.build_absolute_uri(obj.file.url) if request else obj.file.url

    def get_name(self, obj):
        return obj.original_name or os.path.basename(obj.file.name)


class DocumentSerializer(serializers.ModelSerializer):
    files = DocumentFileSerializer(many=True, read_only=True)
    file_count = serializers.SerializerMethodField()
    total_size = serializers.IntegerField(read_only=True)
    uploaded_by_name = serializers.CharField(
        source="uploaded_by.get_full_name",
        read_only=True,
    )
    resident_name = serializers.SerializerMethodField()
    staff_member_name = serializers.SerializerMethodField()
    is_expired = serializers.BooleanField(read_only=True)

    class Meta:
        model = Document
        fields = [
            "id", "care_home",
            "resident", "resident_name",
            "staff_member", "staff_member_name",
            "uploaded_by", "uploaded_by_name",
            "category", "title",
            "files", "file_count", "total_size",
            "version", "expiry_date", "is_active",
            "notes", "created_at", "is_expired",
        ]
        # resident/staff_member are set in the view (with care-home scoping),
        # so they're read-only here and echoed back for display.
        read_only_fields = [
            "id", "care_home", "resident", "staff_member",
            "uploaded_by", "created_at",
        ]

    def get_file_count(self, obj):
        return obj.files.count()

    def get_resident_name(self, obj):
        return obj.resident.full_name if obj.resident_id else None

    def get_staff_member_name(self, obj):
        return obj.staff_member.get_full_name() if obj.staff_member_id else None
