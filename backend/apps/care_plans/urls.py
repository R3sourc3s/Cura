from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CarePlanViewSet, CarePlanSectionViewSet, CarePlanNoteViewSet

router = DefaultRouter()
router.register("", CarePlanViewSet, basename="care-plan")

urlpatterns = [
    path("<int:care_plan_pk>/sections/", CarePlanSectionViewSet.as_view({"get": "list", "post": "create"})),
    path("<int:care_plan_pk>/sections/<int:pk>/", CarePlanSectionViewSet.as_view({"get": "retrieve", "patch": "partial_update", "delete": "destroy"})),
    path("<int:care_plan_pk>/notes/", CarePlanNoteViewSet.as_view({"get": "list", "post": "create"})),
    path("", include(router.urls)),
]
