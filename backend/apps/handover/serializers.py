from rest_framework import serializers
from .models import HandoverNote


class HandoverNoteSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(source="author.get_full_name", read_only=True)
    author_role = serializers.CharField(source="author.role", read_only=True)
    read_by_ids = serializers.PrimaryKeyRelatedField(source="read_by", many=True, read_only=True)
    residents_mentioned = serializers.PrimaryKeyRelatedField(many=True, queryset=__import__("apps.residents.models", fromlist=["Resident"]).Resident.objects.all(), required=False)

    class Meta:
        model = HandoverNote
        fields = [
            "id", "care_home", "author", "author_name", "author_role",
            "shift", "date", "priority", "content",
            "residents_mentioned", "read_by_ids",
            "created_at",
        ]
        read_only_fields = ["id", "care_home", "author", "created_at"]
