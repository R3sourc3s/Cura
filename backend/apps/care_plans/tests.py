from rest_framework import status

from cura.test_utils import TenantIsolationTestCase
from apps.care_plans.models import CarePlan


class CarePlanTenantIsolationTests(TenantIsolationTestCase):
    def setUp(self):
        super().setUp()
        self.resident_a = self.make_resident(self.home_a, room_number="1A")
        self.resident_b = self.make_resident(self.home_b, room_number="1B")
        self.plan_a = CarePlan.objects.create(resident=self.resident_a, created_by=self.user_a)
        self.plan_b = CarePlan.objects.create(resident=self.resident_b, created_by=self.user_b)

    def test_list_only_returns_own_care_home(self):
        resp = self.client_a.get("/api/v1/care-plans/")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        ids = {p["id"] for p in resp.data["results"]}
        self.assertIn(self.plan_a.id, ids)
        self.assertNotIn(self.plan_b.id, ids)

    def test_retrieve_other_care_home_plan_is_not_found(self):
        resp = self.client_a.get(f"/api/v1/care-plans/{self.plan_b.id}/")
        self.assertEqual(resp.status_code, status.HTTP_404_NOT_FOUND)
