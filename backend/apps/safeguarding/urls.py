from rest_framework.routers import SimpleRouter
from .views import SafeguardingConcernViewSet

router = SimpleRouter()
router.register("", SafeguardingConcernViewSet, basename="safeguarding")
urlpatterns = router.urls
