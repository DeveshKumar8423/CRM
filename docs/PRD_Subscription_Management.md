# Product Requirements Document (PRD)
## Subscription Management (Level 9 CRM Module)

**Project:** BlackPapers CRM  
**Product Area:** Finance / Recurring Revenue / Customer Retention  
**Document Version:** v1.0  
**Date:** 2026-06-24  
**Status:** Draft for Product + Design Sign-off

---

## 1. Executive Summary

Subscription Management extends BlackPapers CRM with a **recurring revenue layer** so Indian SMEs can define **subscription plans**, enroll **customers on recurring billing**, send **renewal reminders**, generate **automatic invoices** each cycle, and process **cancellations and upgrades**—without spreadsheets, calendar reminders, or manual re-billing every month.

The module must integrate with existing **Contacts**, **Products**, **Invoices**, **Payments**, **Customer Ledger**, **Sales Orders**, **Quotations**, **Notifications**, **Field Service / AMC**, and **Activity Logs** so recurring revenue is visible alongside one-time sales and service operations.

Core promise from product scope:

> **Handle recurring plans, renewal reminders, auto invoices, cancellations, and upgrades.**

---

## 2. Problem Statement

Today, CRM supports one-time quotations, sales orders, and invoices—but there is no **subscription lifecycle system** for AMC contracts, SaaS-style plans, maintenance retainers, or monthly service fees. Renewals are tracked in Excel; invoices are recreated manually each period; upgrades and downgrades lack audit history; churn is invisible until payment stops.

Common issues this module should solve:

- No **plan catalog** for monthly / quarterly / annual recurring offerings
- **Customer subscriptions** are not linked to contacts with clear start, renewal, and end dates
- **Renewal reminders** are sent ad hoc with no dashboard of upcoming renewals
- **Recurring invoices** must be typed manually each billing period
- **Cancellations** are not recorded with reason, effective date, or MRR impact
- **Upgrades / downgrades** between plans lack proration or effective-date rules
- Finance cannot answer **MRR / ARR**, **churn**, or **renewals due this week**
- AMC and service contracts overlap with Field Service visits but **billing recurrence** is separate
- Payment follow-up for overdue subscription invoices is not grouped by subscriber
- No permission-controlled workflow for who can cancel or change plans

---

## 3. Goals and Non-Goals

### 3.1 Goals

1. Define **subscription plans** with billing interval, price, tax, and optional product link.
2. Create **customer subscriptions** tied to contacts with status and billing dates.
3. Track **subscription lifecycle**: trial → active → past_due → cancelled → expired.
4. Send **renewal reminders** before `next_billing_date` (in-app + optional email Phase 2).
5. **Auto-generate invoices** on billing date (draft or issued per settings).
6. Record **cancellations** with reason, effective date, and optional end-of-period.
7. Support **upgrades and downgrades** with new plan, effective date, and price change (Phase 1 manual; proration Phase 2).
8. Provide **subscription dashboard**: active count, MRR, renewals due, churn, overdue invoices.
9. Link generated invoices to **Invoices** module and **customer ledger**.
10. Enforce **role-based permissions** for plan edit, subscribe, cancel, upgrade.
11. Preserve **audit trail** on subscription create, renew, cancel, upgrade, and invoice generation.
12. Optional link to **Field Service AMC visits** or **Maintenance** contracts (Phase 2).

### 3.2 Non-Goals (This Phase)

1. Full **payment gateway subscription billing** (Razorpay Subscriptions, Stripe Billing) — Phase 3.
2. **Dunning** with automated card retry and smart retry logic — Phase 3.
3. **Usage-based / metered billing** (API calls, units consumed) — Phase 3.
4. **Customer self-service portal** for plan change and payment method — Phase 3.
5. Replacing **Invoice Generator** — subscriptions create invoices, do not duplicate full AP/AR.
6. **Double-entry GL** and deferred revenue schedules — Finance Phase 3.
7. **Multi-currency** subscription FX — Phase 2.
8. **Complex tiered pricing** (per-seat ladders, volume breaks) — Phase 2.
9. **Tax engine** beyond existing invoice GST rules.
10. **eCommerce cart subscriptions** — link only Phase 2; Store module stays separate.

