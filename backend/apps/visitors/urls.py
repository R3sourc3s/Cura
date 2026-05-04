from rest_framework.routers import SimpleRouter
from .views import VisitorLogViewSet

router = SimpleRouter()
router.register("", VisitorLogViewSet, basename="visitor-log")
urlpatterns = router.urls
