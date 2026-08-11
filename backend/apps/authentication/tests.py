from rest_framework import status
from rest_framework.test import APITestCase


class RegistrationEndpointRemovedTests(APITestCase):
    """
    Regression coverage: /api/v1/auth/register/ used to be an AllowAny
    CreateAPIView that accepted an attacker-chosen `role` and no care_home,
    letting anyone self-register as e.g. an admin. It was unused by the
    frontend and has been removed outright.
    """

    def test_register_endpoint_no_longer_exists(self):
        resp = self.client.post("/api/v1/auth/register/", {
            "username": "attacker", "password": "testpass123", "role": "admin",
        })
        self.assertEqual(resp.status_code, status.HTTP_404_NOT_FOUND)
