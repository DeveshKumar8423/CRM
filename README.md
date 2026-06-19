# BlackPapers CRM

A full-stack CRM for **BlackPapers** (Tributaries Unicorn LLP), built as an Odoo-style SaaS foundation for compliance, legal, and business services (India-first).

**Stack:** FastAPI + SQLAlchemy + PostgreSQL + Alembic (backend) · React (Create React App) frontend

**Current build:** Level 1 core foundation is largely complete. Level 2 sales, CRM, and billing is ~85% complete — the full sales flow from lead → deal → quotation → order → invoice is working in the app.

---

## Build status at a glance

| Level | Progress | Summary |
|-------|----------|---------|
| **Level 1** | ~70% done | Users, company, roles, contacts, products, dashboard, activity logs |
| **Level 2** | ~85% done | Leads, pipeline, quotes, orders, invoices, notes, reports, follow-ups, payments |

---

## Level 1 — Core Foundation

| # | Module | Status |
|---|--------|--------|
| 1 | User Management | **Done** — staff accounts, profile, JWT auth, forgot/reset password |
| 2 | Company Management | **Done** — business profile, GSTIN/PAN, currency |
| 3 | Role & Permission System | **Done** — permission-gated APIs and frontend nav |
| 4 | Contact Database | **Done** — CRUD, notes, activities (~297 clients) |
| 5 | Product / Service Master | **Done** — service catalogue, pricing, categories (~134 services) |
| 6 | Basic Dashboard | **Done** — welcome screen + client KPIs + sales KPIs |
| 7 | Activity Logs | **Done** — login/edit audit trail (Admin) |
| 8 | Notifications | **Deferred** |
| 9 | File Upload | **Deferred** |
| 10 | System Settings | **Partial** — company settings live; advanced templates/numbering later |

---

## Level 2 — Sales, CRM & Billing

| # | Module | Status | Notes |
|---|--------|--------|-------|
| 1 | Lead Management | **Done** | CSV import, list/filter, assign, convert to contact (20k+ leads supported) |
| 2 | Sales Pipeline | **Done** | Deal stages, kanban board, expected value, demo deals |
| 3 | Follow-up Reminders | **Partial** | `/follow-ups` queue, reminders on lead/deal pages, overdue logic; auto email/WhatsApp not live |
| 4 | Quotation System | **Done** | Create, approve, preview, send, client share link, demo data |
| 5 | Sales Orders | **Done** | Convert from quote, milestones, status flow, demo data |
| 6 | Invoice Generator | **Done** | GST invoice, PDF preview, client share link, demo data |
| 7 | Payment Tracking | **Partial** | Outstanding invoices, ageing buckets, payments page; full reconciliation TBD |
| 8 | Client Notes | **Done** | Notes on leads/deals/contacts, follow-up flags, demo data |
| 9 | WhatsApp / Email | **Not started** | Needs SMTP + WhatsApp Business API credentials |
| 10 | Sales Reports | **Done** | Overview, conversion, revenue, lead sources, team, pending deals, pipeline health |

### Sales flow currently working

```
Lead → Deal → Quotation → Sales Order → Invoice → Payments
```

### UI polish already added

- Dashboard sales KPI widget
- Cross-links between lead, deal, quote, order, and invoice detail pages
- Active section highlight in the top navigation
- Unified follow-up queue (reminders + client note follow-ups)

---

## What’s remaining

| Area | What’s still needed |
|------|---------------------|
| WhatsApp / Email module | SMTP credentials + WhatsApp Business API from manager/IT |
| Auto follow-up reminders | Email/WhatsApp provider + reminder rules |
| Payment tracking (full) | Payment entry workflow, reconciliation, optional payment gateway |
| Level 1 deferred items | In-app notifications, file upload, advanced system settings |
| Production billing polish | Final GSTIN, bank details, SAC codes, invoice/quote layout sign-off |
| Lead capture integrations | Website forms, WhatsApp, Meta ads (if required) |
| Deployment | Live server hosting, domain, SSL, production `.env` |

---

## Prerequisites

| Tool | Version | Purpose |
|------|---------|---------|
| **Python** | 3.10+ (3.11 recommended) | Backend API |
| **Node.js** | 18+ (LTS) | Frontend (`npm`) |
| **PostgreSQL** | 14+ (16 recommended) | Database |
| **Git** | Latest | Clone repo |

