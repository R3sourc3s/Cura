from rest_framework import serializers
from .models import StaffMessage


class StaffMessageSerializer(serializers.ModelSerializer):
    author = serializers.PrimaryKeyRelatedField(read_only=True)
    author_name = serializers.SerializerMethodField()
    author_role = serializers.SerializerMethodField()

    class Meta:
        model = StaffMessage
        fields = [
            "id",
            "channel",
            "author",
            "author_name",
            "author_role",
            "content",
            "is_pinned",
            "created_at",
        ]
        read_only_fields = ["id", "author", "author_name", "author_role", "created_at"]

    def get_author_name(self, obj):
        if obj.author is None:
            return "Unknown"
        full_name = obj.author.get_full_name()
        return full_name if full_name.strip() else obj.author.username

    def get_author_role(self, obj):
        if obj.author is None:
            return None
        return getattr(obj.author, "role", None)
