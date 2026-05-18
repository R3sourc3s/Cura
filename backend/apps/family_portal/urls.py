from rest_framework.routers import SimpleRouter
from .views import FamilyMemberViewSet, FamilyMessageViewSet

router = SimpleRouter()
router.register("members", FamilyMemberViewSet, basename="family-member")
router.register("messages", FamilyMessageViewSet, basename="family-message")
urlpatterns = router.urls
