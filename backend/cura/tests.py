from django.test import TestCase


class HealthCheckTests(TestCase):
    def test_health_check_reports_ok(self):
        response = self.client.get("/api/health/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["status"], "ok")
        self.assertTrue(response.json()["checks"]["database"])
