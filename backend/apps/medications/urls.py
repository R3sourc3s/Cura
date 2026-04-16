from rest_framework.routers import DefaultRouter
from .views import MedicationViewSet, MAREntryViewSet

router = DefaultRouter()
router.register("", MedicationViewSet, basename="medication")
router.register("mar", MAREntryViewSet, basename="mar-entry")

urlpatterns = router.urls
