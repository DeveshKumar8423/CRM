# BlackPapers CRM — Level 1 Core Foundation

A full-stack CRM for **BlackPapers** (Tributaries Unicorn LLP), built as an Odoo-style SaaS foundation for compliance, legal, and business services (India-first).

**Stack:** FastAPI + SQLAlchemy + PostgreSQL + Alembic (backend) · React (Create React App) frontend

---

## Level 1 — What’s implemented

| # | Module | Status |
|---|--------|--------|
| 1 | User Management | Done — staff accounts, profile, JWT auth |
| 2 | Company Management | Done — business profile, GSTIN/PAN, currency |
| 3 | Role & Permission System | Done — backend permissions on APIs |
| 4 | Contact Database | Done — CRUD, notes, activities, 297 clients |
| 5 | Product / Service Master | Done — service catalogue, pricing, categories |
| 6 | Basic Dashboard | Done — welcome + client KPIs (active/inactive %) |
| 7 | Activity Logs | Done — login/edit audit trail (Admin) |
| 8–10 | Notifications, File Upload, System Settings | Deferred to later levels |

---

## Prerequisites

Install these **before** cloning:

| Tool | Version | Purpose |
|------|---------|---------|
| **Python** | 3.10+ (3.11 recommended) | Backend API |
| **Node.js** | 18+ (LTS) | Frontend (`npm`) |
| **PostgreSQL** | 14+ (16 recommended) | Database |
| **Git** | Latest | Clone repo |

Optional but useful:

- **pgAdmin 4** — browse database tables and data
- **VS Code** or any editor

---

## Quick start: what to install and how to run

If you want the shortest setup to run both backend and frontend:

1. Install **Python 3.10+**, **Node.js 18+**, and **PostgreSQL 14+**.
2. Create database `crm_db` in PostgreSQL.
3. Run backend in terminal 1:

```bash
cd crm_backend
python -m venv venv
# Linux/macOS:
source venv/bin/activate
# Windows PowerShell:
# .\venv\Scripts\Activate.ps1
pip install -r requirements.txt
cp .env.example .env
alembic upgrade head
uvicorn main:app --reload
```

On Windows PowerShell, use `Copy-Item .env.example .env` instead of `cp`.
Then edit `crm_backend/.env`, for example:

```env
DATABASE_URL=postgresql://<db_user>:<db_password>@localhost:5432/crm_db
JWT_SECRET=replace-with-a-long-random-secret
```

4. Run frontend in terminal 2:

```bash
cd crm_frontend
npm install
npm start
```

Open **http://localhost:3000** (frontend) and **http://127.0.0.1:8000/docs** (backend API docs).

---

## Project structure

```
CRM/
├── crm_backend/          # FastAPI API, models, migrations, seeds
│   ├── alembic/          # Database migrations (creates tables)
│   ├── routers/          # API routes
│   ├── .env.example      # Copy to .env and edit
│   └── seed_*.py         # Data import scripts
├── crm_frontend/         # React UI
│   └── src/
├── clients.json          # NOT in Git — get from team lead
├── Final Master_Service_List.xlsx   # NOT in Git
└── Master Employee Sheet.xlsx       # NOT in Git
```

---

## Data files (required for full setup)

These files are **not pushed to GitHub** (privacy/size). Ask your team lead to share them (Google Drive, Slack, etc.) and place them in the **repo root** (`CRM/`):

| File | Used by | Purpose |
|------|---------|---------|
| `clients.json` | `seed_clients.py` | ~297 client records |
| `Final Master_Service_List.xlsx` | `seed_master_services.py` | ~134 services (sheet: **BlackPapers**) |
| `Master Employee Sheet.xlsx` | `seed_master_employees.py` | Staff logins and roles |

Without these files, the app still runs but contacts/products/staff will be empty or minimal.

---

## Setup guide (first time)

### Step 1 — Clone the repository

```powershell
git clone <your-repo-url>
cd CRM
```

### Step 2 — Install PostgreSQL and create the database

1. Install PostgreSQL and note your **postgres user password**.
2. Open **pgAdmin** or **psql** and run:

```sql
CREATE DATABASE crm_db;
```

> **Important:** All CRM tables live in `crm_db`, not the default `postgres` database.

### Step 3 — Backend setup

```powershell
cd crm_backend

# Create virtual environment
python -m venv venv

# Activate (Windows PowerShell)
.\venv\Scripts\Activate.ps1

# If activation is blocked, run once:
# Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

pip install -r requirements.txt
```

### Step 4 — Environment variables

```powershell
copy .env.example .env
```

Edit `crm_backend/.env`:

```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/crm_db
JWT_SECRET=your-random-secret-key-change-this
```

- Replace `YOUR_PASSWORD` with your PostgreSQL password.
- If the password contains `@`, URL-encode it (e.g. `Sahil@123` → `Sahil%40123`).

### Step 5 — Create database tables (migrations)

Still in `crm_backend` with venv activated:

```powershell
alembic upgrade head
```

This creates all tables (empty). It does **not** copy data from another machine — each developer runs this on their own PostgreSQL.

### Step 6 — Seed data (run in this order)

Place the three data files in the repo root first, then:

```powershell
python seed_permissions.py
python seed_company.py
python seed_master_employees.py
python seed_clients.py
python seed_master_services.py
```