Optional: **pgAdmin 4**, **VS Code**

---

## Project structure

```
CRM/
├── crm_backend/              # FastAPI API, models, migrations, seeds
│   ├── alembic/              # Database migrations
│   ├── routers/              # API routes (leads, deals, quotes, invoices, …)
│   ├── services/             # Email service, PDF helpers
│   ├── .env.example          # Copy to .env and edit
│   └── seed_*.py             # Data import and demo scripts
├── crm_frontend/             # React UI (see crm_frontend/README.md)
├── docs/                     # PRDs for Level 2 modules
├── clients.json              # NOT in Git — get from team lead
├── Lead_file.csv             # NOT in Git — lead import source
├── Final Master_Service_List.xlsx
└── Master Employee Sheet.xlsx
```

---

## Data files (required for full setup)

These files are **not pushed to GitHub** (privacy/size). Place them in the **repo root** (`CRM/`):

| File | Used by | Purpose |
|------|---------|---------|
| `clients.json` | `seed_clients.py` | ~297 client records |
| `Lead_file.csv` | `seed_leads.py` | Lead import (20k+ rows) |
| `Final Master_Service_List.xlsx` | `seed_master_services.py` | ~134 services (sheet: **BlackPapers**) |
| `Master Employee Sheet.xlsx` | `seed_master_employees.py` | Staff logins and roles |

Without these files, the app still runs but contacts, products, staff, and leads will be empty or minimal.

---

## Setup guide (first time)

### Step 1 — Clone the repository

```powershell
git clone <your-repo-url>
cd CRM
```

### Step 2 — Create PostgreSQL database

```sql
CREATE DATABASE crm_db;
```

> All CRM tables live in `crm_db`, not the default `postgres` database.

### Step 3 — Backend setup

```powershell
cd crm_backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
copy .env.example .env
```

Edit `crm_backend/.env`:

```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/crm_db
JWT_SECRET=your-random-secret-key-change-this
FRONTEND_URL=http://localhost:3000

# Optional — needed for forgot-password and outbound email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your_email@gmail.com
SMTP_PASSWORD=your_gmail_app_password
SMTP_FROM=your_email@gmail.com
```

If the password contains `@`, URL-encode it (e.g. `Sahil@123` → `Sahil%40123`).

### Step 4 — Migrations

```powershell
alembic upgrade head
```

### Step 5 — Seed data (run in this order)

Place data files in the repo root first:

```powershell
python seed_permissions.py
python seed_company.py
python seed_master_employees.py
python seed_clients.py
python seed_master_services.py
python seed_leads.py
```

| Script | What it does |
|--------|----------------|
| `seed_permissions.py` | Permission codes + role matrix |
| `seed_company.py` | BlackPapers company profile |
| `seed_master_employees.py` | Staff users from Excel |
| `seed_clients.py` | Imports clients from `clients.json` |
| `seed_master_services.py` | Imports services from Excel |
| `seed_leads.py` | Imports leads from `Lead_file.csv` |

**Optional demo data (Level 2 testing):**

```powershell
python seed_demo_deals.py --reset
python seed_demo_level2.py --reset
python seed_demo_reminders.py --reset
```

**Optional dev test users** (skip if using the employee sheet):

```powershell
python seed_users.py
```

> After running `seed_permissions.py`, users who are already logged in should **log out and log back in** so new nav items (Follow-ups, Payments, Reports) appear.

### Step 6 — Frontend setup

```powershell
cd crm_frontend
npm install
```

---

## How to run (every day)

Two terminals — backend and frontend.

**Terminal 1 — Backend** (port 8000):

```powershell
cd crm_backend
.\venv\Scripts\Activate.ps1
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

**Terminal 2 — Frontend** (port 3000):

```powershell
cd crm_frontend
npm start
```

- App: **http://localhost:3000**
- API docs: **http://127.0.0.1:8000/docs**

---

## Login accounts

### Production staff (from Master Employee Sheet)

| Role | Email (example) | Password |
|------|-----------------|----------|
| Admin | `hr@blackpapers.in` | See Master Employee Sheet |
| Employee | `bgc.blackpapers01@gmail.com` | See Master Employee Sheet |

### Dev test users (only if you ran `seed_users.py`)

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@crm.com` | `admin123` |
| Manager | `manager@crm.com` | `manager123` |
| Employee | `employee@crm.com` | `employee123` |

