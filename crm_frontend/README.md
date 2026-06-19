# BlackPapers CRM — Frontend

React (Create React App) UI for the BlackPapers CRM. Talks to the FastAPI backend at `http://127.0.0.1:8000` (configured in `src/utils/api.js`).

**Parent repo:** see [../README.md](../README.md) for full setup, database seeds, and backend instructions.

---

## Current build status

| Level | Status | Frontend coverage |
|-------|--------|-------------------|
| **Level 1** | ~70% done | Auth, profile, contacts, products, company settings, user management, activity logs, dashboards |
| **Level 2** | ~85% done | Leads, pipeline, quotations, orders, invoices, client notes, follow-ups, payments, sales reports |

### Level 1 pages

| Page | Route | Permission |
|------|-------|------------|
| Home / portal picker | `/` | Public |
| Admin / Manager / Employee login | `/admin-login`, `/manager-login`, `/employee-login` | Public |
| Forgot / reset password | `/forgot-password`, `/reset-password` | Public |
| Role dashboards | `/admin-dashboard`, `/manager-dashboard`, `/employee-dashboard` | By role |
| My Profile | `/profile` | All staff |
| Contacts (list, detail, form) | `/contacts`, `/contacts/:id`, `/contacts/new` | `contacts.view` |
| Products (list, detail, form) | `/products`, `/products/:id`, `/products/new` | `products.view` |
| Company Settings | `/admin/company` | `company.view` |
| User Management | `/admin/users` | `users.view` |
| Activity Logs | `/admin/activity-logs` | `activity.view` |

### Level 2 pages

| Page | Route | Permission |
|------|-------|------------|
| Leads (list, detail, form) | `/leads`, `/leads/:id`, `/leads/new` | `leads.view` |
| Sales Pipeline (kanban) | `/pipeline` | `deals.view` |
| Deals (list, detail, form) | `/deals`, `/deals/:id`, `/deals/new` | `deals.view` |
| Follow-ups queue | `/follow-ups` | `reminders.view` |
| Quotations | `/quotations`, `/quotations/:id`, approval queue, preview | `quotations.view` |
| Sales Orders | `/sales-orders`, `/sales-orders/:id` | `sales_orders.view` |
| Invoices | `/invoices`, `/invoices/:id`, review queue, preview | `invoices.view` |
| Payments | `/payments` | `payments.view` |
| Client Notes | `/client-notes`, `/client-notes/follow-ups` | `client_notes.view` |
| Sales Reports | `/sales-reports` | `reports.view` |

### Client-facing pages (no login)

| Page | Route |
|------|-------|
| View quotation | `/quote/:token` |
| View sales order | `/order/:token` |
| View invoice | `/invoice/:token` |

### Not built yet (frontend)

- WhatsApp / email send from CRM UI
- In-app notification centre
- File upload / document manager
- Advanced system settings UI

---

## Top navigation

The header nav in `DashboardLayout` shows links based on the logged-in user’s permissions. The **current section is highlighted** with a blue active state so you always know which module you’re in.

Typical nav order: Profile → Leads → Pipeline → Follow-ups → Quotations → Orders → Invoices → Payments → Notes → Reports → Contacts → Products → Company Settings → User Management → Activity Logs

Detail pages keep the parent section active (e.g. `/deals/12` highlights **Pipeline**).

---

## Key frontend folders

```
crm_frontend/src/
├── pages/              # Screen components (Leads, Pipeline, Payments, …)
├── components/         # Shared UI (DashboardLayout, SalesKpis, RemindersPanel, …)
├── utils/
│   ├── api.js          # API base URL, login, apiFetch
│   ├── permissions.js  # Permission checks for nav and routes
│   └── salesReports.js # Report tabs, CSV export helpers
├── App.js              # Routes and ProtectedRoute wrappers
└── crm.css             # Global CRM styles
```

---

## How to run

**Prerequisite:** backend must be running on port 8000 (see main README).

```powershell
cd crm_frontend
npm install
npm start
```

Open **http://localhost:3000**

### Production build

```powershell
npm run build
```

Output goes to `build/`. Serve with any static host (nginx, Vercel, etc.) and point API calls to your production backend URL in `src/utils/api.js`.

---

## Environment / API connection

The frontend reads the API URL from `src/utils/api.js`:

```js
export const API_URL = "http://127.0.0.1:8000";
```

Change this when deploying to a live server. JWT token and permissions are stored in `localStorage` after login.

---

## Auth & permissions

- `ProtectedRoute` in `App.js` checks role and required permission before rendering a page.
- `hasPermission()` in `utils/permissions.js` controls which nav links appear.
- After backend permission seeds change, users must **log out and log back in** to refresh their permission list.

---

## Dashboard widgets

Staff dashboards (`AdminDashboard`, `ManagerDashboard`, `EmployeeDashboard`) include:

- **SalesKpis** — pipeline value, open deals, pending quotes, overdue invoices, follow-ups due/overdue
- **Contact stats** — active vs inactive client counts

---

## Sales flow links

Detail pages link to the next step in the sales cycle:

```
Lead detail → create/view deal
Deal detail → create quotation
Quotation detail → create sales order
Sales order detail → create invoice
Invoice detail → payments / outstanding view
```

---

## Scripts (Create React App)

| Command | Purpose |
|---------|---------|
| `npm start` | Dev server on port 3000 |
| `npm run build` | Production build |
| `npm test` | Run tests (if configured) |

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Blank page after login | Check browser console; ensure backend is running |
| “Cannot reach the server” | Start backend: `uvicorn main:app --reload` |
| Missing nav items (Follow-ups, Payments) | Re-run `seed_permissions.py`, then log out and back in |
| CORS / network errors | Confirm `API_URL` matches backend host and port |

For database setup, seeds, and demo data, see the [main README](../README.md).
