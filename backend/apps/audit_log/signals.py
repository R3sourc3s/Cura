from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from .models import AuditLog
from .middleware import get_current_user

WATCHED_MODELS = [
    "incidents.Incident",
    "staff.LeaveRequest",
    "residents.Resident",
    "medications.Medication",
    "handover.HandoverNote",
    "care_plans.CarePlan",
]


def _log(action, instance, changes=None):
    user = get_current_user()
    AuditLog.objects.create(
        user=user,
        action=action,
        model_name=instance.__class__.__name__,
        object_id=str(instance.pk),
        object_repr=str(instance)[:300],
        changes=changes or {},
    )


def _make_handler(action):
    def handler(sender, instance, **kwargs):
        _log(action, instance)
    return handler


def _make_save_handler():
    def handler(sender, instance, created, **kwargs):
        _log(AuditLog.Action.CREATE if created else AuditLog.Action.UPDATE, instance)
    return handler


def register_audit_signals():
    from django.apps import apps
    for label in WATCHED_MODELS:
        try:
            model = apps.get_model(label)
            post_save.connect(_make_save_handler(), sender=model, weak=False)
            post_delete.connect(_make_handler(AuditLog.Action.DELETE), sender=model, weak=False)
        except LookupError:
            pass


register_audit_signals()
