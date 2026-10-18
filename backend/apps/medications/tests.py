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


from datetime import timedelta

from django.utils import timezone

from apps.medications.models import MAREntry, PRNAdministration, PRNProtocol
from apps.medications.safety import allergy_matches
from apps.medications.tasks import flag_overdue_doses
from apps.notifications.models import Notification
from apps.residents.models import Allergy


class MedicationSafetyTests(TenantIsolationTestCase):
    def setUp(self):
        super().setUp()
        self.resident = self.make_resident(self.home_a, room_number="2A")
        self.amox = Medication.objects.create(
            resident=self.resident, drug_name="Amoxicillin 500mg capsules", dose="500mg",
            route=Medication.Route.ORAL, frequency=Medication.Frequency.TDS,
            prescribed_by="Dr Test", start_date=date(2024, 1, 1),
        )
        self.paracetamol = Medication.objects.create(
            resident=self.resident, drug_name="Paracetamol", dose="1g",
            route=Medication.Route.ORAL, frequency=Medication.Frequency.PRN,
            prescribed_by="Dr Test", start_date=date(2024, 1, 1),
        )
        PRNProtocol.objects.create(medication=self.paracetamol, indication="Pain",
                                   max_dose_per_24h="4 doses", min_interval_hours=4)

    def _allergy(self, allergen, severity="moderate", allergy_type="drug"):
        return Allergy.objects.create(resident=self.resident, allergen=allergen,
                                      severity=severity, allergy_type=allergy_type)

    def _pending(self, med, minutes_ago=0):
        return MAREntry.objects.create(medication=med, scheduled_at=timezone.now() - timedelta(minutes=minutes_ago))

    # ── allergy matching ──
    def test_class_allergy_matches_member_drug(self):
        self._allergy("Penicillins")
        self.assertEqual(len(allergy_matches(self.resident, "Amoxicillin 500mg")), 1)
        self.assertEqual(len(allergy_matches(self.resident, "Co-amoxiclav 625mg")), 1)

    def test_whole_word_matching_avoids_false_positives(self):
        self._allergy("Nystatin")
        self._allergy("Iron")
        self.assertEqual(allergy_matches(self.resident, "Atorvastatin 20mg"), [])
        self.assertEqual(allergy_matches(self.resident, "Spironolactone 25mg"), [])

    def test_food_and_inactive_allergies_are_ignored(self):
        self._allergy("Penicillin", allergy_type="food")
        a = self._allergy("Penicillin")
        a.is_active = False
        a.save()
        self.assertEqual(allergy_matches(self.resident, "Amoxicillin"), [])

    # ── prescribing ──
    def test_prescribing_allergen_returns_409_then_override_succeeds(self):
        self._allergy("Penicillin", severity="mild")
        payload = dict(resident=self.resident.id, drug_name="Flucloxacillin", dose="500mg", route="oral",
                       frequency="qds", prescribed_by="Dr Test", start_date="2024-01-01")
        resp = self.client_manager_a.post("/api/v1/medications/", payload, format="json")
        self.assertEqual(resp.status_code, 409)
        self.assertEqual(resp.data["safety_issues"][0]["code"], "allergy")
        self.assertTrue(resp.data["overridable"])

        resp = self.client_manager_a.post("/api/v1/medications/", {**payload, "safety_override_reason": "GP confirmed intolerance only"}, format="json")
        self.assertEqual(resp.status_code, 201)
        self.assertIn("GP confirmed intolerance only", resp.data["notes"])

    def test_anaphylaxis_cannot_be_overridden(self):
        self._allergy("Penicillin", severity="anaphylaxis")
        entry = self._pending(self.amox)
        resp = self.client_a.patch(f"/api/v1/medications/mar/{entry.id}/",
                                   {"status": "given", "safety_override_reason": "Please"}, format="json")
        self.assertEqual(resp.status_code, 409)
        self.assertFalse(resp.data["overridable"])
        entry.refresh_from_db()
        self.assertEqual(entry.status, "pending")

    # ── MAR administration ──
    def test_giving_dose_records_who_and_when(self):
        entry = self._pending(self.amox)
        resp = self.client_a.patch(f"/api/v1/medications/mar/{entry.id}/", {"status": "given"}, format="json")
        self.assertEqual(resp.status_code, 200)
        entry.refresh_from_db()
        self.assertEqual(entry.administered_by, self.user_a)
        self.assertIsNotNone(entry.administered_at)

    def test_regiving_same_entry_is_blocked(self):
        entry = self._pending(self.amox)
        self.client_a.patch(f"/api/v1/medications/mar/{entry.id}/", {"status": "given"}, format="json")
        resp = self.client_a.patch(f"/api/v1/medications/mar/{entry.id}/",
                                   {"status": "given", "safety_override_reason": "x"}, format="json")
        self.assertEqual(resp.status_code, 409)
        self.assertEqual(resp.data["safety_issues"][0]["code"], "duplicate_dose")

    def test_second_dose_within_an_hour_is_flagged(self):
        first, second = self._pending(self.amox, 5), self._pending(self.amox, 0)
        self.client_a.patch(f"/api/v1/medications/mar/{first.id}/", {"status": "given"}, format="json")
        resp = self.client_a.patch(f"/api/v1/medications/mar/{second.id}/", {"status": "given"}, format="json")
        self.assertEqual(resp.status_code, 409)
        self.assertTrue(resp.data["overridable"])

    def test_refusing_dose_skips_safety_checks(self):
        self._allergy("Penicillin", severity="anaphylaxis")
        entry = self._pending(self.amox)
        resp = self.client_a.patch(f"/api/v1/medications/mar/{entry.id}/", {"status": "refused"}, format="json")
        self.assertEqual(resp.status_code, 200)

    # ── PRN ──
    def _give_prn(self, client=None, **extra):
        return (client or self.client_a).post("/api/v1/medications/prn-administrations/", {
            "medication": self.paracetamol.id, "reason": "Pain", "dose_given": "1g", **extra,
        }, format="json")

    def test_prn_defaults_administered_at_to_now(self):
        resp = self._give_prn()
        self.assertEqual(resp.status_code, 201)
        self.assertIsNotNone(resp.data["administered_at"])

    def test_prn_min_interval_enforced_and_override_notifies_managers(self):
        self.assertEqual(self._give_prn().status_code, 201)
        resp = self._give_prn()
        self.assertEqual(resp.status_code, 409)
        self.assertEqual(resp.data["safety_issues"][0]["code"], "prn_interval")

        resp = self._give_prn(safety_override_reason="GP verbal order")
        self.assertEqual(resp.status_code, 201)
        self.assertTrue(Notification.objects.filter(user=self.manager_a, message__startswith="Safety override").exists())

    def test_prn_24h_maximum_enforced(self):
        now = timezone.now()
        for h in (20, 15, 10, 5):
            PRNAdministration.objects.create(medication=self.paracetamol, administered_at=now - timedelta(hours=h),
                                             reason="Pain", dose_given="1g")
        resp = self._give_prn()
        self.assertEqual(resp.status_code, 409)
        self.assertIn("prn_max_daily", [i["code"] for i in resp.data["safety_issues"]])

    def test_prn_resident_filter(self):
        self._give_prn()
        other = self.make_resident(self.home_a, room_number="9Z")
        self.assertEqual(self.client_a.get(f"/api/v1/medications/prn-administrations/?resident={other.id}").data["count"], 0)
        self.assertEqual(self.client_a.get(f"/api/v1/medications/prn-administrations/?resident={self.resident.id}").data["count"], 1)

    # ── overdue alerts ──
    def test_overdue_doses_alert_once(self):
        self._pending(self.amox, minutes_ago=90)
        self._pending(self.amox, minutes_ago=30)        # still within grace period
        self._pending(self.amox, minutes_ago=60 * 24)   # too old for a live alert
        self.assertEqual(flag_overdue_doses(), 1)
        self.assertEqual(Notification.objects.filter(user=self.manager_a, message__contains="overdue").count(), 1)
        self.assertEqual(flag_overdue_doses(), 0)


