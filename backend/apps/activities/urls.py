from rest_framework.routers import SimpleRouter
from .views import ActivityViewSet, ActivityAttendanceViewSet

router = SimpleRouter()
router.register("", ActivityViewSet, basename="activity")
router.register("attendances", ActivityAttendanceViewSet, basename="activity-attendance")

urlpatterns = router.urls
