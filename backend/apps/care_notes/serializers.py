from rest_framework import serializers
from .models import CareNote


class CareNoteSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(source="author.get_full_name", read_only=True)

    class Meta:
        model = CareNote
        fields = [
            "id", "resident", "author", "author_name",
            "shift", "category", "content", "mood",
            "recorded_at", "created_at",
        ]
        read_only_fields = ["id", "author", "created_at"]
