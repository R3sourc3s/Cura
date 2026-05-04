from rest_framework import serializers
from .models import Document


class DocumentSerializer(serializers.ModelSerializer):
    file_url = serializers.SerializerMethodField()
    uploaded_by_name = serializers.CharField(
        source="uploaded_by.get_full_name",
        read_only=True,
    )
    is_expired = serializers.BooleanField(read_only=True)

    class Meta:
        model = Document
        fields = [
            "id", "care_home", "resident", "staff_member",
            "uploaded_by", "uploaded_by_name",
            "category", "title",
            "file", "file_url", "file_size", "file_type",
            "version", "expiry_date", "is_active",
            "notes", "created_at", "is_expired",
        ]
        read_only_fields = [
            "id", "care_home", "uploaded_by",
            "file_size", "file_type",
            "created_at",
        ]

    def get_file_url(self, obj):
        if not obj.file:
            return ""
        request = self.context.get("request")
        if request:
            return request.build_absolute_uri(obj.file.url)
        return obj.file.url
