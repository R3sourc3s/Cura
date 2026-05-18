from rest_framework.routers import SimpleRouter
from .views import JobPostingViewSet, ApplicantViewSet

router = SimpleRouter()
router.register("jobs", JobPostingViewSet, basename="recruitment-job")
router.register("applicants", ApplicantViewSet, basename="recruitment-applicant")
urlpatterns = router.urls