---

## 4. Target Users and Roles

### 4.1 Primary Users (CRM Staff)

| User | Subscription need |
|------|-------------------|
| **Finance / billing** | Run billing run, review auto invoices, track overdue |
| **Account manager / sales** | Sell plan, create subscription, upgrade customer |
| **Admin / owner** | Enable module, define plans, renewal defaults |
| **Operations / AMC manager** | Align AMC contracts with recurring billing |

### 4.2 Secondary Users (CRM Staff)

| User | Subscription need |
|------|-------------------|
| **Accountant** | Review MRR, renewal pipeline, cancelled subs |
| **Support** | See active plan before assisting customer |
| **Leadership** | MRR, churn, renewal rate KPIs |

### 4.3 External (Phase 2+)

| User | Subscription need |
|------|-----------------|
| **Customer** | View plan, pay invoice, request cancel (portal Phase 3) |

---

## 5. Scope Overview

### 5.1 In Scope

| Capability | Description |
|------------|-------------|
| **Plan catalog** | Recurring plans with interval and price |
| **Customer subscriptions** | Contact enrolled on a plan |
| **Billing schedule** | Start, next bill, end dates |
| **Renewal reminders** | Alerts before billing date |
| **Auto invoices** | Generate invoice per billing cycle |
| **Cancellation** | End-of-period or immediate |
| **Upgrade / downgrade** | Change plan with audit |
| **Dashboard** | Active subs, MRR, due renewals |
| **Permissions** | `subscriptions.*` permission group |
| **Activity log** | Subscribe, renew, cancel, upgrade |

### 5.2 Out of Scope (Phase 1)

- Payment gateway auto-charge
- Usage metering
- Customer portal
- Deferred revenue accounting
- Per-seat quantity billing (flat plan price Phase 1)

---

## 6. Core Product Concept

Subscription Management adds a **plan and subscriber layer** on top of billing. Admins define **plans**; sales or finance **subscribe** a contact; the system tracks **next billing date**; **reminders** fire before renewal; on the billing date an **invoice is auto-created** from the plan lines; **cancellations and upgrades** update the subscription record and future billing.

Three primary surfaces:

1. **Subscriptions Dashboard** — MRR, renewals due, churn (`/subscriptions`).
2. **Plan catalog** — define and manage plans (`/subscriptions/plans`).
3. **Subscription detail** — billing history, cancel, upgrade (`/subscriptions/:id`).

### 6.1 Relationship to Existing CRM Modules

| Module | Role relative to Subscriptions |
|--------|-------------------------------|
| **Contacts** | Subscriber customer |
| **Products** | Optional plan line item / SKU link |
| **Invoices** | Auto-generated billing documents |
| **Payments** | Record payment against subscription invoice |
| **Customer Ledger** | Running balance per subscriber |
| **Quotations / Sales Orders** | Initial sale → subscription Phase 2 |
| **Notifications** | Renewal and overdue reminders |
| **Field Service** | AMC visit scheduling adjacent; billing here Phase 2 link |
| **Maintenance** | Equipment AMC contract billing alignment Phase 2 |
| **eCommerce** | Online subscription checkout Phase 3 |
| **Activity Logs** | Subscription audit |

### 6.2 Proposed Data Model (Phase 1)

**`subscription_settings`** (per company, 1:1)

| Field | Purpose |
|-------|---------|
| `company_id` | Tenant scope |
| `is_enabled` | Module on/off |
| `subscription_prefix` | e.g. SUB |
| `default_reminder_days` | e.g. 7, 3, 1 before billing |
| `auto_invoice_mode` | `draft` or `issue` |
| `auto_invoice_on_billing_date` | Boolean — cron/manual run generates |
| `grace_period_days` | Days after due before `past_due` |
| `notify_roles_json` | Roles for renewal / overdue alerts |
| `allow_immediate_cancel` | Boolean |

**`subscription_plans`**

