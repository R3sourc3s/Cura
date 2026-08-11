from unittest.mock import patch

from rest_framework import status

from cura.test_utils import TenantIsolationTestCase


class AIAssistantTenantIsolationTests(TenantIsolationTestCase):
    """
    Regression coverage for the IDOR where ChatView / ResidentRiskScoreView
    fetched Resident.objects.get(pk=...) with no care_home check, letting
    any authenticated user read (and for risk-score, overwrite) another
    tenant's resident data.
    """

    def setUp(self):
        super().setUp()
        self.resident_b = self.make_resident(self.home_b, room_number="9Z", first_name="Other", last_name="Tenant")

    @patch("apps.ai_assistant.views.chat", return_value="ok")
    def test_chat_does_not_leak_other_tenants_resident_context(self, mock_chat):
        resp = self.client_a.post("/api/v1/ai/chat/", {
            "messages": [{"role": "user", "content": "hi"}],
            "resident_id": self.resident_b.id,
        }, format="json")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        _, kwargs = mock_chat.call_args
        self.assertNotIn("Other Tenant", kwargs.get("resident_context", ""))

    def test_risk_score_other_tenant_resident_not_found(self):
        # ai.risk_score requires manager/nurse/admin — carer lacks the permission entirely.
        resp = self.client_manager_a.post(f"/api/v1/ai/residents/{self.resident_b.id}/risk-score/")
        self.assertEqual(resp.status_code, status.HTTP_404_NOT_FOUND)

    @patch("apps.ai_assistant.views.score_resident_risk", return_value=99)
    def test_risk_score_does_not_overwrite_other_tenants_resident(self, mock_score):
        self.client_manager_a.post(f"/api/v1/ai/residents/{self.resident_b.id}/risk-score/")
        self.resident_b.refresh_from_db()
        self.assertEqual(self.resident_b.ai_risk_score, 0)
        mock_score.assert_not_called()
