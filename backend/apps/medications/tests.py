from datetime import date

from rest_framework import status

from cura.test_utils import TenantIsolationTestCase
from apps.medications.models import Medication


class MedicationTenantIsolationTests(TenantIsolationTestCase):
    def setUp(self):
        super().setUp()
        self.resident_a = self.make_resident(self.home_a, room_number="1A")
        self.resident_b = self.make_resident(self.home_b, room_number="1B")
        self.med_a = Medication.objects.create(
            resident=self.resident_a, drug_name="Paracetamol", dose="500mg",
            route=Medication.Route.ORAL, frequency=Medication.Frequency.BD,
            prescribed_by="Dr Test", start_date=date(2024, 1, 1),
        )
        self.med_b = Medication.objects.create(
            resident=self.resident_b, drug_name="Ibuprofen", dose="200mg",
            route=Medication.Route.ORAL, frequency=Medication.Frequency.BD,
            prescribed_by="Dr Test", start_date=date(2024, 1, 1),
        )

    def test_list_only_returns_own_care_home(self):
        resp = self.client_a.get("/api/v1/medications/")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        ids = {m["id"] for m in resp.data["results"]}
        self.assertIn(self.med_a.id, ids)
        self.assertNotIn(self.med_b.id, ids)

    def test_retrieve_other_care_home_medication_is_not_found(self):
        resp = self.client_a.get(f"/api/v1/medications/{self.med_b.id}/")
        self.assertEqual(resp.status_code, status.HTTP_404_NOT_FOUND)
