from rest_framework.routers import SimpleRouter
from .views import StaffMessageViewSet

router = SimpleRouter()
router.register("", StaffMessageViewSet, basename="staffmessage")

urlpatterns = router.urls
