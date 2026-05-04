from rest_framework.permissions import BasePermission

ROLE_PERMISSIONS: dict[str, set[str]] = {
    "admin": {
        "residents.view", "residents.create", "residents.edit", "residents.delete",
        "medications.view", "medications.create", "medications.edit", "medications.delete", "medications.administer",
        "care_plans.view", "care_plans.create", "care_plans.ai_summary",
        "staff.view", "staff.manage", "staff.request_leave",
        "compliance.view", "compliance.manage", "compliance.ai_report",
        "team.view", "team.manage",
        "ai.chat", "ai.risk_score", "ai.compliance_report",
        "incidents.view", "incidents.create", "incidents.manage",
        "handover.view", "handover.create", "handover.manage",
        "audit.view",
    },
    "manager": {
        "residents.view", "residents.create", "residents.edit",
        "medications.view", "medications.create", "medications.edit", "medications.administer",
        "care_plans.view", "care_plans.create", "care_plans.ai_summary",
        "staff.view", "staff.manage", "staff.request_leave",
        "compliance.view", "compliance.manage", "compliance.ai_report",
        "team.view",
        "ai.chat", "ai.risk_score", "ai.compliance_report",
        "incidents.view", "incidents.create", "incidents.manage",
        "handover.view", "handover.create", "handover.manage",
        "audit.view",
    },
    "nurse": {
        "residents.view", "residents.create", "residents.edit",
        "medications.view", "medications.create", "medications.edit", "medications.administer",
        "care_plans.view", "care_plans.create", "care_plans.ai_summary",
        "staff.view", "staff.request_leave",
        "compliance.view",
        "ai.chat", "ai.risk_score",
        "incidents.view", "incidents.create",
        "handover.view", "handover.create",
    },
    "carer": {
        "residents.view",
        "medications.view", "medications.administer",
        "care_plans.view",
        "staff.view", "staff.request_leave",
        "compliance.view",
        "ai.chat",
        "incidents.view", "incidents.create",
        "handover.view", "handover.create",
    },
    "hr": {
        "staff.view", "staff.manage", "staff.request_leave",
        "team.view", "team.manage",
        "ai.chat",
        "handover.view",
    },
    "family": {
        "family.view_resident",
    },
}


def user_has_perm(user, permission: str) -> bool:
    return permission in ROLE_PERMISSIONS.get(getattr(user, "role", ""), set())


def require(*permissions: str) -> BasePermission:
    """Return a DRF permission instance that requires all listed permissions."""
    class _P(BasePermission):
        def has_permission(self, request, view):
            return (
                bool(request.user and request.user.is_authenticated)
                and all(user_has_perm(request.user, p) for p in permissions)
            )
    _P.__name__ = f"Require({'|'.join(permissions)})"
    return _P()
