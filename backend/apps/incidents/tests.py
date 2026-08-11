from django.utils import timezone
from rest_framework import status

from cura.test_utils import TenantIsolationTestCase
from apps.incidents.models import Incident


class IncidentTenantIsolationTests(TenantIsolationTestCase):
    def setUp(self):
        super().setUp()
        self.incident_a = Incident.objects.create(
            care_home=self.home_a, reported_by=self.user_a,
            incident_type=Incident.IncidentType.FALL, incident_date=timezone.now(),
            description="Test incident A",
        )
        self.incident_b = Incident.objects.create(
            care_home=self.home_b, reported_by=self.user_b,
            incident_type=Incident.IncidentType.FALL, incident_date=timezone.now(),
            description="Test incident B",
        )

    def test_list_only_returns_own_care_home(self):
        resp = self.client_a.get("/api/v1/incidents/")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        ids = {i["id"] for i in resp.data["results"]}
        self.assertIn(self.incident_a.id, ids)
        self.assertNotIn(self.incident_b.id, ids)

    def test_retrieve_other_care_home_incident_is_not_found(self):
        resp = self.client_a.get(f"/api/v1/incidents/{self.incident_b.id}/")
        self.assertEqual(resp.status_code, status.HTTP_404_NOT_FOUND)
