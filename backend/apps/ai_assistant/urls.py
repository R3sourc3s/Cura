from django.urls import path
from .views import ChatView, ResidentRiskScoreView

urlpatterns = [
    path("chat/", ChatView.as_view(), name="ai-chat"),
    path("residents/<int:resident_id>/risk-score/", ResidentRiskScoreView.as_view(), name="ai-risk-score"),
]
