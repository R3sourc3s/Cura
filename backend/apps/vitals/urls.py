from rest_framework.routers import SimpleRouter
from .views import VitalSignViewSet

router = SimpleRouter()
router.register("", VitalSignViewSet, basename="vital")
urlpatterns = router.urls
