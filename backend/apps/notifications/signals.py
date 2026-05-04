from django.db.models.signals import post_save
from django.dispatch import receiver
from apps.authentication.models import User
from .models import Notification


def _users_with_roles(care_home, *roles):
    return User.objects.filter(care_home=care_home, role__in=roles, is_active=True)


def _bulk_notify(users, notif_type, message, link=""):
    Notification.objects.bulk_create([
        Notification(user=u, notif_type=notif_type, message=message, link=link)
        for u in users
    ])


@receiver(post_save, sender="incidents.Incident")
def notify_incident_created(sender, instance, created, **kwargs):
    if not created:
        return
    managers = _users_with_roles(instance.care_home, "admin", "manager")
    resident_label = f" (resident: {instance.resident})" if instance.resident else ""
    _bulk_notify(
        managers,
        Notification.NotifType.INCIDENT,
        f"New {instance.get_severity_display()} incident reported{resident_label}: {instance.get_incident_type_display()}",
        f"/dashboard/incidents/{instance.pk}",
    )


@receiver(post_save, sender="staff.LeaveRequest")
def notify_leave_request(sender, instance, created, **kwargs):
    if created:
        managers = _users_with_roles(instance.staff_member.care_home, "admin", "manager", "hr")
        _bulk_notify(
            managers,
            Notification.NotifType.LEAVE,
            f"{instance.staff_member.get_full_name()} submitted a {instance.get_leave_type_display()} request ({instance.start_date} – {instance.end_date})",
            "/dashboard/staff?tab=leave",
        )
    else:
        if instance.status in ("approved", "rejected"):
            _bulk_notify(
                [instance.staff_member],
                Notification.NotifType.LEAVE,
                f"Your {instance.get_leave_type_display()} request has been {instance.status}",
                "/dashboard/staff?tab=leave",
            )


@receiver(post_save, sender="medications.Medication")
def notify_low_stock(sender, instance, created, **kwargs):
    if created:
        return
    if instance.is_low_stock:
        nurses = _users_with_roles(instance.resident.care_home, "nurse", "manager", "admin")
        _bulk_notify(
            nurses,
            Notification.NotifType.STOCK,
            f"Low stock: {instance.drug_name} for {instance.resident} ({instance.stock_count} remaining)",
            f"/dashboard/residents/{instance.resident_id}?tab=medications",
        )


@receiver(post_save, sender="handover.HandoverNote")
def notify_critical_handover(sender, instance, created, **kwargs):
    if not created or instance.priority != "critical":
        return
    staff = _users_with_roles(instance.care_home, "admin", "manager", "nurse", "carer")
    if instance.author_id:
        staff = staff.exclude(pk=instance.author_id)
    _bulk_notify(
        staff,
        Notification.NotifType.HANDOVER,
        f"Critical handover note for {instance.get_shift_display()} shift on {instance.date}",
        f"/dashboard/handover?date={instance.date}",
    )
