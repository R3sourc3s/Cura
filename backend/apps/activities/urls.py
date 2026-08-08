from rest_framework.routers import SimpleRouter
from .views import ActivityViewSet, ActivityAttendanceViewSet

router = SimpleRouter()
# Named routes before the empty catch-all so they aren't captured as detail lookups.
router.register("attendances", ActivityAttendanceViewSet, basename="activity-attendance")
router.register("", ActivityViewSet, basename="activity")

urlpatterns = router.urls
