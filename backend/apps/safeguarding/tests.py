from rest_framework import status

from cura.test_utils import TenantIsolationTestCase
from apps.safeguarding.models import SafeguardingConcern


class SafeguardingTenantIsolationTests(TenantIsolationTestCase):
    def setUp(self):
        super().setUp()
        self.resident_a = self.make_resident(self.home_a, room_number="1A")
        self.resident_b = self.make_resident(self.home_b, room_number="1B")
        self.concern_a = SafeguardingConcern.objects.create(
            resident=self.resident_a, raised_by=self.user_a,
            category=SafeguardingConcern.Category.NEGLECT, description="Test concern A",
        )
        self.concern_b = SafeguardingConcern.objects.create(
            resident=self.resident_b, raised_by=self.user_b,
            category=SafeguardingConcern.Category.NEGLECT, description="Test concern B",
        )

    def test_list_only_returns_own_care_home(self):
        resp = self.client_a.get("/api/v1/safeguarding/")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        ids = {c["id"] for c in resp.data["results"]}
        self.assertIn(self.concern_a.id, ids)
        self.assertNotIn(self.concern_b.id, ids)

    def test_retrieve_other_care_home_concern_is_not_found(self):
        resp = self.client_a.get(f"/api/v1/safeguarding/{self.concern_b.id}/")
        self.assertEqual(resp.status_code, status.HTTP_404_NOT_FOUND)
