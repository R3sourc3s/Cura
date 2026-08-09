from rest_framework import views, response, status
from apps.authentication.permissions import require
from .services import chat, score_resident_risk
from apps.residents.models import Resident


class ChatView(views.APIView):
    throttle_scope = "ai"

    def get_permissions(self):
        return [require("ai.chat")]

    def post(self, request):
        messages = request.data.get("messages", [])
        resident_id = request.data.get("resident_id")

        context = ""
        if resident_id:
            try:
                r = Resident.objects.prefetch_related("conditions", "medications").get(pk=resident_id)
                conditions = ", ".join(c.name for c in r.conditions.filter(is_active=True))
                context = f"Name: {r.full_name}, Age: {r.age}, Room: {r.room_number}, Conditions: {conditions}"
            except Resident.DoesNotExist:
                pass

        if not messages:
            return response.Response({"error": "messages required"}, status=status.HTTP_400_BAD_REQUEST)

        reply = chat(messages, resident_context=context)
        return response.Response({"reply": reply})


class ResidentRiskScoreView(views.APIView):
    throttle_scope = "ai"

    def get_permissions(self):
        return [require("ai.risk_score")]

    def post(self, request, resident_id):
        try:
            resident = Resident.objects.prefetch_related("conditions", "medications").get(pk=resident_id)
        except Resident.DoesNotExist:
            return response.Response({"error": "Resident not found"}, status=404)

        score = score_resident_risk(resident)
        resident.ai_risk_score = score
        resident.save(update_fields=["ai_risk_score"])
        return response.Response({"ai_risk_score": score})
