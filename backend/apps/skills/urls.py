from rest_framework.routers import SimpleRouter
from .views import SkillViewSet, StaffSkillViewSet

router = SimpleRouter()
router.register("", SkillViewSet, basename="skill")
router.register("staff-skills", StaffSkillViewSet, basename="staff-skill")
urlpatterns = router.urls
