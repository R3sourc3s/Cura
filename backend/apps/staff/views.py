import math
from datetime import datetime, date as date_cls
from django.utils import timezone
from rest_framework import viewsets, filters
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django_filters import rest_framework as df
from django_filters.rest_framework import DjangoFilterBackend
from apps.authentication.permissions import require, user_has_perm
from .models import CareHome, Shift, LeaveRequest, Training, Wing
from .serializers import CareHomeSerializer, ShiftSerializer, LeaveRequestSerializer, TrainingSerializer, WingSerializer

# Illustrative baseline ratios (residents per staff member) used only to flag likely
# understaffing for managers to review — not a regulatory or clinical standard.
_BASELINE_RATIO = {"day": 6.0, "evening": 8.0, "night": 12.0}

# Acuity weight per resident, based on the higher of their fall/pressure-ulcer risk —
# a resident flagged high/critical risk counts as more than one "unit" of care demand.
_ACUITY_WEIGHT = {"low": 1.0, "medium": 1.25, "high": 1.75, "critical": 2.5}


class CareHomeViewSet(viewsets.ModelViewSet):
    queryset = CareHome.objects.all()
    serializer_class = CareHomeSerializer

    def get_permissions(self):
        # Only admins can manage care homes
        return [require("team.manage")]


class WingViewSet(viewsets.ModelViewSet):
    serializer_class = WingSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ["is_active"]

    def get_permissions(self):
        if self.action in ("list", "retrieve"):
            return [require("residents.view")]
        return [require("team.manage")]

    def get_queryset(self):
        return Wing.objects.select_related("lead_staff").prefetch_related("residents").filter(
            care_home=self.request.user.care_home
        )

    def perform_create(self, serializer):
        serializer.save(care_home=self.request.user.care_home)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def wing_oversight(request):
    """Central, multi-wing occupancy + roster snapshot for a care home."""
    care_home = request.user.care_home
    now = timezone.localtime()
    today = now.date()

    wings = Wing.objects.filter(care_home=care_home, is_active=True).prefetch_related("residents")
    on_shift_now = Shift.objects.filter(
        care_home=care_home, date=today, start_time__lte=now.time(), end_time__gte=now.time()
    ).select_related("staff_member")

    data = []
    for wing in wings:
        active_residents = [r for r in wing.residents.all() if r.is_active]
        data.append({
            "id": wing.id,
            "name": wing.name,
            "floor": wing.floor,
            "bed_count": wing.bed_count,
            "occupied": len(active_residents),
            "occupancy_pct": round((len(active_residents) / wing.bed_count) * 100, 1) if wing.bed_count else None,
            "lead_staff_name": wing.lead_staff.get_full_name() if wing.lead_staff else None,
            "high_risk_count": sum(1 for r in active_residents if r.fall_risk in ("high", "critical")),
            "residents": [
                {"id": r.id, "full_name": r.full_name, "room_number": r.room_number, "fall_risk": r.fall_risk}
                for r in active_residents
            ],
        })

    from apps.residents.models import Resident
    unassigned_count = Resident.objects.filter(care_home=care_home, is_active=True, wing__isnull=True).count()

    return Response({
        "wings": data,
        "unassigned_residents": unassigned_count,
        "staff_on_shift_now": [
            {"id": s.staff_member_id, "name": s.staff_member.get_full_name(), "shift_type": s.shift_type}
            for s in on_shift_now
        ],
        "generated_at": now.isoformat(),
    })


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def staffing_coverage(request):
    """
    Sona.ai-style staffing coverage check: compares rostered staff against an
    acuity-weighted measure of resident care demand for a given date, and flags
    shifts that look understaffed. Acuity weighting uses each active resident's
    higher of fall_risk / pressure_ulcer_risk — a ready-made signal Cura already
    records, rather than a new assessment staff have to fill in.
    """
    if not user_has_perm(request.user, "staff.view"):
        return Response({"detail": "Permission denied."}, status=403)

    care_home = request.user.care_home
    date_param = request.query_params.get("date")
    try:
        target_date = date_cls.fromisoformat(date_param) if date_param else timezone.localdate()
    except ValueError:
        return Response({"detail": "date must be YYYY-MM-DD"}, status=400)

    from apps.residents.models import Resident
    residents = Resident.objects.filter(care_home=care_home, is_active=True)
    acuity_load = sum(
        _ACUITY_WEIGHT.get(max(r.fall_risk, r.pressure_ulcer_risk, key=lambda v: _ACUITY_WEIGHT.get(v, 1.0)), 1.0)
        for r in residents
    )
    resident_count = residents.count()

    shifts = Shift.objects.filter(care_home=care_home, date=target_date).select_related("staff_member")

    breakdown = []
    for shift_type, label in Shift.ShiftType.choices:
        shift_list = [s for s in shifts if s.shift_type == shift_type]
        staff_count = len(shift_list)
        agency_count = sum(1 for s in shift_list if s.is_agency)
        ratio = _BASELINE_RATIO.get(shift_type, 8.0)
        recommended_staff = math.ceil(acuity_load / ratio) if acuity_load else 0
        breakdown.append({
            "shift_type": shift_type,
            "shift_type_label": label,
            "staff_count": staff_count,
            "agency_count": agency_count,
            "recommended_staff": max(recommended_staff, 1 if resident_count else 0),
            "understaffed": staff_count < recommended_staff,
            "gap": max(recommended_staff - staff_count, 0),
            "staff": [
                {"id": s.staff_member_id, "name": s.staff_member.get_full_name(), "is_agency": s.is_agency}
                for s in shift_list
            ],
        })

    return Response({
        "date": target_date.isoformat(),
        "resident_count": resident_count,
        "acuity_weighted_load": round(acuity_load, 1),
        "high_acuity_count": sum(
            1 for r in residents if r.fall_risk in ("high", "critical") or r.pressure_ulcer_risk in ("high", "critical")
        ),
        "shifts": breakdown,
    })


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def group_oversight(request):
    """
    Cross-home rollup for operators running more than one care home under Cura
    — the multi-site "enterprise suite" gap flagged against Access Group.
    Gated by a per-user is_group_admin flag rather than a role, since seeing
    another home's data is a tenancy boundary, not a job-function permission.
    """
    user = request.user
    if not user.is_group_admin or not user.care_home_id or not user.care_home.group_id:
        return Response({"detail": "Not part of a care home group, or not authorised to view group oversight."}, status=403)

    from apps.residents.models import Resident
    from apps.incidents.models import Incident
    from apps.compliance.models import ComplianceAudit

    group = user.care_home.group
    homes = CareHome.objects.filter(group=group, is_active=True)
    thirty_days_ago = timezone.now() - timezone.timedelta(days=30)

    home_data = []
    for home in homes:
        residents = Resident.objects.filter(care_home=home, is_active=True)
        resident_count = residents.count()
        recent_audits = ComplianceAudit.objects.filter(care_home=home).order_by("-audit_date")[:5]
        avg_score = round(sum(a.score for a in recent_audits) / len(recent_audits), 1) if recent_audits else None
        recent_incidents = Incident.objects.filter(care_home=home, incident_date__gte=thirty_days_ago).count()
        staff_count = home.users.filter(is_active=True).count()

        home_data.append({
            "id": home.id,
            "name": home.name,
            "bed_count": home.bed_count,
            "resident_count": resident_count,
            "occupancy_pct": round((resident_count / home.bed_count) * 100, 1) if home.bed_count else None,
            "high_risk_residents": residents.filter(fall_risk__in=["high", "critical"]).count(),
            "staff_count": staff_count,
            "avg_compliance_score": avg_score,
            "incidents_last_30_days": recent_incidents,
        })

    return Response({
        "group": {"id": group.id, "name": group.name},
        "care_homes": home_data,
        "totals": {
            "care_home_count": len(home_data),
            "resident_count": sum(h["resident_count"] for h in home_data),
            "bed_count": sum(h["bed_count"] for h in home_data),
            "staff_count": sum(h["staff_count"] for h in home_data),
            "incidents_last_30_days": sum(h["incidents_last_30_days"] for h in home_data),
        },
        "generated_at": timezone.now().isoformat(),
    })


