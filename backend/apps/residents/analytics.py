from datetime import date, timedelta
from django.db.models import Count, Q, Avg
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Resident


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def kpi_summary(request):
    care_home = request.user.care_home
    today = date.today()
    thirty_days_ago = today - timedelta(days=30)
    ninety_days_ago = today - timedelta(days=90)

    # Residents
    residents = Resident.objects.filter(care_home=care_home)
    total_residents = residents.count()
    active_residents = residents.filter(is_active=True).count()
    discharged_last_30 = residents.filter(is_active=False, discharge_date__gte=thirty_days_ago).count()
    admitted_last_30 = residents.filter(admission_date__gte=thirty_days_ago).count()

    # Risk breakdown
    from django.db.models import Case, When, IntegerField
    risk_breakdown = {
        "critical": residents.filter(is_active=True, fall_risk="critical").count(),
        "high": residents.filter(is_active=True, fall_risk="high").count(),
        "medium": residents.filter(is_active=True, fall_risk="medium").count(),
        "low": residents.filter(is_active=True, fall_risk="low").count(),
    }

    # Incidents
    from apps.incidents.models import Incident
    incidents = Incident.objects.filter(care_home=care_home)
    incidents_last_30 = incidents.filter(incident_date__gte=thirty_days_ago).count()
    incidents_last_90 = incidents.filter(incident_date__gte=ninety_days_ago).count()
    open_incidents = incidents.filter(status="open").count()
    critical_incidents = incidents.filter(incident_date__gte=thirty_days_ago, severity="critical").count()
    incident_by_type = list(
        incidents.filter(incident_date__gte=ninety_days_ago)
        .values("incident_type").annotate(count=Count("id")).order_by("-count")
    )

    # Medications
    from apps.medications.models import Medication
    meds = Medication.objects.filter(resident__care_home=care_home, is_active=True)
    low_stock_count = sum(1 for m in meds if m.is_low_stock)

    # Staff
    from apps.authentication.models import User
    staff = User.objects.filter(care_home=care_home, is_active=True).exclude(role="family")
    total_staff = staff.count()
    staff_by_role = list(staff.values("role").annotate(count=Count("id")).order_by("-count"))

    # Leave
    from apps.staff.models import LeaveRequest
    pending_leave = LeaveRequest.objects.filter(
        staff_member__care_home=care_home, status="pending"
    ).count()

    # Handover
    from apps.handover.models import HandoverNote
    critical_handovers = HandoverNote.objects.filter(
        care_home=care_home, priority="critical", date__gte=thirty_days_ago
    ).count()

    # Care plans due for review
    from apps.care_plans.models import CarePlan
    overdue_reviews = CarePlan.objects.filter(
        resident__care_home=care_home,
        status="active",
        next_review_date__lt=today,
    ).count()

    # Avg AI risk score
    avg_risk = residents.filter(is_active=True).aggregate(avg=Avg("ai_risk_score"))["avg"] or 0

    return Response({
        "residents": {
            "total": total_residents,
            "active": active_residents,
            "occupancy_pct": round((active_residents / max(total_residents, 1)) * 100, 1),
            "admitted_last_30": admitted_last_30,
            "discharged_last_30": discharged_last_30,
            "risk_breakdown": risk_breakdown,
            "avg_ai_risk_score": round(avg_risk, 1),
        },
        "incidents": {
            "last_30_days": incidents_last_30,
            "last_90_days": incidents_last_90,
            "open": open_incidents,
            "critical_last_30": critical_incidents,
            "by_type": incident_by_type,
        },
        "medications": {
            "low_stock_count": low_stock_count,
        },
        "staff": {
            "total": total_staff,
            "by_role": staff_by_role,
            "pending_leave": pending_leave,
        },
        "care": {
            "overdue_reviews": overdue_reviews,
            "critical_handovers_last_30": critical_handovers,
        },
    })
