from rest_framework.routers import SimpleRouter
from .views import TrainingCourseViewSet, StaffTrainingRecordViewSet

router = SimpleRouter()
router.register("courses", TrainingCourseViewSet, basename="training-course")
router.register("records", StaffTrainingRecordViewSet, basename="training-record")
urlpatterns = router.urls