| Field | Purpose |
|-------|---------|
| `id` | PK |
| `company_id` | Tenant |
| `plan_code` | e.g. AMC-GOLD |
| `name` | e.g. Annual AMC — Gold |
| `description` | |
| `billing_interval` | monthly, quarterly, yearly, custom_days |
| `interval_days` | For custom interval |
| `price` | Decimal — pre-tax or tax-inclusive flag |
| `currency` | INR default |
| `gst_rate` | e.g. 18 |
| `product_id` | FK products nullable |
| `trial_days` | Integer default 0 |
| `status` | active, archived |
| `sort_order` | |
| `created_at`, `updated_at` | |

**`subscriptions`**

| Field | Purpose |
|-------|---------|
| `id` | PK |
| `company_id` | Tenant |
| `subscription_number` | SUB-2026-0042 |
| `contact_id` | FK |
| `plan_id` | FK |
| `status` | trialing, active, past_due, cancelled, expired |
| `quantity` | Integer default 1 Phase 1 |
| `unit_price` | Override plan price nullable |
| `start_date` | Date |
| `trial_end_date` | Date nullable |
| `current_period_start` | Date |
| `current_period_end` | Date |
| `next_billing_date` | Date |
| `cancel_at_period_end` | Boolean |
| `cancelled_at` | DateTime nullable |
| `cancellation_reason` | Text nullable |
| `ended_at` | DateTime nullable |
| `sales_order_id` | FK nullable Phase 2 |
| `quotation_id` | FK nullable Phase 2 |
| `notes` | |
| `created_by_id` | |
| `created_at`, `updated_at` | |

**`subscription_invoices`** (link table)

| Field | Purpose |
|-------|---------|
| `id` | PK |
| `subscription_id` | FK |
| `invoice_id` | FK |
| `billing_period_start` | Date |
| `billing_period_end` | Date |
| `generated_at` | DateTime |

**`subscription_plan_changes`** (upgrades / downgrades)

| Field | Purpose |
|-------|---------|
| `id` | PK |
| `subscription_id` | FK |
| `from_plan_id` | FK |
| `to_plan_id` | FK |
| `effective_date` | Date |
| `change_type` | upgrade, downgrade, same_tier |
| `notes` | |
| `created_by_id` | |
| `created_at` | |

---

## 7. Subscription Plans

### 7.1 Plan Pages

| Route | Purpose |
|-------|---------|
| `/subscriptions/plans` | Plan list |
| `/subscriptions/plans/new` | Create plan |
| `/subscriptions/plans/:id/edit` | Edit plan |

### 7.2 Billing Intervals (Phase 1)

| Interval | Meaning |
|----------|---------|
| `monthly` | Bill every 30/ calendar month |
| `quarterly` | Every 3 months |
| `yearly` | Annual |
| `custom_days` | Use `interval_days` |

### 7.3 Plan Rules

- Archived plans cannot accept **new** subscriptions; existing subs continue until migrated.
- `plan_code` unique per company.
- Price changes on plan do not retroactively change active subs unless admin runs bulk update (Phase 2).

---

## 8. Customer Subscriptions

### 8.1 Subscription Pages

| Route | Purpose |
|-------|---------|
| `/subscriptions` | Dashboard |
| `/subscriptions/list` | All subscriptions |
| `/subscriptions/new` | Subscribe contact to plan |
| `/subscriptions/:id` | Detail, invoices, cancel, upgrade |

### 8.2 Subscription Statuses

| Status | Meaning |
|--------|---------|
| `trialing` | In trial period |
| `active` | Billing normally |
| `past_due` | Invoice overdue past grace |
| `cancelled` | Cancelled; may run until period end |
| `expired` | Ended; no further billing |

### 8.3 Subscription Lifecycle

```
(new) → trialing → active → past_due → active (on payment)
                    ↓           ↓
              cancelled → expired
```

### 8.4 Subscribe Flow (Phase 1)

```
Select contact + plan
  → Set start date (and trial if any)
  → Calculate current_period_end, next_billing_date
  → Status active or trialing
  → Activity log: subscription_created
  → Optional: generate first invoice immediately if not in trial
```

---

## 9. Renewal Reminders

### 9.1 Reminder Rules (Phase 1)

