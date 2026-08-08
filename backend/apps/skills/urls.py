from rest_framework.routers import SimpleRouter
from .views import SkillViewSet, StaffSkillViewSet

router = SimpleRouter()
# Register "staff-skills" before the empty catch-all so it isn't captured
# as a Skill detail lookup (pk="staff-skills").
router.register("staff-skills", StaffSkillViewSet, basename="staff-skill")
router.register("", SkillViewSet, basename="skill")
urlpatterns = router.urls
