from django.contrib import admin
from django.urls import path, include
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

urlpatterns = [
    path("admin/", admin.site.urls),

    # API v1
    path("api/v1/auth/", include("apps.authentication.urls")),
    path("api/v1/residents/", include("apps.residents.urls")),
    path("api/v1/medications/", include("apps.medications.urls")),
    path("api/v1/care-plans/", include("apps.care_plans.urls")),
    path("api/v1/staff/", include("apps.staff.urls")),
    path("api/v1/compliance/", include("apps.compliance.urls")),
    path("api/v1/ai/", include("apps.ai_assistant.urls")),
    path("api/v1/incidents/", include("apps.incidents.urls")),
    path("api/v1/handover/", include("apps.handover.urls")),
    path("api/v1/vitals/", include("apps.vitals.urls")),
    path("api/v1/notifications/", include("apps.notifications.urls")),
    path("api/v1/audit-log/", include("apps.audit_log.urls")),
    path("api/v1/care-notes/", include("apps.care_notes.urls")),
    path("api/v1/visitors/", include("apps.visitors.urls")),
    path("api/v1/maintenance/", include("apps.maintenance.urls")),
    path("api/v1/activities/", include("apps.activities.urls")),
    path("api/v1/appointments/", include("apps.appointments.urls")),
    path("api/v1/body-map/", include("apps.body_map.urls")),
    path("api/v1/documents/", include("apps.documents.urls")),

    path("api/v1/training/", include("apps.training.urls")),
    path("api/v1/nutrition/", include("apps.nutrition.urls")),
    path("api/v1/falls-risk/", include("apps.falls_risk.urls")),
    path("api/v1/overnight-checks/", include("apps.overnight_checks.urls")),
    path("api/v1/safeguarding/", include("apps.safeguarding.urls")),
    path("api/v1/messages/", include("apps.messages_board.urls")),
    path("api/v1/pharmacy/", include("apps.pharmacy.urls")),
    path("api/v1/recruitment/", include("apps.recruitment.urls")),
    path("api/v1/leave/", include("apps.leave.urls")),
    path("api/v1/tasks/", include("apps.tasks.urls")),
    path("api/v1/enquiries/", include("apps.enquiries.urls")),
    path("api/v1/billing/", include("apps.billing.urls")),
    path("api/v1/gp/", include("apps.gp_integration.urls")),
    path("api/v1/family/", include("apps.family_portal.urls")),
    path("api/v1/skills/", include("apps.skills.urls")),

    # OpenAPI docs
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path("api/docs/", SpectacularSwaggerView.as_view(url_name="schema"), name="swagger-ui"),
]
