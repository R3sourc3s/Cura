from django.urls import include, path
from rest_framework.routers import DefaultRouter
from .views import ResidentViewSet, ConditionViewSet, AllergyViewSet
from .analytics import kpi_summary

router = DefaultRouter()
router.register("", ResidentViewSet, basename="resident")

allergy_router = DefaultRouter()
allergy_router.register("", AllergyViewSet, basename="allergy")

# Must come before router.urls — the resident detail route would otherwise capture "allergies" as a pk.
urlpatterns = [
    path("allergies/", include(allergy_router.urls)),
] + router.urls + [
    path("analytics/kpi/", kpi_summary, name="kpi-summary"),
]
