"""
Shared test scaffolding for multi-tenant isolation tests.

Every app in Cura scopes its data to the requesting user's `care_home`. The
pattern that keeps slipping (see apps/residents and apps/ai_assistant) is a
queryset or lookup that forgets that filter. `TenantIsolationTestCase` sets
up two care homes with one user each so a test can assert, in a couple of
lines, that home A's staff can never see home B's records.
"""
from datetime import date

from rest_framework.test import APITestCase, APIClient

from apps.staff.models import CareHome
from apps.authentication.models import User


class TenantIsolationTestCase(APITestCase):
    def setUp(self):
        super().setUp()
        self.home_a = CareHome.objects.create(
            name="Sunrise Care Home", address="1 Test St", cqc_registration_number="CQC-A",
            bed_count=20, phone="0000000000", email="a@example.com",
        )
        self.home_b = CareHome.objects.create(
            name="Meadowview Care Home", address="2 Test St", cqc_registration_number="CQC-B",
            bed_count=20, phone="0000000000", email="b@example.com",
        )

        self.user_a = User.objects.create_user(
            username="carer_a", password="testpass123", role=User.Role.CARER, care_home=self.home_a,
        )
        self.user_b = User.objects.create_user(
            username="carer_b", password="testpass123", role=User.Role.CARER, care_home=self.home_b,
        )
        self.manager_a = User.objects.create_user(
            username="manager_a", password="testpass123", role=User.Role.MANAGER, care_home=self.home_a,
        )
        # Unassigned user — mirrors what a freshly-created account (or the
        # now-removed public /register/ endpoint) produced: authenticated,
        # but with no care_home at all.
        self.user_unassigned = User.objects.create_user(
            username="carer_none", password="testpass123", role=User.Role.CARER, care_home=None,
        )

        self.client_a = APIClient()
        self.client_a.force_authenticate(self.user_a)
        self.client_b = APIClient()
        self.client_b.force_authenticate(self.user_b)
        self.client_manager_a = APIClient()
        self.client_manager_a.force_authenticate(self.manager_a)
        self.client_unassigned = APIClient()
        self.client_unassigned.force_authenticate(self.user_unassigned)

    @staticmethod
    def make_resident(care_home, **overrides):
        from apps.residents.models import Resident
        defaults = dict(
            care_home=care_home,
            first_name="Jane", last_name="Doe",
            date_of_birth=date(1940, 1, 1),
            nhs_number=f"NHS-{care_home.pk}-{overrides.get('room_number', 'X')}",
            room_number=overrides.get("room_number", "1A"),
            admission_date=date(2024, 1, 1),
        )
        defaults.update(overrides)
        return Resident.objects.create(**defaults)