| Script | What it does |
|--------|----------------|
| `seed_permissions.py` | Permission codes + role matrix (Admin/Manager/Employee) |
| `seed_company.py` | BlackPapers company profile + links staff to company |
| `seed_master_employees.py` | Staff users from Excel (emails/passwords from sheet) |
| `seed_clients.py` | Imports clients from `clients.json` (~70% active / ~30% inactive) |
| `seed_master_services.py` | Imports services from Excel |

Optional (dev test users only — skip if you use the employee sheet):

```powershell
python seed_users.py
```

Creates `admin@crm.com`, `manager@crm.com`, `employee@crm.com` with simple passwords.

### Step 7 — Frontend setup

Open a **new terminal**:

```powershell
cd crm_frontend
npm install
```

---

## How to run (every day)

You need **two terminals** — backend and frontend.

**Terminal 1 — Backend** (port 8000):

```powershell
cd crm_backend
.\venv\Scripts\Activate.ps1
uvicorn main:app --reload
```

**Terminal 2 — Frontend** (port 3000):

```powershell
cd crm_frontend
npm start
```

Open in browser: **http://localhost:3000**

API docs (Swagger): **http://127.0.0.1:8000/docs**

---

## Login accounts

### Production staff (from Master Employee Sheet)

After `seed_master_employees.py`, use the **email and password from the Excel sheet**.

Example (if seeded on your team’s sheet):

| Role | Email (example) | Password (from sheet) |
|------|-----------------|------------------------|
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
| Dashboard + client stats | Yes | Yes | Yes |
| Contacts (view/create/edit) | Yes | Yes | View only |
| Products & services | Full | View | View |
| Company settings | Yes | No | No |
| User management | Yes | No | No |
| Activity logs | Yes | No | No |

---

## Viewing data in PostgreSQL (pgAdmin)

1. Connect to server → open database **`crm_db`** (not `postgres`).
2. **Schemas → public → Tables** — you should see ~10 tables.
3. If the tree shows only 2 tables, right-click **Tables → Refresh**.
4. Right-click a table → **View/Edit Data → All Rows**.

Or run in Query Tool:

```sql
SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;
SELECT COUNT(*) FROM contacts;
SELECT COUNT(*) FROM products;
SELECT COUNT(*) FROM users;
```

Expected counts after full seed: **~297 contacts**, **~134 products**, **~11 users** (varies slightly).

---

## Troubleshooting

### `connection refused` / database error

- PostgreSQL service is running (Windows: Services → `postgresql-x64-16`).
- `DATABASE_URL` in `.env` matches your password and database name `crm_db`.
- Database `crm_db` exists.

### `alembic upgrade head` fails

- Run from `crm_backend` folder with venv activated.
- `.env` exists and `DATABASE_URL` is correct.

### Login fails / `bcrypt` errors

- Use `bcrypt==4.2.0` as in `requirements.txt` (bcrypt 5.x breaks passlib).
- Re-run: `pip install -r requirements.txt`

### Frontend can’t reach API

- Backend must be running on `http://127.0.0.1:8000`.
- API URL is set in `crm_frontend/src/utils/api.js` (default `http://127.0.0.1:8000`).

### Seed script: file not found

- Put `clients.json`, Excel files in **repo root** (`CRM/`), not inside `crm_backend/`.

### pgAdmin shows empty tables after seed

- Confirm seeds finished without errors.
- Confirm you’re viewing **`crm_db`**, not `postgres`.

### Re-import clients from scratch

```powershell
python seed_clients.py
```

Default behaviour replaces existing contacts for the company.

---

## Re-seeding / fresh database

To reset tables and start over:

```powershell
# Drop and recreate database in pgAdmin/psql:
# DROP DATABASE crm_db; CREATE DATABASE crm_db;

alembic upgrade head
python seed_permissions.py
python seed_company.py
python seed_master_employees.py
python seed_clients.py
python seed_master_services.py
```

---

## What Git does and does not include

| Included in Git | Not in Git (each machine / team share) |
|-----------------|----------------------------------------|
| Source code | `.env` (secrets) |
| Alembic migrations (table structure) | `clients.json`, Excel files |
| Seed scripts | Your actual PostgreSQL data |
| `.env.example` | `venv/`, `node_modules/` |

**Pulling the repo does not copy database rows.** Every teammate runs migrations + seeds on their own machine.

---

## API overview

| Area | Base path |
|------|-----------|
| Auth (login, profile) | `/login`, `/users/me`, … |
| Admin (users, activity logs) | `/admin/...` |
| Company | `/admin/company` |
| Contacts | `/contacts` |
| Products | `/products` |

Full interactive docs: **http://127.0.0.1:8000/docs** (with backend running).

---

## Next steps (Level 2+)

Planned later: leads, deals, tasks, invoicing, notifications, file uploads, system settings (numbering/templates).

---

## Quick checklist for new team members

- [ ] Python, Node, PostgreSQL installed
- [ ] Repo cloned
- [ ] Data files placed in repo root (from team lead)
- [ ] `crm_db` database created
- [ ] `crm_backend/.env` created from `.env.example`
- [ ] `pip install -r requirements.txt`
- [ ] `alembic upgrade head`
- [ ] All seed scripts run successfully
- [ ] `npm install` in `crm_frontend`
- [ ] Backend + frontend running
- [ ] Login works at http://localhost:3000

If anything fails, check **Troubleshooting** above or ask the team lead with the exact error message.
