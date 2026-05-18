from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
from apps.authentication.permissions import require
from .models import Skill, StaffSkill
from .serializers import SkillSerializer, StaffSkillSerializer


class SkillViewSet(viewsets.ModelViewSet):
    serializer_class = SkillSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ["category", "is_mandatory"]
    search_fields = ["name", "description"]

    def get_permissions(self):
        if self.action in ("list", "retrieve"):
            return [require("skills.view")]
        return [require("skills.manage")]

    def get_queryset(self):
        return Skill.objects.filter(care_home=self.request.user.care_home)

    def perform_create(self, serializer):
        serializer.save(care_home=self.request.user.care_home)


class StaffSkillViewSet(viewsets.ModelViewSet):
    serializer_class = StaffSkillSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["skill", "staff_member", "proficiency", "certified"]
    search_fields = ["staff_member__first_name", "staff_member__last_name", "skill__name"]
    ordering_fields = ["certification_expiry", "acquired_date"]

    def get_permissions(self):
        if self.action in ("list", "retrieve"):
            return [require("skills.view")]
        return [require("skills.manage")]

    def get_queryset(self):
        return StaffSkill.objects.select_related("staff_member", "skill", "verified_by").filter(
            staff_member__care_home=self.request.user.care_home
        )
