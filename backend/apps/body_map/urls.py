from rest_framework.routers import SimpleRouter
from django.urls import path
from .views import WoundRecordViewSet, WoundAssessmentViewSet

router = SimpleRouter()
router.register("wounds", WoundRecordViewSet, basename="wound-record")
router.register("assessments", WoundAssessmentViewSet, basename="wound-assessment")

urlpatterns = router.urls + [
    path(
        "wounds/<int:wound_pk>/assessments/",
        WoundAssessmentViewSet.as_view({"get": "list", "post": "create"}),
        name="wound-assessments-list",
    ),
    path(
        "wounds/<int:wound_pk>/assessments/<int:pk>/",
        WoundAssessmentViewSet.as_view({"get": "retrieve", "patch": "partial_update", "delete": "destroy"}),
        name="wound-assessments-detail",
    ),
]
