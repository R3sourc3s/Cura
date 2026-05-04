from rest_framework.routers import SimpleRouter
from .views import OvernightCheckViewSet

router = SimpleRouter()
router.register("", OvernightCheckViewSet, basename="overnight-check")
urlpatterns = router.urls
