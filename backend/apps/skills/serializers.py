from rest_framework import serializers
from .models import Skill, StaffSkill


class SkillSerializer(serializers.ModelSerializer):
    staff_count = serializers.SerializerMethodField()

    class Meta:
        model = Skill
        fields = "__all__"
        read_only_fields = ["care_home"]

    def get_staff_count(self, obj):
        return obj.staff_skills.count()


class StaffSkillSerializer(serializers.ModelSerializer):
    staff_name = serializers.CharField(source="staff_member.get_full_name", read_only=True)
    skill_name = serializers.CharField(source="skill.name", read_only=True)
    skill_category = serializers.CharField(source="skill.category", read_only=True)
    verified_by_name = serializers.CharField(source="verified_by.get_full_name", read_only=True)
    is_expiring_soon = serializers.BooleanField(read_only=True)

    class Meta:
        model = StaffSkill
        fields = "__all__"
        read_only_fields = ["created_at", "updated_at"]
