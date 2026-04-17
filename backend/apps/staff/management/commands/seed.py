"""
Seed the database with realistic demo data for Empathika.
Run: python manage.py seed
"""
import random
from datetime import date, timedelta, datetime
from django.core.management.base import BaseCommand
from django.utils import timezone


class Command(BaseCommand):
    help = "Seed the database with demo care home data"

    def handle(self, *args, **options):
        self.stdout.write("Seeding database...")
        self._seed()
        self.stdout.write(self.style.SUCCESS("Done."))

    def _seed(self):
        from apps.staff.models import CareHome, Shift, LeaveRequest, Training
        from apps.residents.models import Resident, Condition
        from apps.medications.models import Medication, MAREntry
        from apps.care_plans.models import CarePlan, CarePlanSection
        from apps.compliance.models import ComplianceAudit
        from apps.authentication.models import User

        # ── Care Home ──────────────────────────────────────────────────────────
        home, _ = CareHome.objects.get_or_create(
            cqc_registration_number="CQC-2024-DEMO",
            defaults=dict(
                name="Sunrise Care Home",
                address="12 Maple Grove, Bristol, BS1 4LR",
                bed_count=32,
                phone="0117 900 1234",
                email="info@sunrisecare.co.uk",
            ),
        )

        # ── Staff Users ────────────────────────────────────────────────────────
        staff_data = [
            ("manager", "Sarah", "Williams", "s.williams"),
            ("nurse", "James", "Okonkwo", "j.okonkwo"),
            ("nurse", "Priya", "Sharma", "p.sharma"),
            ("carer", "Marcus", "Thompson", "m.thompson"),
            ("carer", "Emily", "Chen", "e.chen"),
            ("carer", "David", "Adeyemi", "d.adeyemi"),
            ("hr", "Fiona", "MacLeod", "f.macleod"),
        ]
        staff_users = []
        for role, first, last, uname in staff_data:
            u, created = User.objects.get_or_create(
                username=uname,
                defaults=dict(
                    first_name=first,
                    last_name=last,
                    email=f"{uname}@sunrisecare.co.uk",
                    role=role,
                    care_home=home,
                    is_staff=(role == "manager"),
                ),
            )
            if created:
                u.set_password("demo1234")
                u.save()
            staff_users.append(u)

        # Update admin's care_home
        User.objects.filter(username="admin").update(care_home=home, role="admin")

        # ── Residents ──────────────────────────────────────────────────────────
        residents_data = [
            ("Dorothy", "Hargreaves", "1938-03-12", "NHS001", "1A", "high", "high", 78),
            ("Albert", "Potts", "1942-07-22", "NHS002", "1B", "medium", "low", 45),
            ("Edna", "Clarke", "1935-11-04", "NHS003", "2A", "low", "low", 22),
            ("George", "Baldwin", "1940-01-30", "NHS004", "2B", "critical", "high", 91),
            ("Vera", "Johnston", "1944-09-15", "NHS005", "3A", "medium", "medium", 54),
            ("Reg", "Pemberton", "1937-05-08", "NHS006", "3B", "high", "high", 82),
            ("Mabel", "Foster", "1950-12-20", "NHS007", "4A", "low", "low", 18),
            ("Cyril", "Abbott", "1933-08-03", "NHS008", "4B", "medium", "low", 39),
            ("Gladys", "Nash", "1945-02-27", "NHS009", "5A", "high", "medium", 71),
            ("Herbert", "Moss", "1939-06-14", "NHS010", "5B", "low", "low", 28),
            ("Phyllis", "Cooper", "1948-10-01", "NHS011", "6A", "medium", "medium", 51),
            ("Alf", "Brennan", "1936-04-19", "NHS012", "6B", "critical", "high", 88),
        ]
        residents = []
        nok_names = ["Mary Smith", "John Smith", "Susan Jones", "Paul Brown", "Linda Davis"]
        gps = [("Dr A. Patel", "0117 111 2222"), ("Dr B. Khan", "0117 333 4444"), ("Dr C. Singh", "0117 555 6666")]

        for fn, ln, dob, nhs, room, fall, pressure, ai_score in residents_data:
            gp = random.choice(gps)
            r, _ = Resident.objects.get_or_create(
                nhs_number=nhs,
                defaults=dict(
                    care_home=home,
                    first_name=fn,
                    last_name=ln,
                    date_of_birth=dob,
                    room_number=room,
                    admission_date=date.today() - timedelta(days=random.randint(30, 730)),
                    fall_risk=fall,
                    pressure_ulcer_risk=pressure,
                    ai_risk_score=ai_score,
                    next_of_kin_name=random.choice(nok_names),
                    next_of_kin_phone=f"07{random.randint(700000000, 999999999)}",
                    gp_name=gp[0],
                    gp_phone=gp[1],
                    is_active=True,
                ),
            )
            residents.append(r)

        # ── Conditions ─────────────────────────────────────────────────────────
        conditions_pool = [
            ("Dementia", "F00"), ("Type 2 Diabetes", "E11"), ("Hypertension", "I10"),
            ("Osteoporosis", "M81"), ("Heart Failure", "I50"), ("COPD", "J44"),
            ("Parkinson's Disease", "G20"), ("Arthritis", "M15"), ("Depression", "F32"),
            ("Atrial Fibrillation", "I48"),
        ]
        for resident in residents:
            if not resident.conditions.exists():
                for cond, icd in random.sample(conditions_pool, random.randint(1, 3)):
                    Condition.objects.create(
                        resident=resident,
                        name=cond,
                        icd_code=icd,
                        diagnosed_date=date.today() - timedelta(days=random.randint(180, 1800)),
                        is_active=True,
                    )

        # ── Medications + MAR ──────────────────────────────────────────────────
        drug_pool = [
            ("Metformin", "500mg", "oral", "bd"),
            ("Amlodipine", "10mg", "oral", "od"),
            ("Atorvastatin", "40mg", "oral", "od"),
            ("Ramipril", "5mg", "oral", "od"),
            ("Paracetamol", "500mg", "oral", "qds"),
            ("Warfarin", "3mg", "oral", "od"),
            ("Salbutamol", "100mcg", "inhaled", "prn"),
            ("Omeprazole", "20mg", "oral", "od"),
            ("Sertraline", "50mg", "oral", "od"),
            ("Morphine SR", "10mg", "oral", "bd"),
        ]
        today = date.today()
        all_medications = []
        for resident in residents:
            if not resident.medications.exists():
                for drug_name, dose, route, freq in random.sample(drug_pool, random.randint(2, 4)):
                    is_controlled = drug_name in ("Warfarin", "Morphine SR")
                    stock = random.randint(2, 60)
                    med = Medication.objects.create(
                        resident=resident,
                        drug_name=drug_name,
                        dose=dose,
                        route=route,
                        frequency=freq,
                        indication="As prescribed",
                        prescribed_by="Dr A. Patel",
                        start_date=today - timedelta(days=random.randint(7, 180)),
                        stock_count=stock,
                        reorder_threshold=7,
                        is_controlled=is_controlled,
                        is_active=True,
                    )
                    all_medications.append(med)

                    # MAR entries for the past 3 days + today
                    for days_ago in range(3, -1, -1):
                        entry_date = today - timedelta(days=days_ago)
                        doses_per_day = {"od": 1, "bd": 2, "tds": 3, "qds": 4, "prn": 0, "weekly": 0}
                        count = doses_per_day.get(freq, 1)
                        for i in range(count):
                            hour = 8 + (i * (12 // max(count, 1)))
                            scheduled = timezone.make_aware(
                                datetime(entry_date.year, entry_date.month, entry_date.day, hour, 0)
                            )
                            if days_ago == 0:
                                status = random.choices(["pending", "given"], weights=[40, 60])[0]
                            else:
                                status = random.choices(["given", "refused", "omitted"], weights=[85, 10, 5])[0]
                            MAREntry.objects.get_or_create(
                                medication=med,
                                scheduled_at=scheduled,
                                defaults=dict(
                                    administered_at=scheduled + timedelta(minutes=random.randint(5, 30)) if status == "given" else None,
                                    administered_by=random.choice(staff_users[:3]),
                                    status=status,
                                ),
                            )

        # ── Care Plans ─────────────────────────────────────────────────────────
        section_templates = [
            ("Personal Care", "medium"),
            ("Mobility & Falls Prevention", "high"),
            ("Nutrition & Hydration", "low"),
            ("Medication Management", "medium"),
            ("Cognitive & Emotional Wellbeing", "high"),
        ]
        statuses = ["active", "active", "active", "under_review", "draft"]
        for resident in residents:
            if not resident.care_plans.exists():
                plan = CarePlan.objects.create(
                    resident=resident,
                    version=1,
                    status=random.choice(statuses),
                    created_by=staff_users[0],
                    next_review_date=today + timedelta(days=random.randint(7, 90)),
                    ai_summary=f"Care plan for {resident.full_name}. Requires support with personal care and medication management. Risk score: {resident.ai_risk_score}/100.",
                )
                for title, risk in random.sample(section_templates, 3):
                    CarePlanSection.objects.create(
                        care_plan=plan,
                        title=title,
                        content=f"Staff to assist {resident.first_name} with {title.lower()}. Monitor closely and document any changes.",
                        risk_level=risk,
                    )

        # ── Compliance Audits ──────────────────────────────────────────────────
        domains = ["safe", "effective", "caring", "responsive", "well_led"]
        ratings_map = {
            range(90, 101): "outstanding",
            range(75, 90): "good",
            range(50, 75): "requires_improvement",
            range(0, 50): "inadequate",
        }

        def score_to_rating(score):
            for r, rating in ratings_map.items():
                if score in r:
                    return rating
            return "good"

        for domain in domains:
            if not ComplianceAudit.objects.filter(care_home=home, domain=domain).exists():
                score = random.randint(62, 96)
                ComplianceAudit.objects.create(
                    care_home=home,
                    domain=domain,
                    score=score,
                    rating=score_to_rating(score),
                    conducted_by=staff_users[0],
                    audit_date=today - timedelta(days=random.randint(10, 60)),
                    next_audit_date=today + timedelta(days=random.randint(60, 180)),
                    notes=f"CQC {domain.replace('_', '-')} domain audit completed. Areas of improvement identified and actioned.",
                )

        # ── Shifts ─────────────────────────────────────────────────────────────
        shift_types = ["day", "evening", "night"]
        for days_offset in range(-3, 8):
            shift_date = today + timedelta(days=days_offset)
            for shift_type in shift_types:
                times = {"day": ("07:00", "19:00"), "evening": ("14:00", "22:00"), "night": ("21:00", "07:00")}
                start, end = times[shift_type]
                for user in random.sample(staff_users[1:], min(2, len(staff_users) - 1)):
                    Shift.objects.get_or_create(
                        care_home=home,
                        staff_member=user,
                        date=shift_date,
                        shift_type=shift_type,
                        defaults=dict(start_time=start, end_time=end, is_agency=False),
                    )

        # ── Leave Requests ─────────────────────────────────────────────────────
        leave_types = ["annual", "sick", "training"]
        statuses_leave = ["pending", "pending", "approved", "approved", "rejected"]
        if not LeaveRequest.objects.filter(staff_member__in=staff_users).exists():
            for user in random.sample(staff_users, min(4, len(staff_users))):
                start_d = today + timedelta(days=random.randint(1, 30))
                LeaveRequest.objects.create(
                    staff_member=user,
                    leave_type=random.choice(leave_types),
                    start_date=start_d,
                    end_date=start_d + timedelta(days=random.randint(1, 7)),
                    status=random.choice(statuses_leave),
                    reason="Personal request",
                )