- On dashboard load or daily job: find subs where `next_billing_date` ∈ today + `default_reminder_days`.
- Send in-app notification to `notify_roles_json` and assignee if any.
- Email to customer Phase 2.

### 9.2 Alert Types

| Type | Trigger |
|------|---------|
| `renewal_upcoming` | `next_billing_date` within reminder window |
| `renewal_today` | `next_billing_date` = today |
| `subscription_past_due` | Invoice unpaid past grace |
| `cancel_at_period_end` | Sub flagged cancel; period ending in 7d |

---

## 10. Auto Invoices

### 10.1 Billing Run (Phase 1)

Manual **Run billing** action on dashboard (cron Phase 2):

```
For each active subscription where next_billing_date <= today
  → Create invoice from plan (contact, line, GST)
  → Link subscription_invoices row
  → Advance next_billing_date by interval
  → Update current_period_start/end
  → Activity log: subscription_invoice_generated
```

### 10.2 Invoice Content

- Line: plan name, quantity, unit price, GST per existing invoice rules.
- Reference: `subscription_number`, billing period on notes.
- Status: `draft` or `issued` per `auto_invoice_mode`.

### 10.3 Payment Linkage

- Recording payment on linked invoice via existing **Payments** flow.
- On full payment: if `past_due`, return to `active`.

---

## 11. Cancellations

### 11.1 Cancel Flow

```
User opens subscription → Cancel
  → Choose: end of current period OR immediate
  → Reason (optional)
  → cancel_at_period_end = true OR status cancelled + ended_at
  → No further auto invoices after effective end
  → Activity log: subscription_cancelled
```

### 11.2 Cancel Rules

- Immediate cancel sets `ended_at` and stops next billing.
- End-of-period sets flag; status stays `active` until `current_period_end`, then `expired`.
- Cannot cancel already `expired` subscription.

---

## 12. Upgrades and Downgrades

### 12.1 Change Plan Flow (Phase 1)

```
User selects new plan + effective date (today or next period)
  → Record subscription_plan_changes row
  → Update plan_id, unit_price if needed
  → Recalculate next_billing_date if interval changes
  → Activity log: subscription_plan_changed
```

### 12.2 Phase 2 Enhancements

- Proration credit/charge invoice line
- Seat quantity changes
- Scheduled downgrade at period end

---

## 13. Subscription Dashboard & KPIs

### 13.1 Phase 1 KPIs

- Active subscriptions count
- **MRR** (monthly normalized from all active plan prices)
- Renewals due (7d / 30d)
- Past due count
- Cancelled this month
- New subscriptions this month

### 13.2 Phase 1 Lists

- Renewals due this week
- Past due subscriptions
- Recently cancelled
- Recent billing run results

---

## 14. Information Architecture and Navigation

### 14.1 CRM Sidebar (Staff)

| Route | Purpose |
|-------|---------|
| `/subscriptions` | Dashboard |
| `/subscriptions/list` | Subscription list |
| `/subscriptions/plans` | Plan catalog |
| `/subscriptions/settings` | Module settings |

Sidebar label: **Subscriptions** (requires `subscriptions.view`).  
Grouped under **Finance** or **Sales** (product default: **Finance**).

### 14.2 Entry Points

- App launcher: **Subscriptions** tile
- Contact detail: “New subscription” (Phase 2)
- Invoice detail: link to source subscription (Phase 2)
- Notifications: renewal alert → subscription detail

---

## 15. Detailed Functional Requirements

### 15.1 Dashboard

- KPI cards: active, MRR, renewals due, past due, new/cancelled MTD
- **Run billing** button (permission-gated)
- Tables: renewals due, past due, recent invoices from subs

### 15.2 Plan List / Form

- CRUD plans; archive; interval and GST fields

### 15.3 Subscription List

- Filters: status, plan, contact, renewal date range
- Columns: SUB #, contact, plan, status, next billing, MRR contrib

### 15.4 Subscription Detail

- Header: contact, plan, status, dates
- Tabs: Overview, Invoices, History (plan changes)
- Actions: Cancel, Change plan, Record payment (link to invoice)

### 15.5 Settings

- Enable module, prefix, reminder days, auto invoice mode, grace period, notify roles

