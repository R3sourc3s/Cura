from datetime import timedelta
from django.utils import timezone
from django.db.models import Count, Q
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Medication, MAREntry, PRNAdministration


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def medication_insights(request):
    """
    Medication safety dashboard — slices PRN usage, psychotropic usage,
    missed/omitted doses, and patch/topical application-site rotation.
    Mirrors the kind of breakdown competitors advertise (e.g. Empathika's
    eMAR analytics) but computed live from Cura's own MAR/PRN data.
    """
    care_home = request.user.care_home
    days = int(request.GET.get("days", 30))
    since = timezone.now() - timedelta(days=days)

    meds = Medication.objects.filter(resident__care_home=care_home, is_active=True)
    mar_qs = MAREntry.objects.filter(
        medication__resident__care_home=care_home, scheduled_at__gte=since
    )
    prn_qs = PRNAdministration.objects.filter(
        medication__resident__care_home=care_home, administered_at__gte=since
    )

    mar_status_breakdown = list(mar_qs.values("status").annotate(count=Count("id")).order_by("-count"))

    psychotropic_meds = meds.filter(is_psychotropic=True)
    psychotropic_administrations = mar_qs.filter(
        medication__is_psychotropic=True, status=MAREntry.Status.GIVEN
    ).count()

    prn_by_medication = list(
        prn_qs.values("medication__drug_name", "medication__resident__first_name", "medication__resident__last_name")
        .annotate(count=Count("id"))
        .order_by("-count")[:10]
    )

    patch_applications = mar_qs.filter(
        medication__route=Medication.Route.TOPICAL
    ).exclude(patch_site="")
    patch_site_breakdown = list(
        patch_applications.values("patch_site").annotate(count=Count("id")).order_by("-count")
    )
    patches_missing_site = mar_qs.filter(
        medication__route=Medication.Route.TOPICAL, status=MAREntry.Status.GIVEN, patch_site=""
    ).count()

    controlled_prn = prn_qs.filter(medication__is_controlled=True).count()

    return Response({
        "period_days": days,
        "mar": {
            "total_entries": mar_qs.count(),
            "by_status": mar_status_breakdown,
            "missed_or_omitted": mar_qs.filter(status__in=[MAREntry.Status.OMITTED, MAREntry.Status.REFUSED]).count(),
        },
        "prn": {
            "total_administrations": prn_qs.count(),
            "controlled_drug_prn": controlled_prn,
            "top_medications": prn_by_medication,
            "unassessed_effectiveness": prn_qs.filter(effectiveness="not_assessed").count(),
        },
        "psychotropic": {
            "active_medications": psychotropic_meds.count(),
            "residents_on_psychotropics": psychotropic_meds.values("resident").distinct().count(),
            "administrations_in_period": psychotropic_administrations,
        },
        "patches": {
            "applications_in_period": patch_applications.filter(status=MAREntry.Status.GIVEN).count(),
            "by_site": patch_site_breakdown,
            "missing_site_record": patches_missing_site,
        },
        "generated_at": timezone.now().isoformat(),
    })
