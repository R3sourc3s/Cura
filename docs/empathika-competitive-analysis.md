# Cura vs. Empathika — Competitive Analysis & Roadmap
*Prepared 9 August 2026*

## 1. What Empathika offers that Cura doesn't yet

Empathika (built by CareApps Ltd, affiliated with Langdale Care Homes) markets itself as a UK all-in-one care home platform. Cross-referencing their site against Cura's current modules (Residents, Medications/MAR, Care Plans, Staff shifts/leave/training, Compliance audits/policies, and AI chat/summaries/risk-score/compliance-gap-report), the gaps are:

**Medication / eMAR**
- Automated refill and stock alerts (Cura has low-stock but not proactive reorder workflows)
- Direct pharmacy-order integration with real-time order status
- Voice-assisted eMAR entry and AI prescription transcription
- Facial-recognition witnessing for controlled-drug sign-off
- Dashboards specifically slicing PRN usage, psychotropic usage, and patch/topical applications

**Care management**
- PEG chart tracking and body map history (wound/skin mapping over time)
- Multi-wing/branch central oversight with room allocation
- Incident reports feeding a "predictive risk" loop rather than staying purely retrospective

**Workforce**
- A standalone Recruitment module (onboarding, real-time staff visibility, availability tracking)
- Task management with pre-defined + dynamic per-resident routines and live task alerts

**Compliance / trust signals**
- Publicly documented certifications: DTAC (audited by a named third party), Cyber Essentials Plus, ISO 27001, NHS DSPT "Standards Exceeded," ICO registration, PRSB partnership
- DCB0129/DCB0160 clinical risk management documentation

**AI assistant**
- A chat assistant scoped specifically to guide staff through incident reporting and PRN protocols in the moment (Cura's `/ai/chat/` is more general-purpose)

Notably, none of this is exotic — it's solid execution, not deep tech. And Empathika has real, admitted weaknesses (below) that are cheap for Cura to exploit.

## 2. Empathika's exposed weaknesses (from their own public NHS DTAC filing)

- **No API or integration channel for third parties** — stated outright on their DTAC self-assessment. Any pharmacy/EHR "integration" they advertise is point-to-point, not an open platform.
- **WCAG 2.1 AA accessibility is only "partial"** — self-reported gaps in screen-reader support, keyboard navigation, and dynamic-content announcements.
- **No wearable or ambient-sensor integration** — explicitly answered "No" on their compliance form.
- **No pricing published anywhere** — fully demo-gated sales motion, which is normal for enterprise SaaS but leaves an opening for a transparent-pricing challenger.
- Operator-affiliated (Langdale Care Homes) — a credibility asset for care expertise, but a potential independence concern for multi-operator prospects who don't want to buy software from a competitor's sister company.

## 3. Wider market — what the leaders do well

| Player | Where they win |
|---|---|
| Person Centred Software | Massive scale (750+ homes), low-typing point-of-care UI, and a real partner ecosystem (e.g. PainChek for AI pain detection) |
| Nourish Care | "Nourish Confidence" — AI-driven audit/action-plan suggestions and an AI copilot for note-taking; premium priced |
| Log my Care | Free tier to 25 residents, 1-month contracts — near-zero switching friction for small homes |
| CoolCare | Strong back-office/payroll ROI story (£25–35k/home claimed savings) |
| Access Group | Enterprise multi-site suite with conglomerate cross-sell power |
| Radar Healthcare + Care Control | Real two-vendor interoperability — automatic incident sync between platforms |
| Sona.ai | Pure-play AI workforce/rostering optimisation, well funded ($27.5M Series A) |

## 4. Where the market is actually heading (2025–2026 signals)

- **Ambient/passive monitoring** (Wi-Fi sensing, radar, sleep mats) is overtaking wearables for fall detection and is framed as privacy-preserving — this is largely unclaimed territory among the named UK care-home vendors above.
- **Predictive deterioration models** (NEWS2-aligned, EHR+vitals+notes based) are the most active research area in care AI right now — a natural extension of Cura's existing risk-score feature.
- **AI scribes/voice documentation** are becoming table stakes, cutting charting time up to ~40%.
- **Family portals** with two-way messaging and photo sharing report 30–40% fewer routine phone inquiries — a feature none of the UK players above lead on decisively.
- **Regulatory direction**: DTAC v2.0 goes live 6 April 2026 (DSPT "Standards Met" becomes a hard prerequisite, not a parallel track); CQC is moving to a data-driven inspection model that rewards clean, queryable digital records and explicitly wants AI decisions to stay auditable, not black-box; the Casey Commission is expected to propose national social-care technology standards (report now due summer 2027) — early compliance-by-design will be a procurement advantage when that lands.

## 5. Recommendations — how Cura stands out

**Ship now (cheap, high-leverage, directly counters Empathika's admitted gaps)**
1. Open API / webhook layer for pharmacy, GP/EHR, and family-app partners — Empathika explicitly has none. Market this as "the only open platform in UK care tech."
2. Full WCAG 2.1 AA compliance (not "partial") — becomes a genuine, provable differentiator and a CQC/DTAC talking point.
3. Transparent published pricing with a generous free/low-cost tier for small homes (undercut Nourish's opacity, match Log my Care's low friction).
4. A family/relative portal — daily updates, photos, two-way messaging. Nobody in the comparison table owns this decisively yet.

**Build next (matches table stakes, extends Cura's existing AI edge)**
5. Extend the existing risk-score endpoint into NEWS2-aligned predictive deterioration alerts — Cura already has the foundation (`/ai/residents/{id}/risk-score/`); this is the single highest-leverage move since it's additive AI work, not a new module.
6. Voice-assisted MAR entry / AI scribe for handovers and care-note documentation.
7. PEG chart and body-map (wound tracking) history in Care Plans.
8. Facial-recognition or biometric witnessing for controlled-drug administration.
9. Recruitment + Task Management modules to close the workforce feature parity gap.

**Differentiate for the long game (whitespace nobody in this market owns)**
10. Ambient/passive monitoring integration (non-wearable fall detection, sleep/activity sensors) — feed directly into the risk-score model. This is where CMS and clinical research are pointing and no UK competitor above has claimed it.
11. Partner ecosystem, PCS-style — integrate PainChek, wearables, NHS TRUD, rather than building everything in-house.
12. Compliance-by-design roadmap: Cyber Essentials+, ISO 27001, NHS DSPT "Standards Exceeded," DTAC v2.0 readiness before April 2026, DCB0129/DCB0160 documentation — publish these credentials prominently (Empathika does, and it visibly builds trust).

## 6. Positioning line

Empathika sells "one platform, every function." Cura's wedge: **the only open, accessible, predictive care platform** — open API where they have none, full accessibility where they're partial, and predictive (not just reactive) resident risk where the whole market is still catching up.

---
*Sources: empathika.com (homepage, /ai, /medication, /care-mangement, /compliance, /dtac); personcentredsoftware.com; nourishcare.com; logmycare.co.uk; coolcare.co.uk; theaccessgroup.com; radarhealthcare.com; getsona.com; theaccessgroup.com/blog (2026 HSC trends); naqcyber.com and periculo.co.uk (DTAC v2.0); caredaily.co.uk (CQC 2026 guide); caseycommission.co.uk.*
