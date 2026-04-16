from django.urls import path
from .views import ChatView, ComplianceGapReportView, ResidentRiskScoreView

urlpatterns = [
    path("chat/", ChatView.as_view(), name="ai-chat"),
    path("compliance-gap-report/", ComplianceGapReportView.as_view(), name="ai-compliance-gap"),
    path("residents/<int:resident_id>/risk-score/", ResidentRiskScoreView.as_view(), name="ai-risk-score"),
]
