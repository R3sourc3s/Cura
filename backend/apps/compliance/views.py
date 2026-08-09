from rest_framework import viewsets, decorators, response
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Avg
from apps.authentication.permissions import require
from .models import ComplianceAudit, AuditAction, Policy, Accreditation
from .serializers import ComplianceAuditSerializer, AuditActionSerializer, PolicySerializer, AccreditationSerializer


class ComplianceAuditViewSet(viewsets.ModelViewSet):
    serializer_class = ComplianceAuditSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["domain", "rating"]

    def get_permissions(self):
        if self.action in ("list", "retrieve", "overall_score"):
            return [require("compliance.view")]
        return [require("compliance.manage")]

    def get_queryset(self):
        return ComplianceAudit.objects.select_related(
            "care_home", "conducted_by"
        ).prefetch_related("actions").filter(care_home=self.request.user.care_home)

    def perform_create(self, serializer):
        serializer.save(
            care_home=self.request.user.care_home,
            conducted_by=self.request.user,
        )

    @decorators.action(detail=False, methods=["get"], url_path="overall-score")
    def overall_score(self, request):
        result = self.get_queryset().values("domain").annotate(avg_score=Avg("score"))
        return response.Response(list(result))


class AuditActionViewSet(viewsets.ModelViewSet):
    serializer_class = AuditActionSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["audit", "status", "priority"]

    def get_permissions(self):
        if self.action in ("list", "retrieve"):
            return [require("compliance.view")]
        return [require("compliance.manage")]

    def get_queryset(self):
        return AuditAction.objects.select_related("audit", "assigned_to").filter(
            audit__care_home=self.request.user.care_home
        )


class AccreditationViewSet(viewsets.ModelViewSet):
    serializer_class = AccreditationSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["category", "status"]

    def get_permissions(self):
        if self.action in ("list", "retrieve"):
            return [require("compliance.view")]
        return [require("compliance.manage")]

    def get_queryset(self):
        return Accreditation.objects.filter(care_home=self.request.user.care_home)

    def perform_create(self, serializer):
        serializer.save(care_home=self.request.user.care_home)


class PolicyViewSet(viewsets.ModelViewSet):
    serializer_class = PolicySerializer
    filter_backends = [DjangoFilterBackend]

    def get_permissions(self):
        if self.action in ("list", "retrieve"):
            return [require("compliance.view")]
        return [require("compliance.manage")]

    def get_queryset(self):
        return Policy.objects.select_related("care_home", "approved_by").filter(
            care_home=self.request.user.care_home
        )
