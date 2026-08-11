from rest_framework import status

from cura.test_utils import TenantIsolationTestCase


class ResidentTenantIsolationTests(TenantIsolationTestCase):
    """
    Regression coverage for the bug where ResidentViewSet.get_queryset
    returned every resident across every care home whenever the requesting
    user had no care_home set (see git history: "Fix cross-tenant data
    leaks and open registration endpoint").
    """

    def setUp(self):
        super().setUp()
        self.resident_a = self.make_resident(self.home_a, room_number="1A")
        self.resident_b = self.make_resident(self.home_b, room_number="1B")

    def test_list_only_returns_own_care_home(self):
        resp = self.client_a.get("/api/v1/residents/")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        ids = {r["id"] for r in resp.data["results"]}
        self.assertIn(self.resident_a.id, ids)
        self.assertNotIn(self.resident_b.id, ids)

    def test_retrieve_other_care_home_resident_is_not_found(self):
        resp = self.client_a.get(f"/api/v1/residents/{self.resident_b.id}/")
        self.assertEqual(resp.status_code, status.HTTP_404_NOT_FOUND)

    def test_user_with_no_care_home_sees_nothing(self):
        """An unassigned account must never fall back to seeing all residents."""
        resp = self.client_unassigned.get("/api/v1/residents/")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data["results"], [])
