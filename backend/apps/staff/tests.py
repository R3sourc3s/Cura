from rest_framework import status

from cura.test_utils import TenantIsolationTestCase
from apps.staff.models import Wing


class WingTenantIsolationTests(TenantIsolationTestCase):
    def setUp(self):
        super().setUp()
        self.wing_a = Wing.objects.create(care_home=self.home_a, name="Rose Wing")
        self.wing_b = Wing.objects.create(care_home=self.home_b, name="Oak Wing")

    def test_list_only_returns_own_care_home(self):
        resp = self.client_a.get("/api/v1/staff/wings/")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        ids = {w["id"] for w in resp.data["results"]}
        self.assertIn(self.wing_a.id, ids)
        self.assertNotIn(self.wing_b.id, ids)


class UserManagementPermissionTests(TenantIsolationTestCase):
    """A carer must not be able to create or manage staff accounts."""

    def test_carer_cannot_create_users(self):
        resp = self.client_a.post("/api/v1/auth/users/create/", {
            "username": "new_carer", "password": "testpass123",
            "first_name": "New", "last_name": "Carer", "role": "carer",
        })
        self.assertEqual(resp.status_code, status.HTTP_403_FORBIDDEN)

    def test_manager_can_create_users_scoped_to_own_care_home(self):
        resp = self.client_manager_a.post("/api/v1/auth/users/create/", {
            "username": "new_carer", "password": "testpass123",
            "first_name": "New", "last_name": "Carer", "role": "carer",
        })
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)

    def test_user_list_only_returns_own_care_home(self):
        resp = self.client_a.get("/api/v1/auth/users/")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        usernames = {u["username"] for u in resp.data["results"]}
        self.assertIn("carer_a", usernames)
        self.assertNotIn("carer_b", usernames)
