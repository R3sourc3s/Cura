import decimal
from datetime import date, datetime
from django.db.models.fields.files import FieldFile
from django.db.models.signals import pre_save, post_save, post_delete
from .models import AuditLog
from .middleware import get_current_user

WATCHED_MODELS = [
    "incidents.Incident",
    "staff.LeaveRequest",
    "residents.Resident",
    "medications.Medication",
    "handover.HandoverNote",
    "care_plans.CarePlan",
    "safeguarding.SafeguardingConcern",
    "authentication.User",
    "billing.Invoice",
    "billing.Payment",
    "billing.FundingSource",
]

# Never record these in a diff, regardless of model — passwords are the one
# field an audit trail must never echo back, even hashed.
EXCLUDED_FIELDS = {"password"}


def _jsonable(value):
    if isinstance(value, (date, datetime)):
        return value.isoformat()
    if isinstance(value, decimal.Decimal):
        return str(value)
    if isinstance(value, FieldFile):
        return value.name or None
    return value


def _snapshot(instance):
    """Plain-value dict of an instance's concrete fields, for diffing. Skips
    auto_now/auto_now_add fields (they change on every save and would just
    add noise) and anything in EXCLUDED_FIELDS."""
    data = {}
    for field in instance._meta.fields:
        if field.name in EXCLUDED_FIELDS:
            continue
        if getattr(field, "auto_now", False) or getattr(field, "auto_now_add", False):
            continue
        data[field.name] = _jsonable(field.value_from_object(instance))
    return data


def _diff(old_data, new_data):
    changes = {}
    for key, new_val in new_data.items():
        old_val = old_data.get(key)
        if old_val != new_val:
            changes[key] = {"old": old_val, "new": new_val}
    return changes


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


def _make_delete_handler():
    def handler(sender, instance, **kwargs):
        _log(AuditLog.Action.DELETE, instance)
    return handler


def _make_pre_save_handler():
    def handler(sender, instance, **kwargs):
        if instance.pk:
            try:
                old_instance = sender.objects.get(pk=instance.pk)
            except sender.DoesNotExist:
                instance._audit_old_snapshot = None
            else:
                instance._audit_old_snapshot = _snapshot(old_instance)
        else:
            instance._audit_old_snapshot = None
    return handler


def _make_post_save_handler():
    def handler(sender, instance, created, **kwargs):
        new_data = _snapshot(instance)
        if created:
            # Nothing to diff against — record the initial field values.
            _log(AuditLog.Action.CREATE, instance, changes=new_data)
        else:
            old_data = getattr(instance, "_audit_old_snapshot", None) or {}
            _log(AuditLog.Action.UPDATE, instance, changes=_diff(old_data, new_data))
    return handler


def register_audit_signals():
    from django.apps import apps
    for label in WATCHED_MODELS:
        try:
            model = apps.get_model(label)
            pre_save.connect(_make_pre_save_handler(), sender=model, weak=False)
            post_save.connect(_make_post_save_handler(), sender=model, weak=False)
            post_delete.connect(_make_delete_handler(), sender=model, weak=False)
        except LookupError:
            pass


register_audit_signals()
