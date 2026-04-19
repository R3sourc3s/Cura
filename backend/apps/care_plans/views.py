from rest_framework import viewsets, decorators, response, status
from django_filters.rest_framework import DjangoFilterBackend
from .models import CarePlan, CarePlanSection, CarePlanNote
from .serializers import CarePlanSerializer, CarePlanSectionSerializer, CarePlanNoteSerializer
from apps.ai_assistant.services import generate_care_plan_summary


class CarePlanViewSet(viewsets.ModelViewSet):
    serializer_class = CarePlanSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["resident", "status"]

    def get_queryset(self):
        return CarePlan.objects.select_related("resident", "created_by").prefetch_related(
            "sections", "notes"
        ).filter(resident__care_home=self.request.user.care_home)

    @decorators.action(detail=True, methods=["post"], url_path="generate-summary")
    def generate_summary(self, request, pk=None):
        """Ask Anthropic to produce a plain-English summary of this care plan."""
        plan = self.get_object()
        summary = generate_care_plan_summary(plan)
        plan.ai_summary = summary
        plan.ai_generated = True
        plan.save(update_fields=["ai_summary", "ai_generated"])
        return response.Response({"summary": summary})


class CarePlanSectionViewSet(viewsets.ModelViewSet):
    queryset = CarePlanSection.objects.all()
    serializer_class = CarePlanSectionSerializer

    def get_queryset(self):
        return super().get_queryset().filter(care_plan_id=self.kwargs["care_plan_pk"])


class CarePlanNoteViewSet(viewsets.ModelViewSet):
    queryset = CarePlanNote.objects.select_related("author")
    serializer_class = CarePlanNoteSerializer

    def get_queryset(self):
        return super().get_queryset().filter(care_plan_id=self.kwargs["care_plan_pk"])

    def perform_create(self, serializer):
        serializer.save(author=self.request.user, care_plan_id=self.kwargs["care_plan_pk"])
