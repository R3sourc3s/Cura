"""
Seed the database with realistic demo data for Cura.
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
                address="Flat 1, 31 Knighton Road, Leicester, LE2 3HL",
                bed_count=32,
                phone="0117 900 1234",
                email="info@sunrisecare.co.uk",
            ),
        )

        # ── Staff Users ────────────────────────────────────────────────────────
        staff_data = [
            ("manager", "Sarah", "Williams", "s.williams", "07700 900001"),
            ("nurse", "James", "Okonkwo", "j.okonkwo", "07700 900002"),
            ("nurse", "Priya", "Sharma", "p.sharma", "07700 900003"),
            ("carer", "Marcus", "Thompson", "m.thompson", "07700 900004"),
            ("carer", "Emily", "Chen", "e.chen", "07700 900005"),
            ("carer", "David", "Adeyemi", "d.adeyemi", "07700 900006"),
            ("hr", "Fiona", "MacLeod", "f.macleod", "07700 900007"),
        ]
        staff_users = []
        for role, first, last, uname, phone in staff_data:
            u, created = User.objects.get_or_create(
                username=uname,
                defaults=dict(
                    first_name=first,
                    last_name=last,
                    email=f"{uname}@sunrisecare.co.uk",
                    role=role,
                    care_home=home,
                    phone=phone,
                    is_staff=(role == "manager"),
                ),
            )
            if created:
                u.set_password("demo1234")
                u.save()
            staff_users.append(u)

        admin, created = User.objects.get_or_create(
            username="admin",
            defaults=dict(
                first_name="Admin",
                last_name="User",
                email="admin@sunrisecare.co.uk",
                role="admin",
                care_home=home,
                is_staff=True,
                is_superuser=True,
            ),
        )
        if created:
            admin.set_password("admin1234")
            admin.save()
        else:
            admin.care_home = home
            admin.role = "admin"
            admin.is_superuser = True
            admin.save(update_fields=["care_home", "role", "is_superuser"])

        # ── Residents ──────────────────────────────────────────────────────────
        residents_data = [
            # (first, last, dob, nhs, room, fall_risk, pressure_risk, ai_score, nok_name, nok_phone, nok_relation)
            ("Dorothy", "Hargreaves", "1938-03-12", "NHS001", "1A", "high",     "high",   78, "Margaret Hargreaves", "07800 100001", "Daughter"),
            ("Albert",  "Potts",      "1942-07-22", "NHS002", "1B", "medium",   "low",    45, "Colin Potts",         "07800 100002", "Son"),
            ("Edna",    "Clarke",     "1935-11-04", "NHS003", "2A", "low",      "low",    22, "Susan Clarke",        "07800 100003", "Daughter"),
            ("George",  "Baldwin",    "1940-01-30", "NHS004", "2B", "critical", "high",   91, "Anne Baldwin",        "07800 100004", "Wife"),
            ("Vera",    "Johnston",   "1944-09-15", "NHS005", "3A", "medium",   "medium", 54, "Peter Johnston",      "07800 100005", "Son"),
            ("Reg",     "Pemberton",  "1937-05-08", "NHS006", "3B", "high",     "high",   82, "Carol Pemberton",     "07800 100006", "Wife"),
            ("Mabel",   "Foster",     "1950-12-20", "NHS007", "4A", "low",      "low",    18, "Tom Foster",          "07800 100007", "Son"),
            ("Cyril",   "Abbott",     "1933-08-03", "NHS008", "4B", "medium",   "low",    39, "Irene Abbott",        "07800 100008", "Sister"),
            ("Gladys",  "Nash",       "1945-02-27", "NHS009", "5A", "high",     "medium", 71, "Brian Nash",          "07800 100009", "Son"),
            ("Herbert", "Moss",       "1939-06-14", "NHS010", "5B", "low",      "low",    28, "Ruth Moss",           "07800 100010", "Daughter"),
            ("Phyllis", "Cooper",     "1948-10-01", "NHS011", "6A", "medium",   "medium", 51, "David Cooper",        "07800 100011", "Son"),
            ("Alf",     "Brennan",    "1936-04-19", "NHS012", "6B", "critical", "high",   88, "Joan Brennan",        "07800 100012", "Daughter"),
        ]

        gps = [
            ("Dr Anita Patel",   "0117 111 2222", "Redland Surgery, Bristol"),
            ("Dr Ben Khan",      "0117 333 4444", "Clifton Village Practice"),
            ("Dr Claire Singh",  "0117 555 6666", "Montpelier Health Centre"),
        ]

        residents = []
        for fn, ln, dob, nhs, room, fall, pressure, ai_score, nok_name, nok_phone, nok_rel in residents_data:
            gp = random.choice(gps)
            r, _ = Resident.objects.get_or_create(
                nhs_number=nhs,
                defaults=dict(
                    care_home=home,
                    first_name=fn,
                    last_name=ln,
                    date_of_birth=dob,
                    room_number=room,
                    admission_date=date.today() - timedelta(days=random.randint(60, 730)),
                    fall_risk=fall,
                    pressure_ulcer_risk=pressure,
                    ai_risk_score=ai_score,
                    next_of_kin_name=f"{nok_name} ({nok_rel})",
                    next_of_kin_phone=nok_phone,
                    gp_name=gp[0],
                    gp_phone=gp[1],
                    is_active=True,
                ),
            )
            residents.append(r)

        # ── Conditions ─────────────────────────────────────────────────────────
        conditions_pool = [
            ("Dementia", "F00"),
            ("Type 2 Diabetes", "E11"),
            ("Hypertension", "I10"),
            ("Osteoporosis", "M81"),
            ("Heart Failure", "I50"),
            ("COPD", "J44"),
            ("Parkinson's Disease", "G20"),
            ("Osteoarthritis", "M15"),
            ("Depression", "F32"),
            ("Atrial Fibrillation", "I48"),
            ("Chronic Kidney Disease", "N18"),
            ("Hypothyroidism", "E03"),
            ("Stroke (History)", "Z86.7"),
            ("Anaemia", "D64"),
        ]
        # Assign specific conditions per resident for realism
        resident_conditions = [
            ["Dementia", "Hypertension", "Osteoporosis"],
            ["Type 2 Diabetes", "Hypertension", "COPD"],
            ["Osteoarthritis", "Hypothyroidism"],
            ["Dementia", "Heart Failure", "Atrial Fibrillation", "Hypertension"],
            ["Type 2 Diabetes", "Depression", "Osteoporosis"],
            ["Parkinson's Disease", "Hypertension", "Depression"],
            ["Osteoarthritis", "Anaemia"],
            ["Chronic Kidney Disease", "Hypertension", "Type 2 Diabetes"],
            ["COPD", "Heart Failure", "Anaemia"],
            ["Hypertension", "Osteoporosis"],
            ["Type 2 Diabetes", "Depression", "Chronic Kidney Disease"],
            ["Dementia", "Parkinson's Disease", "Atrial Fibrillation", "Heart Failure"],
        ]
        cond_map = {name: icd for name, icd in conditions_pool}

        for i, resident in enumerate(residents):
            if not resident.conditions.exists():
                for cond_name in resident_conditions[i]:
                    Condition.objects.create(
                        resident=resident,
                        name=cond_name,
                        icd_code=cond_map.get(cond_name, ""),
                        diagnosed_date=date.today() - timedelta(days=random.randint(180, 2000)),
                        notes=f"Diagnosed and managed. Regular monitoring required.",
                        is_active=True,
                    )

        # ── Medications + MAR ──────────────────────────────────────────────────
        drug_pool = [
            ("Metformin",       "500mg",   "oral",     "bd",  False, "Type 2 Diabetes management"),
            ("Amlodipine",      "10mg",    "oral",     "od",  False, "Hypertension"),
            ("Atorvastatin",    "40mg",    "oral",     "od",  False, "Cholesterol management"),
            ("Ramipril",        "5mg",     "oral",     "od",  False, "Hypertension / Heart Failure"),
            ("Paracetamol",     "500mg",   "oral",     "qds", False, "Pain management"),
            ("Warfarin",        "3mg",     "oral",     "od",  True,  "Anticoagulation – AF"),
            ("Salbutamol",      "100mcg",  "inhaled",  "prn", False, "COPD / Asthma relief"),
            ("Omeprazole",      "20mg",    "oral",     "od",  False, "Gastric protection"),
            ("Sertraline",      "50mg",    "oral",     "od",  False, "Depression"),
            ("Morphine SR",     "10mg",    "oral",     "bd",  True,  "Chronic pain management"),
            ("Donepezil",       "10mg",    "oral",     "od",  False, "Dementia – cognitive support"),
            ("Furosemide",      "40mg",    "oral",     "od",  False, "Heart Failure / fluid retention"),
            ("Levothyroxine",   "50mcg",   "oral",     "od",  False, "Hypothyroidism"),
            ("Co-careldopa",    "25/100mg","oral",     "tds", False, "Parkinson's Disease"),
            ("Aspirin",         "75mg",    "oral",     "od",  False, "Antiplatelet – cardiac / stroke"),
            ("Bisoprolol",      "5mg",     "oral",     "od",  False, "Heart Failure / AF rate control"),
        ]

        today = date.today()
        for resident in residents:
            if not resident.medications.exists():
                sample = random.sample(drug_pool, random.randint(2, 5))
                for drug_name, dose, route, freq, is_controlled, indication in sample:
                    stock = random.randint(3, 60)
                    med = Medication.objects.create(
                        resident=resident,
                        drug_name=drug_name,
                        dose=dose,
                        route=route,
                        frequency=freq,
                        indication=indication,
                        prescribed_by=random.choice(gps)[0],
                        start_date=today - timedelta(days=random.randint(14, 365)),
                        stock_count=stock,
                        reorder_threshold=7,
                        is_controlled=is_controlled,
                        is_active=True,
                    )

                    doses_per_day = {"od": 1, "bd": 2, "tds": 3, "qds": 4, "prn": 0, "weekly": 0}
                    count = doses_per_day.get(freq, 1)
                    if count == 0:
                        continue
                    for days_ago in range(6, -1, -1):
                        entry_date = today - timedelta(days=days_ago)
                        for i in range(count):
                            hour = 8 + (i * (12 // max(count, 1)))
                            scheduled = timezone.make_aware(
                                datetime(entry_date.year, entry_date.month, entry_date.day, hour, 0)
                            )
                            if days_ago == 0:
                                status = random.choices(["pending", "given"], weights=[45, 55])[0]
                            else:
                                status = random.choices(["given", "refused", "omitted"], weights=[88, 8, 4])[0]
                            MAREntry.objects.get_or_create(
                                medication=med,
                                scheduled_at=scheduled,
                                defaults=dict(
                                    administered_at=scheduled + timedelta(minutes=random.randint(5, 30)) if status == "given" else None,
                                    administered_by=random.choice(staff_users[:3]),
                                    status=status,
                                    notes="Administered as prescribed." if status == "given" else "",
                                ),
                            )

        # ── Care Plans ─────────────────────────────────────────────────────────
        section_templates = {
            "Personal Hygiene & Grooming": {
                "medium": "Staff to assist {name} with full personal care each morning. {name} requires prompting for oral hygiene and support with bathing. Use appropriate aids. Document any skin changes or concerns.",
                "low": "{name} manages personal hygiene with minimal prompting. Staff to offer assistance and check skin integrity during care.",
            },
            "Mobility & Falls Prevention": {
                "high": "{name} is at HIGH risk of falls. Ensure call bell is within reach at all times. Use bed/chair sensor alarms overnight. Two-person assist required for transfers. Non-slip footwear mandatory. Complete post-fall assessment if incident occurs.",
                "medium": "{name} mobilises with a walking frame. Monitor closely, especially on uneven surfaces. Encourage regular supervised movement.",
                "low": "{name} is independently mobile. Encourage regular walks. Monitor footwear and environment for hazards.",
            },
            "Nutrition & Hydration": {
                "medium": "Offer small, frequent meals. Monitor fluid intake (target 1.5L/day). Soft diet recommended. Complete fluid balance charts twice daily. Refer to dietitian if weight drops >2kg in one month.",
                "low": "{name} has a good appetite. Offer menu choices and ensure adequate hydration. Weigh monthly.",
            },
            "Medication Management": {
                "high": "{name} is unable to self-medicate. All medications administered by nursing staff. Two-nurse sign-off required for controlled drugs. Monitor for side effects and document on MAR chart.",
                "medium": "{name} requires prompting to take medications. Staff to observe administration and document on MAR. Report any refusals immediately.",
            },
            "Cognitive & Emotional Wellbeing": {
                "high": "{name} experiences significant cognitive impairment. Use calm, reassuring communication. Validate feelings; avoid correcting repeatedly. Involve in meaningful activities. Alert nurse if distress increases.",
                "medium": "{name} shows mild-moderate cognitive changes. Maintain routine and familiar environment. Encourage reminiscence activities. Monitor for signs of low mood or anxiety.",
                "low": "{name} is cognitively well. Encourage social activities and engagement with the wider community.",
            },
            "Skin Integrity & Pressure Care": {
                "high": "{name} is at HIGH risk of pressure damage (Waterlow score >15). Reposition every 2 hours. Use specialist pressure-relieving mattress. Inspect all bony prominences at each care episode. Document using body map.",
                "medium": "{name} is at moderate risk. Daily skin checks required. Encourage movement and repositioning. Apply barrier cream to vulnerable areas.",
            },
        }

        for resident in residents:
            if not resident.care_plans.exists():
                status = random.choices(
                    ["active", "under_review", "draft"],
                    weights=[60, 25, 15]
                )[0]
                plan = CarePlan.objects.create(
                    resident=resident,
                    version=1,
                    status=status,
                    created_by=staff_users[0],
                    next_review_date=today + timedelta(days=random.randint(14, 90)),
                    ai_summary="",
                    ai_generated=False,
                )
                # Regenerate ai_summary since plan is now saved
                plan.ai_summary = (
                    f"{resident.full_name} is a {resident.age}-year-old resident in room {resident.room_number}. "
                    f"Fall risk: {resident.fall_risk.upper()}. Pressure ulcer risk: {resident.pressure_ulcer_risk.upper()}. "
                    f"AI risk score: {resident.ai_risk_score}/100. "
                    f"Conditions: {', '.join(c.name for c in resident.conditions.all()[:3])}. "
                    f"Plan status: {status.replace('_', ' ')}."
                )
                plan.save(update_fields=["ai_summary"])

                selected_sections = random.sample(list(section_templates.keys()), random.randint(4, 6))
                risk_levels = {"high": "high", "critical": "high", "medium": "medium", "low": "low"}
                for title in selected_sections:
                    templates = section_templates[title]
                    if resident.fall_risk in ("critical", "high") and title == "Mobility & Falls Prevention":
                        risk = "high"
                    elif resident.pressure_ulcer_risk in ("critical", "high") and "Pressure" in title:
                        risk = "high"
                    else:
                        risk = random.choices(["high", "medium", "low"], weights=[20, 50, 30])[0]
                    content_template = templates.get(risk, list(templates.values())[0])
                    content = content_template.format(name=resident.first_name)
                    CarePlanSection.objects.create(
                        care_plan=plan,
                        title=title,
                        content=content,
                        risk_level=risk,
                    )

        # ── Compliance Audits ──────────────────────────────────────────────────
        domains = ["safe", "effective", "caring", "responsive", "well_led"]
        domain_notes = {
            "safe": "Medication management processes reviewed. All PRN protocols up to date. Two near-miss incidents documented and actioned.",
            "effective": "Staff training compliance at 94%. Care plans reviewed quarterly. Evidence-based practice embedded across teams.",
            "caring": "Resident satisfaction survey completed — 89% rated care as 'good' or 'excellent'. Dignity in care audit passed.",
            "responsive": "Complaint response times within KPI. Resident preferences documented in all active care plans.",
            "well_led": "Leadership walk-rounds completed monthly. Staff supervision up to date. Quality improvement plan active.",
        }

        def score_to_rating(score):
            if score >= 90: return "outstanding"
            if score >= 75: return "good"
            if score >= 50: return "requires_improvement"
            return "inadequate"

        for domain in domains:
            if not ComplianceAudit.objects.filter(care_home=home, domain=domain).exists():
                score = random.randint(65, 95)
                ComplianceAudit.objects.create(
                    care_home=home,
                    domain=domain,
                    score=score,
                    rating=score_to_rating(score),
                    conducted_by=staff_users[0],
                    audit_date=today - timedelta(days=random.randint(10, 45)),
                    next_audit_date=today + timedelta(days=random.randint(90, 180)),
                    notes=domain_notes[domain],
                )

        # ── Shifts ─────────────────────────────────────────────────────────────
        shift_types = [
            ("day",     "07:00", "19:00"),
            ("evening", "14:00", "22:00"),
            ("night",   "21:00", "07:00"),
        ]
        for days_offset in range(-5, 10):
            shift_date = today + timedelta(days=days_offset)
            for shift_type, start, end in shift_types:
                for user in random.sample(staff_users[1:], min(2, len(staff_users) - 1)):
                    Shift.objects.get_or_create(
                        care_home=home,
                        staff_member=user,
                        date=shift_date,
                        shift_type=shift_type,
                        defaults=dict(start_time=start, end_time=end, is_agency=False),
                    )

        # ── Leave Requests ─────────────────────────────────────────────────────
        if not LeaveRequest.objects.filter(staff_member__in=staff_users).exists():
            leave_scenarios = [
                ("annual", 5, "Annual leave — family holiday"),
                ("sick",   2, "Unwell — GP certificate provided"),
                ("training", 1, "Mandatory manual handling refresher"),
                ("annual", 3, "Annual leave"),
            ]
            for user, (leave_type, duration, reason) in zip(
                random.sample(staff_users, min(4, len(staff_users))),
                leave_scenarios
            ):
                start_d = today + timedelta(days=random.randint(3, 30))
                LeaveRequest.objects.create(
                    staff_member=user,
                    leave_type=leave_type,
                    start_date=start_d,
                    end_date=start_d + timedelta(days=duration),
                    status=random.choice(["pending", "approved", "approved"]),
                    reason=reason,
                )