### 15.6 Permissions

| Permission | Capability |
|------------|------------|
| `subscriptions.view` | View dashboard, plans, subscriptions |
| `subscriptions.manage_plans` | Create/edit/archive plans |
| `subscriptions.create` | Create new subscriptions |
| `subscriptions.bill` | Run billing, generate renewal invoices |
| `subscriptions.cancel` | Cancel subscriptions |
| `subscriptions.change_plan` | Upgrade/downgrade |
| `subscriptions.manage_settings` | Module configuration |

**Default matrix:**

| Role | view | manage_plans | create | bill | cancel | change_plan | manage_settings |
|------|------|--------------|--------|------|--------|-------------|-----------------|
| Admin | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Manager | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | — |
| Sales | ✓ | — | ✓ | — | — | ✓ | — |
| Accountant | ✓ | — | — | ✓ | — | — | — |
| Employee | ✓ | — | — | — | — | — | — |

---

## 16. Validation and Business Rules

1. Module must be `is_enabled` for subscription routes.
2. Cannot subscribe contact to archived plan.
3. `next_billing_date` must be ≥ `start_date`.
4. Billing run skips subscriptions with `cancel_at_period_end` past `current_period_end`.
5. One billing run does not double-invoice same period (unique `subscription_invoices` period key).
6. Cancelled immediate: no billing run inclusion.
7. `subscription_number` unique per company.
8. All queries scoped by `company_id`.
9. MRR calculation normalizes yearly plans to monthly (price / 12).
10. GST on auto invoice follows plan `gst_rate` and company tax settings.

---

## 17. Integration Points

### 17.1 API Endpoints (Proposed)

**Settings & plans**

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET/PUT | `/subscriptions/settings` | Settings |
| GET/POST | `/subscriptions/plans` | List / create plans |
| GET/PUT | `/subscriptions/plans/{id}` | Plan detail / update |

