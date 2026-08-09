from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import MedicationViewSet, MAREntryViewSet, PRNProtocolViewSet, PRNAdministrationViewSet
from .analytics import medication_insights

med_router = DefaultRouter()
med_router.register("", MedicationViewSet, basename="medication")

mar_router = DefaultRouter()
mar_router.register("", MAREntryViewSet, basename="mar-entry")

prn_protocol_router = DefaultRouter()
prn_protocol_router.register("", PRNProtocolViewSet, basename="prn-protocol")

prn_admin_router = DefaultRouter()
prn_admin_router.register("", PRNAdministrationViewSet, basename="prn-admin")

urlpatterns = [
    path("mar/", include(mar_router.urls)),
    path("prn-protocols/", include(prn_protocol_router.urls)),
    path("prn-administrations/", include(prn_admin_router.urls)),
    path("analytics/insights/", medication_insights, name="medication-insights"),
    path("", include(med_router.urls)),
]
