from rest_framework import serializers
from .models import Task


class TaskSerializer(serializers.ModelSerializer):
    assigned_to_name = serializers.CharField(source="assigned_to.get_full_name", read_only=True)
    created_by_name = serializers.CharField(source="created_by.get_full_name", read_only=True)
    resident_name = serializers.CharField(source="resident.full_name", read_only=True)

    class Meta:
        model = Task
        fields = "__all__"
        read_only_fields = ["care_home", "created_by", "created_at", "updated_at"]