**Subscriptions**

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/subscriptions/dashboard` | KPIs |
| GET/POST | `/subscriptions` | List / create subscription |
| GET | `/subscriptions/{id}` | Detail |
| POST | `/subscriptions/{id}/cancel` | Cancel |
| POST | `/subscriptions/{id}/change-plan` | Upgrade/downgrade |
| POST | `/subscriptions/run-billing` | Manual billing run |
| GET | `/subscriptions/{id}/invoices` | Linked invoices |

### 17.2 Implementation Alignment

**Builds on (existing)**

- `contacts`, `products`, `invoices`, `payments`
- `permissions_data.py`, `activity.py`, `notifications`
- Invoice creation helpers from `invoices_router` or shared service

**New (greenfield)**

- Tables in §6.2
- `subscriptions_router.py`, `subscriptions_config.py`, `subscriptions_schemas.py`
- `services/subscription_service.py` — billing run, MRR, reminders
- Frontend: `SubscriptionsDashboard.jsx`, `SubscriptionPlans.jsx`, `SubscriptionList.jsx`, `SubscriptionDetail.jsx`, `SubscriptionForm.jsx`, `SubscriptionSettings.jsx`

---

## 18. Reporting and Insights

### Phase 1

- Dashboard MRR and active count
- Renewals due list
- Churn count (cancelled MTD)

### Phase 2

- ARR, net revenue retention
- Plan mix breakdown
- Cohort renewal rate
- Revenue by plan CSV export

### Phase 3

- Gateway reconciliation
- Deferred revenue schedule export

---

## 19. Release Phasing

### Phase 1 (MVP)

- Subscription settings and plan catalog
- Create subscription for contact
- Renewal reminders (in-app)
- Manual billing run → auto invoice (draft/issue)
- Cancel (immediate + end of period)
- Upgrade/downgrade with audit row
- Dashboard KPIs and lists
- Permissions and activity logs

### Phase 2

- Contact detail entry point
- Email renewal reminders
- Scheduled billing cron job
- Proration on plan change
- Link from sales order / quotation
- Field Service AMC billing link
- Per-seat quantity

### Phase 3

- Razorpay / Stripe subscription sync
- Customer self-service portal
- Usage-based billing
- eCommerce subscription checkout

---

## 20. UAT Acceptance Checklist

1. Admin can enable Subscriptions in settings.
2. Admin can create plan with monthly/yearly interval and price.
3. User can subscribe a contact; status `active` with `next_billing_date` set.
4. Dashboard shows renewal due within reminder window and sends alert.
5. Billing run creates invoice linked to subscription; `next_billing_date` advances.
6. User can cancel at period end; no invoice after period end.
7. User can upgrade plan; `subscription_plan_changes` recorded.
8. Past due status when linked invoice unpaid past grace.
9. User without `subscriptions.bill` cannot run billing.
10. Cross-company subscription access blocked.
11. Activity log records subscribe, bill, cancel, and plan change.

---

## 21. Open Product Questions

1. **Trial** subscriptions generate zero first invoice or skip first period?
2. **Tax-inclusive** vs exclusive plan pricing default for India GST?
3. Auto-**issue** invoice vs **draft** for accountant review default?
4. Link plan to **Product** required or optional catalog?
5. **Pro-rata** on mid-cycle upgrade Phase 1 or Phase 2 only?
6. Single subscription per contact per plan, or allow duplicates?
7. Integrate **Maintenance AMC** as subscription type flag?
8. Billing run **timezone** — company local midnight IST?
9. **Credit note** on early cancel Phase 2?
10. Plan limits on free SaaS tier?

---

## Appendix A: Example Subscription Journey

1. Admin creates plan **AMC Gold — Yearly** ₹24,000 + GST, billed yearly.
2. Sales subscribes **Acme Traders** starting 1 Apr 2026; `next_billing_date` = 1 Apr 2027.
3. Dashboard shows renewal due in 7 days on 25 Mar 2027; finance gets alert.
4. On 1 Apr 2027, finance runs **Billing** → invoice **INV-2027-0088** draft created and linked.
5. Accountant issues invoice; customer pays via UPI; subscription stays `active`.
6. In May, customer upgrades to **AMC Platinum**; change recorded effective 1 Jun 2027.
7. Customer cancels end-of-period Dec 2027; no invoice in 2028; status `expired`.

---

## Appendix B: Subscription Status Timeline

```
trialing → active ⇄ past_due
              ↓
         cancelled → expired
```

---

## Appendix C: Starter Permissions Seed

```python
SUBSCRIPTION_PERMISSIONS = [
    ("subscriptions.view", "View subscriptions dashboard, plans, and subscribers"),
    ("subscriptions.manage_plans", "Create and edit subscription plans"),
    ("subscriptions.create", "Create customer subscriptions"),
    ("subscriptions.bill", "Run billing and generate renewal invoices"),
    ("subscriptions.cancel", "Cancel customer subscriptions"),
    ("subscriptions.change_plan", "Upgrade or downgrade subscriptions"),
    ("subscriptions.manage_settings", "Configure subscription module settings"),
]
```

---

## Appendix D: Alignment with Product Roadmap

| Roadmap item | Subscription contribution |
|--------------|---------------------------|
| Invoices | Auto recurring billing documents |
| Contacts | Subscriber identity |
| Customer Ledger | Balance per subscriber |
| Field Service | AMC visit + recurring fee alignment Phase 2 |
| eCommerce | Online subscription Phase 3 |
| Multi-tenant SaaS | Platform billing layer Phase 3 (`MULTI_TENANT_ROADMAP`) |

---

## Appendix E: Relationship to Adjacent Modules

| Module | Subscriptions vs |
|--------|------------------|
| **Invoices** | One-time bill vs recurring generator |
| **Sales Orders** | Order fulfillment vs ongoing entitlement |
| **Field Service AMC** | Site visit scheduling vs recurring AMC **fee** |
| **Maintenance CMMS** | Internal asset PM vs customer **contract** billing |
| **Expenses** | Vendor software_subscriptions category is **outbound** cost; this module is **inbound** revenue |

Subscriptions handle **recurring customer revenue**; Field Service and Maintenance handle **service delivery**—link in Phase 2 when AMC fee and visit schedule should stay in sync.

---

*End of PRD — Subscription Management v1.0*