class AllergyApiTests(TenantIsolationTestCase):
    def setUp(self):
        super().setUp()
        self.resident_a = self.make_resident(self.home_a, room_number="1A")
        self.resident_b = self.make_resident(self.home_b, room_number="1B")
        Allergy.objects.create(resident=self.resident_b, allergen="Latex")

    def test_create_and_list_scoped_to_home(self):
        resp = self.client_manager_a.post("/api/v1/residents/allergies/",
                                          {"resident": self.resident_a.id, "allergen": "Codeine", "severity": "severe"}, format="json")
        self.assertEqual(resp.status_code, 201)
        self.assertEqual(resp.data["recorded_by"], self.manager_a.id)
        listed = self.client_manager_a.get("/api/v1/residents/allergies/").data["results"]
        self.assertEqual([a["allergen"] for a in listed], ["Codeine"])

    def test_cannot_add_allergy_to_other_homes_resident(self):
        resp = self.client_manager_a.post("/api/v1/residents/allergies/",
                                          {"resident": self.resident_b.id, "allergen": "Codeine"}, format="json")
        self.assertEqual(resp.status_code, 400)

    def test_carer_cannot_edit_allergies(self):
        resp = self.client_a.post("/api/v1/residents/allergies/",
                                  {"resident": self.resident_a.id, "allergen": "Codeine"}, format="json")
        self.assertEqual(resp.status_code, 403)

    def test_resident_detail_includes_active_allergies(self):
        Allergy.objects.create(resident=self.resident_a, allergen="Penicillin", severity="anaphylaxis")
        resp = self.client_a.get(f"/api/v1/residents/{self.resident_a.id}/")
        self.assertEqual([a["allergen"] for a in resp.data["allergies"]], ["Penicillin"])
