from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import ResidentViewSet, ConditionViewSet
from .analytics import kpi_summary

router = DefaultRouter()
router.register("", ResidentViewSet, basename="resident")

urlpatterns = router.urls + [
    path("analytics/kpi/", kpi_summary, name="kpi-summary"),
]
