from collections import defaultdict
from datetime import timedelta

from celery import shared_task
from django.utils import timezone

# A scheduled dose still pending this long after its time is treated as missed.
OVERDUE_GRACE = timedelta(minutes=60)
# Don't page staff about doses older than this — they belong in the MAR audit, not a live alert.
OVERDUE_LOOKBACK = timedelta(hours=12)


@shared_task
def flag_overdue_doses():
    """Alert nurses and managers once per overdue scheduled dose. Runs every 15 minutes via Celery beat."""
    from apps.authentication.models import User
    from apps.notifications.services import notify
    from .models import MAREntry

    now = timezone.now()
    overdue = list(
        MAREntry.objects.select_related("medication__resident__care_home").filter(
            status=MAREntry.Status.PENDING,
            overdue_alerted_at__isnull=True,
            scheduled_at__lt=now - OVERDUE_GRACE,
            scheduled_at__gte=now - OVERDUE_LOOKBACK,
            medication__is_active=True,
            medication__resident__is_active=True,
        )
    )
    if not overdue:
        return 0

    by_resident = defaultdict(list)
    for entry in overdue:
        by_resident[entry.medication.resident].append(entry)

    for resident, entries in by_resident.items():
        drugs = ", ".join(sorted({e.medication.drug_name for e in entries}))
        recipients = User.objects.filter(
            care_home=resident.care_home, role__in=[User.Role.NURSE, User.Role.MANAGER], is_active=True,
        )
        n = len(entries)
        notify(
            recipients, "medication",
            f"{n} dose{'s' if n != 1 else ''} overdue for {resident.full_name} (Room {resident.room_number}): {drugs}"[:300],
            "/dashboard/medications",
        )

    MAREntry.objects.filter(pk__in=[e.pk for e in overdue]).update(overdue_alerted_at=now)
    return len(overdue)