class ShiftFilter(df.FilterSet):
    date_gte = df.DateFilter(field_name="date", lookup_expr="gte")
    date_lte = df.DateFilter(field_name="date", lookup_expr="lte")

    class Meta:
        model = Shift
        fields = ["care_home", "staff_member", "date", "shift_type", "is_agency"]


class ShiftViewSet(viewsets.ModelViewSet):
    serializer_class = ShiftSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_class = ShiftFilter
    ordering_fields = ["date", "start_time"]
    ordering = ["date", "start_time"]

    def get_permissions(self):
        if self.action in ("list", "retrieve"):
            return [require("staff.view")]
        return [require("staff.manage")]

    def get_queryset(self):
        return Shift.objects.select_related("staff_member", "care_home").filter(
            care_home=self.request.user.care_home
        )

    def perform_create(self, serializer):
        serializer.save(care_home=self.request.user.care_home)


class LeaveRequestViewSet(viewsets.ModelViewSet):
    serializer_class = LeaveRequestSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["staff_member", "status", "leave_type"]

    def get_permissions(self):
        if self.action == "create":
            return [require("staff.request_leave")]
        if self.action in ("update", "partial_update", "destroy"):
            return [require("staff.manage")]
        return [require("staff.view")]

    def get_queryset(self):
        user = self.request.user
        base = LeaveRequest.objects.select_related("staff_member", "approved_by").filter(
            staff_member__care_home=user.care_home
        )
        # Non-managers only see their own requests
        if not user_has_perm(user, "staff.manage"):
            base = base.filter(staff_member=user)
        return base

    def perform_create(self, serializer):
        serializer.save(staff_member=self.request.user)


class TrainingViewSet(viewsets.ModelViewSet):
    serializer_class = TrainingSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["staff_member", "status"]

    def get_permissions(self):
        if self.action in ("list", "retrieve"):
            return [require("staff.view")]
        return [require("staff.manage")]

    def get_queryset(self):
        return Training.objects.select_related("staff_member").filter(
            staff_member__care_home=self.request.user.care_home
        )
