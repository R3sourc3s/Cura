"""
Anthropic Claude integration layer.

All AI calls go through this module so prompt engineering,
model selection, and caching are centralised.
"""

import anthropic
from django.conf import settings

_client = None


def _get_client() -> anthropic.Anthropic:
    global _client
    if _client is None:
        _client = anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)
    return _client


SYSTEM_PROMPT = """You are Cura AI, an intelligent assistant embedded in a UK care home management platform.
You have deep knowledge of CQC regulations, NHS frameworks, medication safety, and best-practice care planning.
You are concise, clinical, and compassionate. You always flag safeguarding risks explicitly.
You never fabricate clinical information — when uncertain, say so and suggest seeking professional advice."""


def chat(messages: list[dict], resident_context: str = "") -> str:
    """
    Send a conversational message to Claude and return the reply text.

    messages: list of {"role": "user"|"assistant", "content": str}
    resident_context: optional pre-pended context about the resident
    """
    system = SYSTEM_PROMPT
    if resident_context:
        system += f"\n\nResident context:\n{resident_context}"

    response = _get_client().messages.create(
        model="claude-sonnet-4-6",
        max_tokens=1024,
        system=system,
        messages=messages,
    )
    return response.content[0].text


def generate_care_plan_summary(care_plan) -> str:
    """Summarise a care plan in plain English for handover briefings."""
    sections_text = "\n".join(
        f"- {s.title} ({s.risk_level} risk): {s.content}"
        for s in care_plan.sections.all()
    )
    prompt = f"""Summarise the following care plan for {care_plan.resident.full_name} in plain English.
Write for a carer who is starting their shift. Highlight the most important points and any high-risk areas.
Keep it under 200 words.

Care plan sections:
{sections_text}"""

    response = _get_client().messages.create(
        model="claude-sonnet-4-6",
        max_tokens=512,
        system=SYSTEM_PROMPT,
        messages=[{"role": "user", "content": prompt}],
    )
    return response.content[0].text


def score_resident_risk(resident) -> int:
    """
    Ask Claude to estimate a composite risk score (0–100) for a resident
    based on their conditions, medications, and care plan flags.
    Returns an integer score.
    """
    conditions = ", ".join(c.name for c in resident.conditions.filter(is_active=True))
    meds = ", ".join(m.drug_name for m in resident.medications.filter(is_active=True))

    prompt = f"""Resident: {resident.full_name}, age {resident.age}
Active conditions: {conditions or 'none recorded'}
Current medications: {meds or 'none recorded'}
Recorded fall risk: {resident.fall_risk}
Recorded pressure ulcer risk: {resident.pressure_ulcer_risk}

Based on this information, provide a composite risk score from 0 (minimal risk) to 100 (critical risk).
Reply with ONLY a single integer."""

    response = _get_client().messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=10,
        system=SYSTEM_PROMPT,
        messages=[{"role": "user", "content": prompt}],
    )
    try:
        return int(response.content[0].text.strip())
    except ValueError:
        return 0
