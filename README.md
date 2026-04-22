# Cura — Full-Stack Care Home Management Platform

UK's #1 care home management platform, rebuilt on steroids.

## Architecture

```
cura/
├── /             ← Marketing site (Next.js 14, landing page)
├── /backend      ← Django REST Framework API
├── /frontend     ← Dashboard (Next.js 14, App Router)
└── docker-compose.yml
```

| Service    | URL                              | Stack                               |
|------------|----------------------------------|-------------------------------------|
| Marketing  | http://localhost:3000            | Next.js 14, Tailwind, Framer Motion |
| Dashboard  | http://localhost:3001            | Next.js 14, TypeScript              |
| API        | http://localhost:8000            | Django 5, DRF, SimpleJWT            |
| API Docs   | http://localhost:8000/api/docs/  | drf-spectacular / Swagger           |
| Admin      | http://localhost:8000/admin/     | Django Admin                        |

## Quick Start (Docker)

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
# Add ANTHROPIC_API_KEY to backend/.env

docker compose up --build
docker compose exec backend python manage.py createsuperuser
```

## Local Development

### Backend
```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

### Dashboard
```bash
cd frontend && npm install && npm run dev   # → http://localhost:3001
```

### Marketing site
```bash
npm run dev   # from repo root → http://localhost:3000
```

## API Endpoints (`/api/v1/`)

| Resource          | Path                                              |
|-------------------|---------------------------------------------------|
| Auth              | `/auth/login/` `/auth/refresh/` `/auth/me/`       |
| Residents         | `/residents/`                                     |
| Medications / MAR | `/medications/` `/medications/mar/` `/medications/low_stock/` |
| Care Plans        | `/care-plans/` `/care-plans/{id}/generate-summary/` |
| Staff             | `/staff/shifts/` `/staff/leave/` `/staff/training/` |
| Compliance        | `/compliance/audits/` `/compliance/policies/`     |
| AI                | `/ai/chat/` `/ai/compliance-gap-report/` `/ai/residents/{id}/risk-score/` |

## AI Features (Anthropic Claude)

- **Chat** — conversational assistant with full resident context
- **Care plan summaries** — plain-English handover briefs via `claude-sonnet-4-6`
- **Risk scoring** — composite 0–100 resident risk score via `claude-haiku-4-5-20251001`
- **Compliance gap report** — CQC-mapped gaps and improvement actions

## Roles

| Role      | Access                                    |
|-----------|-------------------------------------------|
| `admin`   | Full platform access                      |
| `manager` | Residents, care plans, compliance         |
| `nurse`   | Medications, MAR, care plans              |
| `carer`   | Residents, tasks, MAR (own shifts only)   |
| `hr`      | Staff, shifts, leave, training            |

## Key Environment Variables

`backend/.env`: `SECRET_KEY`, `DATABASE_URL`, `REDIS_URL`, `ANTHROPIC_API_KEY`, `CORS_ALLOWED_ORIGINS`

`frontend/.env`: `NEXT_PUBLIC_API_URL`
