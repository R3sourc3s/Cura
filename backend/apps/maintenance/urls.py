from rest_framework.routers import SimpleRouter
from .views import MaintenanceIssueViewSet

router = SimpleRouter()
router.register("", MaintenanceIssueViewSet, basename="maintenance-issue")
urlpatterns = router.urls
