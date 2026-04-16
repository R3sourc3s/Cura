from rest_framework import viewsets, decorators, response
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Avg
from .models import ComplianceAudit, AuditAction, Policy
from .serializers import ComplianceAuditSerializer, AuditActionSerializer, PolicySerializer


class ComplianceAuditViewSet(viewsets.ModelViewSet):
    queryset = ComplianceAudit.objects.select_related("care_home", "conducted_by").prefetch_related("actions")
    serializer_class = ComplianceAuditSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["care_home", "domain", "rating"]

    @decorators.action(detail=False, methods=["get"], url_path="overall-score")
    def overall_score(self, request):
        care_home = request.query_params.get("care_home")
        qs = self.get_queryset()
        if care_home:
            qs = qs.filter(care_home=care_home)
        result = qs.values("domain").annotate(avg_score=Avg("score"))
        return response.Response(list(result))


class AuditActionViewSet(viewsets.ModelViewSet):
    queryset = AuditAction.objects.select_related("audit", "assigned_to")
    serializer_class = AuditActionSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["audit", "status", "priority"]


class PolicyViewSet(viewsets.ModelViewSet):
    queryset = Policy.objects.select_related("care_home", "approved_by")
    serializer_class = PolicySerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["care_home"]
