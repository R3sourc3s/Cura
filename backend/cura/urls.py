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

    # OpenAPI docs
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path("api/docs/", SpectacularSwaggerView.as_view(url_name="schema"), name="swagger-ui"),
]
