from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import MedicationViewSet, MAREntryViewSet

med_router = DefaultRouter()
med_router.register("", MedicationViewSet, basename="medication")

mar_router = DefaultRouter()
mar_router.register("", MAREntryViewSet, basename="mar-entry")

urlpatterns = [
    path("mar/", include(mar_router.urls)),
    path("", include(med_router.urls)),
]