### Login URLs

| Role | URL |
|------|-----|
| Admin | http://localhost:3000/admin-login |
| Manager | http://localhost:3000/manager-login |
| Employee | http://localhost:3000/employee-login |

---

## Role access (summary)

| Feature | Admin | Manager | Employee |
|---------|-------|---------|----------|
| Dashboard + KPIs | Yes | Yes | Yes |
| Contacts | Full | Full | View only |
| Products & services | Full | View | View |
| Leads & pipeline | Full | Full | Own records |
| Quotations, orders, invoices | Full | Full | Limited by permission |
| Follow-ups & payments | Yes | Yes | Yes |
| Sales reports (financial) | Yes | Yes | Own reports only |
| Client notes | Full | Full | Own notes |
| Company settings | Yes | No | No |
| User management | Yes | No | No |
| Activity logs | Yes | No | No |

---

## API overview

| Area | Base path |
|------|-----------|
| Auth | `/login`, `/logout`, `/users/me`, forgot/reset password |
| Admin | `/admin/users`, `/admin/activity-logs`, `/admin/company` |
| Contacts & products | `/contacts`, `/products` |
| Leads & deals | `/leads`, `/deals` |
| Sales documents | `/quotations`, `/sales-orders`, `/invoices` |
| Follow-ups | `/reminders` |
| Payments | `/payments` |
| Reports | `/sales-reports` |
| Dashboard KPIs | `/dashboard/kpis` |
| Client notes | `/client-notes` |

Full interactive docs: **http://127.0.0.1:8000/docs**

---

## Viewing data in PostgreSQL

```sql
SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;
SELECT COUNT(*) FROM contacts;
SELECT COUNT(*) FROM products;
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM leads;
SELECT COUNT(*) FROM deals;
```

Expected counts after full seed: **~297 contacts**, **~134 products**, **~11 users**, **20k+ leads** (if `Lead_file.csv` imported).

---

## Troubleshooting

### Database / connection errors

- PostgreSQL service is running.
- `DATABASE_URL` in `.env` is correct and points to `crm_db`.

### Login fails / `bcrypt` errors

- Use `bcrypt==4.2.0` as in `requirements.txt`.
- Re-run: `pip install -r requirements.txt`

### Frontend can’t reach API

- Backend must be running on `http://127.0.0.1:8000`.
- API URL is in `crm_frontend/src/utils/api.js`.

### New nav items missing after update

- Run `python seed_permissions.py`, then **log out and log back in**.

### Seed script: file not found

- Put data files in **repo root** (`CRM/`), not inside `crm_backend/`.

---

## Re-seeding / fresh database

```powershell
# In pgAdmin/psql: DROP DATABASE crm_db; CREATE DATABASE crm_db;

alembic upgrade head
python seed_permissions.py
python seed_company.py
python seed_master_employees.py
python seed_clients.py
python seed_master_services.py
python seed_leads.py
python seed_demo_deals.py --reset
python seed_demo_level2.py --reset
python seed_demo_reminders.py --reset
```

---

## What Git does and does not include

| Included in Git | Not in Git |
|-----------------|------------|
| Source code | `.env` (secrets) |
| Alembic migrations | `clients.json`, `Lead_file.csv`, Excel files |
| Seed scripts | Your actual PostgreSQL data |
| `.env.example` | `venv/`, `node_modules/` |

**Pulling the repo does not copy database rows.** Every teammate runs migrations + seeds locally.

---

## Quick checklist for new team members

- [ ] Python, Node, PostgreSQL installed
- [ ] Repo cloned
- [ ] Data files placed in repo root
- [ ] `crm_db` created
- [ ] `crm_backend/.env` configured
- [ ] `pip install -r requirements.txt`
- [ ] `alembic upgrade head`
- [ ] Seed scripts run successfully
- [ ] `npm install` in `crm_frontend`
- [ ] Backend + frontend running
- [ ] Login works at http://localhost:3000

If anything fails, check **Troubleshooting** above or share the exact error message with the team lead.
