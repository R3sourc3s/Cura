from rest_framework.routers import SimpleRouter
from .views import FallsRiskAssessmentViewSet

router = SimpleRouter()
router.register("", FallsRiskAssessmentViewSet, basename="falls-risk")
urlpatterns = router.urls
