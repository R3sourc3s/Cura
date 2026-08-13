from django.db.models.signals import post_save, post_delete, pre_save
from django.dispatch import receiver
from apps.authentication.models import User
from apps.audit_log.middleware import get_current_user
from .models import Notification
from .services import notify


def _users_with_roles(care_home, *roles):
    return User.objects.filter(care_home=care_home, role__in=roles, is_active=True)


def _bulk_notify(users, notif_type, message, link=""):
    Notification.objects.bulk_create([
        Notification(user=u, notif_type=notif_type, message=message, link=link)
        for u in users
    ])


def _managers_excluding_actor(care_home):
    """Managers/admins at a care home, minus whoever performed the action (no need to notify yourself)."""
    managers = _users_with_roles(care_home, "admin", "manager")
    actor = get_current_user()
    if actor:
        managers = managers.exclude(pk=actor.pk)
    return managers


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


# --- Sensitive-action footprint: medications, safeguarding, resident records,
# staff accounts, billing. Bell always; email reserved for the high-severity
# cases (controlled drugs, safeguarding concerns, privilege escalation, a
# resident record being removed) so managers aren't drowned in inbox noise
# for routine entries.

@receiver(post_save, sender="medications.Medication")
def notify_medication_added(sender, instance, created, **kwargs):
    if not created:
        return
    care_home = instance.resident.care_home
    controlled = instance.is_controlled
    notify(
        _managers_excluding_actor(care_home),
        Notification.NotifType.MEDICATION,
        f"{'Controlled drug' if controlled else 'Medication'} added: {instance.drug_name} {instance.dose} for {instance.resident}",
        f"/dashboard/residents/{instance.resident_id}?tab=medications",
        email=controlled,
        email_subject="Controlled drug added" if controlled else None,
    )


@receiver(post_delete, sender="medications.Medication")
def notify_medication_removed(sender, instance, **kwargs):
    care_home = instance.resident.care_home
    controlled = instance.is_controlled
    notify(
        _managers_excluding_actor(care_home),
        Notification.NotifType.MEDICATION,
        f"{'Controlled drug' if controlled else 'Medication'} removed: {instance.drug_name} {instance.dose} for {instance.resident}",
        f"/dashboard/residents/{instance.resident_id}?tab=medications",
        email=controlled,
        email_subject="Controlled drug removed" if controlled else None,
    )


@receiver(post_save, sender="safeguarding.SafeguardingConcern")
def notify_safeguarding_concern(sender, instance, created, **kwargs):
    if not created:
        return
    care_home = instance.resident.care_home
    managers = _users_with_roles(care_home, "admin", "manager")
    if instance.raised_by_id:
        managers = managers.exclude(pk=instance.raised_by_id)
    notify(
        managers,
        Notification.NotifType.SAFEGUARDING,
        f"Safeguarding concern raised for {instance.resident}: {instance.get_category_display()}",
        f"/dashboard/safeguarding/{instance.pk}",
        email=True,
        email_subject="Safeguarding concern raised",
    )


@receiver(post_save, sender="residents.Resident")
def notify_resident_admitted(sender, instance, created, **kwargs):
    if not created:
        return
    notify(
        _managers_excluding_actor(instance.care_home),
        Notification.NotifType.RESIDENT,
        f"New resident admitted: {instance.full_name} (Room {instance.room_number})",
        f"/dashboard/residents/{instance.pk}",
    )


@receiver(post_delete, sender="residents.Resident")
def notify_resident_removed(sender, instance, **kwargs):
    notify(
        _managers_excluding_actor(instance.care_home),
        Notification.NotifType.RESIDENT,
        f"Resident record removed: {instance.full_name} (Room {instance.room_number})",
        "/dashboard/residents",
        email=True,
        email_subject="Resident record removed",
    )


@receiver(pre_save, sender="authentication.User")
def _snapshot_user_account_state(sender, instance, **kwargs):
    if instance.pk:
        old = sender.objects.filter(pk=instance.pk).values("role", "is_active").first()
        instance._old_role = old["role"] if old else None
        instance._old_is_active = old["is_active"] if old else None
    else:
        instance._old_role = None
        instance._old_is_active = None


@receiver(post_save, sender="authentication.User")
def notify_staff_account_change(sender, instance, created, **kwargs):
    if created:
        return
    old_role = getattr(instance, "_old_role", None)
    old_active = getattr(instance, "_old_is_active", None)
    role_changed = old_role is not None and old_role != instance.role
    active_changed = old_active is not None and old_active != instance.is_active
    if not role_changed and not active_changed:
        return

    parts = []
    if role_changed:
        parts.append(f"role changed from {old_role} to {instance.role}")
    if active_changed:
        parts.append("account deactivated" if not instance.is_active else "account reactivated")
    escalation = role_changed and instance.role in ("admin", "manager")

    notify(
        _managers_excluding_actor(instance.care_home),
        Notification.NotifType.STAFF,
        f"{instance.get_full_name() or instance.username}: {', '.join(parts)}",
        f"/dashboard/team/{instance.pk}",
        email=escalation,
        email_subject="Staff privilege change" if escalation else None,
    )


@receiver(post_save, sender="billing.Invoice")
def notify_invoice_created(sender, instance, created, **kwargs):
    if not created:
        return
    managers = _users_with_roles(instance.care_home, "admin", "manager")
    if instance.created_by_id:
        managers = managers.exclude(pk=instance.created_by_id)
    notify(
        managers,
        Notification.NotifType.BILLING,
        f"Invoice {instance.invoice_number} created for {instance.resident} (£{instance.total})",
        f"/dashboard/billing/invoices/{instance.pk}",
    )


@receiver(post_save, sender="billing.Payment")
def notify_payment_recorded(sender, instance, created, **kwargs):
    if not created:
        return
    care_home = instance.invoice.care_home
    managers = _users_with_roles(care_home, "admin", "manager")
    if instance.recorded_by_id:
        managers = managers.exclude(pk=instance.recorded_by_id)
    notify(
        managers,
        Notification.NotifType.BILLING,
        f"Payment of £{instance.amount} recorded for invoice {instance.invoice.invoice_number}",
        f"/dashboard/billing/invoices/{instance.invoice_id}",
    )
