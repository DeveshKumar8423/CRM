# Product Requirements Document (PRD)
## Rental Management (Level 10 CRM Module)

**Project:** BlackPapers CRM  
**Product Area:** Operations / Asset Utilization / Time-Bound Revenue  
**Document Version:** v1.0  
**Date:** 2026-06-24  
**Status:** Draft for Product + Design Sign-off

---

## 1. Executive Summary

Rental Management extends BlackPapers CRM with a **time-bound asset rental layer** so Indian SMEs can catalog **rentable assets**, manage **booking calendars**, create **rental contracts**, collect and settle **security deposits**, schedule **delivery**, and process **returns**—without double-booking equipment in spreadsheets, losing track of deposits, or missing overdue pickups.

The module must integrate with existing **Contacts**, **Products**, **Quotations**, **Sales Orders**, **Invoices**, **Payments**, **Customer Ledger**, **Field Service**, **Inventory**, **Notifications**, and **Activity Logs** so rental revenue and asset utilization are visible alongside one-time sales, subscriptions, and field operations.

Core promise from product scope:

> **Manage rentable assets, booking calendars, contracts, deposits, delivery, and returns.**

---

## 2. Problem Statement

Today, CRM supports sales documents, inventory, internal maintenance, and subscriptions—but there is no **rental operations system** for businesses that lend equipment, furniture, AV gear, generators, scaffolding, or IT hardware for fixed periods. Availability is tracked in whiteboards; contracts are Word files; deposits sit in a separate ledger; delivery and return dates are coordinated on phone calls.

Common issues this module should solve:

- No **rentable asset catalog** with daily / weekly / monthly rates and availability status
- **Double bookings** when two customers reserve the same unit for overlapping dates
- **Booking calendar** is absent—staff cannot see what is out, due back, or free this week
- **Rental contracts** are not linked to contacts with clear start, end, and extension rules
- **Security deposits** are collected but not tracked against contract close-out and damage deductions
- **Delivery** and **return pickup** lack scheduled dates, addresses, and status workflow
- **Late returns** and **damage charges** are handled ad hoc without invoice linkage
- Finance cannot answer **utilization rate**, **revenue on rent**, or **deposits held**
- Field teams do not know which jobs are **out for delivery** vs **due for pickup**
- No permission-controlled workflow for who can confirm bookings, dispatch, or refund deposits

---

## 3. Goals and Non-Goals

### 3.1 Goals

1. Maintain a **rentable asset catalog** with rates, quantity, and availability status.
2. Create **rental contracts** tied to contacts with rental period, lines, and totals.
3. Provide a **booking calendar** showing asset availability and confirmed rentals.
4. Prevent **overlapping bookings** for the same asset unit (or quantity) in Phase 1.
5. Collect and track **security deposits**: received, held, deducted, refunded.
6. Manage **delivery** scheduling and status: pending → dispatched → delivered.
7. Manage **return** workflow: due → picked up → inspected → closed.
8. Generate **rental invoices** for contract period (draft or issued per settings).
9. Apply **late fees** and **damage deductions** on return (manual Phase 1).
10. Provide **rental dashboard**: assets on rent, due back, deposits held, revenue MTD.
11. Send **reminders** for deliveries due, returns overdue, and deposit settlement (in-app Phase 1).
12. Enforce **role-based permissions** for asset edit, book, dispatch, return, deposit refund.
13. Preserve **audit trail** on contract create, confirm, deliver, return, deposit events.
14. Optional link to **Field Service** for delivery visits and **Quotations** for quote-to-rent (Phase 2).

### 3.2 Non-Goals (This Phase)

1. Full **marketplace / peer-to-peer rental** platform (Airbnb-style).
2. **Real-time GPS** tracking of rented assets on map.
3. **IoT telematics** (engine hours, fuel level auto-billing) — Phase 3.
4. **Customer self-service portal** for online booking and payment — Phase 3.
5. **Dynamic pricing** / yield management engine — Phase 3.
6. Replacing **Maintenance / CMMS** for owned fleet servicing—rental assets may link to maintenance history Phase 2 only.
7. Replacing **Inventory** as full multi-location stock system—rental tracks **rentable units**, not every warehouse SKU.
8. **Multi-currency** rental FX — Phase 2.
9. **Complex tiered pricing** (volume breaks, seasonal ladders) — Phase 2.
10. **Insurance claims** workflow and third-party damage assessment — Phase 3.

---

## 4. Target Users and Roles

### 4.1 Primary Users (CRM Staff)

| User | Rental need |
|------|-------------|
| **Rental coordinator / sales** | Create booking, check calendar, confirm contract |
| **Warehouse / yard manager** | Mark delivery dispatched, receive returns, inspect condition |
| **Finance / billing** | Invoice rental period, record deposit, settle on return |
| **Dispatcher / logistics** | Schedule delivery and pickup routes |
| **Admin / owner** | Enable module, rate defaults, deposit rules, numbering |

### 4.2 Secondary Users (CRM Staff)

| User | Rental need |
|------|-------------|
| **Account manager** | View customer rental history before upsell |
| **Field technician** | Execute delivery or pickup visit (Field Service link Phase 2) |
| **Accountant** | Deposits held, rental revenue, overdue returns |
| **Leadership** | Utilization %, revenue on rent, overdue asset count |

### 4.3 External (Phase 2+)

| User | Rental need |
|------|-------------|
| **Customer** | View contract, pay deposit, request extension (portal Phase 3) |

---

## 5. Scope Overview

### 5.1 In Scope

| Capability | Description |
|------------|-------------|
| **Rentable asset catalog** | Items with rates, qty, status |
| **Rental contracts** | Contact booking with lines and dates |
| **Booking calendar** | Week / month view of availability |
| **Conflict check** | Block overlapping bookings |
| **Deposits** | Collect, hold, deduct, refund |
| **Delivery** | Schedule and status on contract |
| **Returns** | Due date, pickup, condition, close-out |
| **Invoicing** | Rental period invoice link |
| **Dashboard** | On rent, due back, deposits |
| **Permissions** | `rental.*` permission group |
| **Activity log** | Book, deliver, return, deposit |

### 5.2 Out of Scope (Phase 1)

- Online customer booking portal
- Automated telematics billing
- Per-serial-number unit tracking (quantity-level Phase 1)
- Route optimization for delivery fleet
- Insurance policy integration

---

## 6. Core Product Concept

Rental Management adds an **asset availability and contract layer** on top of CRM. Admins define **rentable assets** with rates; sales creates a **rental contract** for a contact and date range; the **calendar** shows conflicts; on confirm the asset is reserved; **deposit** is recorded; **delivery** moves assets to the customer site; on **return** condition is logged, late/damage charges applied, deposit settled, and contract closed.

Three primary surfaces:

1. **Rental Dashboard** — on rent, due back, deposits held (`/rental`).
2. **Booking calendar** — availability and confirmed contracts (`/rental/calendar`).
3. **Contract detail** — lines, deposit, delivery, return, invoice (`/rental/contracts/:id`).

### 6.1 Relationship to Existing CRM Modules

| Module | Role relative to Rental |
|--------|------------------------|
| **Contacts** | Renter customer |
| **Products** | Optional catalog link for rentable SKU |
| **Quotations** | Quote rental lines → contract Phase 2 |
| **Sales Orders** | Fulfillment link Phase 2 |
| **Invoices** | Rental period and damage charge bills |
| **Payments** | Deposit receipt and rental payment |
| **Customer Ledger** | Balance per renter |
| **Field Service** | Delivery / pickup site visit Phase 2 |
| **Inventory** | Physical stock count alignment Phase 2 |
| **Maintenance** | Owned fleet repair downtime blocks availability Phase 2 |
| **Subscriptions** | Long-term lease vs short rental—separate modules |
| **Notifications** | Delivery, return overdue, deposit alerts |
| **Activity Logs** | Rental audit |

### 6.2 Proposed Data Model (Phase 1)

**`rental_settings`** (per company, 1:1)

| Field | Purpose |
|-------|---------|
| `company_id` | Tenant scope |
| `is_enabled` | Module on/off |
| `contract_prefix` | e.g. RNT |
| `default_rate_basis` | daily, weekly, monthly |
| `default_deposit_percent` | e.g. 20 of rental total |
| `late_fee_per_day` | Flat late fee default |
| `grace_hours_after_due` | Before late fee applies |
| `auto_invoice_mode` | `draft` or `issue` on contract confirm |
| `require_deposit_before_delivery` | Boolean |
| `notify_roles_json` | Roles for delivery / return alerts |
| `allow_overbook` | Boolean — admin override only |

**`rental_assets`**

| Field | Purpose |
|-------|---------|
| `id` | PK |
| `company_id` | Tenant |
| `asset_code` | e.g. GEN-5KVA-01 |
| `name` | e.g. 5 KVA Diesel Generator |
| `description` | |
| `category` | generator, furniture, it, construction, av, other |
| `product_id` | FK products nullable |
| `quantity_available` | Integer — rentable units Phase 1 |
| `rate_daily` | Decimal nullable |
| `rate_weekly` | Decimal nullable |
| `rate_monthly` | Decimal nullable |
| `gst_rate` | e.g. 18 |
| `deposit_amount` | Fixed deposit override nullable |
| `status` | active, maintenance, retired |
| `location_notes` | Yard / warehouse bay |
| `sort_order` | |
| `created_at`, `updated_at` | |

**`rental_contracts`**

| Field | Purpose |
|-------|---------|
| `id` | PK |
| `company_id` | Tenant |
| `contract_number` | RNT-2026-0042 |
| `contact_id` | FK |
| `status` | draft, confirmed, delivered, on_rent, return_scheduled, returned, closed, cancelled |
| `rate_basis` | daily, weekly, monthly |
| `rental_start` | DateTime — planned start |
| `rental_end` | DateTime — planned end |
| `actual_return_at` | DateTime nullable |
| `delivery_address` | Text |
| `delivery_contact_name` | |
| `delivery_contact_phone` | |
| `delivery_scheduled_at` | DateTime nullable |
| `delivery_completed_at` | DateTime nullable |
| `return_scheduled_at` | DateTime nullable |
| `return_completed_at` | DateTime nullable |
| `subtotal` | Decimal |
| `deposit_required` | Decimal |
| `deposit_received` | Decimal default 0 |
| `deposit_refunded` | Decimal default 0 |
| `deposit_deducted` | Decimal default 0 |
| `late_fee_total` | Decimal default 0 |
| `damage_charge_total` | Decimal default 0 |
| `grand_total` | Decimal |
| `notes` | |
| `cancellation_reason` | Text nullable |
| `quotation_id` | FK nullable Phase 2 |
| `sales_order_id` | FK nullable Phase 2 |
| `created_by_id` | |
| `created_at`, `updated_at` | |

**`rental_contract_lines`**

| Field | Purpose |
|-------|---------|
| `id` | PK |
| `contract_id` | FK |
| `rental_asset_id` | FK |
| `quantity` | Integer |
| `rate_basis` | daily, weekly, monthly |
| `unit_rate` | Decimal — snapshot at booking |
| `line_days` | Integer — computed rental days |
| `line_subtotal` | Decimal |
| `gst_rate` | Decimal |
| `line_total` | Decimal |
| `return_condition` | good, fair, damaged nullable |
| `damage_notes` | Text nullable |

**`rental_deposits`** (ledger of deposit movements)

| Field | Purpose |
|-------|---------|
| `id` | PK |
| `contract_id` | FK |
| `type` | received, refund, deduction |
| `amount` | Decimal |
| `payment_method` | cash, upi, bank, cheque, other |
| `reference` | UPI ref / cheque no |
| `notes` | |
| `recorded_by_id` | FK |
| `recorded_at` | DateTime |

**`rental_invoices`** (link table)

| Field | Purpose |
|-------|---------|
| `id` | PK |
| `contract_id` | FK |
| `invoice_id` | FK |
| `invoice_type` | rental, damage, late_fee |
| `generated_at` | DateTime |

---

## 7. Rentable Assets

### 7.1 Asset Pages

| Route | Purpose |
|-------|---------|
| `/rental/assets` | Asset list |
| `/rental/assets/new` | Register rentable asset |
| `/rental/assets/:id` | Asset detail, booking history |

### 7.2 Asset Statuses

| Status | Meaning |
|--------|---------|
| `active` | Available for booking |
| `maintenance` | Temporarily unavailable (repair) |
| `retired` | No new bookings |

### 7.3 Asset Rules

- `asset_code` unique per company.
- Retired assets cannot be added to new contracts.
- Maintenance status blocks new overlapping bookings.
- At least one of `rate_daily`, `rate_weekly`, `rate_monthly` required.
- Quantity-based availability: booking consumes `quantity` from `quantity_available` for the date range.

---

## 8. Rental Contracts

### 8.1 Contract Pages

| Route | Purpose |
|-------|---------|
| `/rental` | Dashboard |
| `/rental/calendar` | Booking calendar |
| `/rental/contracts` | Contract list |
| `/rental/contracts/new` | New rental booking |
| `/rental/contracts/:id` | Detail, deposit, delivery, return |

### 8.2 Contract Statuses

| Status | Meaning |
|--------|---------|
| `draft` | Being prepared; not reserved |
| `confirmed` | Reserved; deposit may be pending |
| `delivered` | Assets handed to customer |
| `on_rent` | Active rental period |
| `return_scheduled` | Pickup scheduled |
| `returned` | Assets received; inspection pending |
| `closed` | Invoiced, deposit settled |
| `cancelled` | Voided before or during rental |

### 8.3 Contract Lifecycle

```
draft → confirmed → delivered → on_rent → return_scheduled → returned → closed
  ↓         ↓
cancelled  cancelled (before delivery)
```

### 8.4 Booking Flow (Phase 1)

```
Select contact + rental period + assets/lines
  → Compute line totals from rate_basis and duration
  → Compute deposit_required (settings % or asset fixed)
  → Conflict check on calendar
  → Status draft
  → Confirm → status confirmed, assets reserved on calendar
  → Activity log: rental_contract_confirmed
  → Optional: generate rental invoice (draft/issue)
```

---

## 9. Booking Calendar

### 9.1 Calendar Views (Phase 1)

| View | Purpose |
|------|---------|
| **Week** | Deliveries, on-rent, returns due |
| **Month** | Density of bookings per asset |
| **Asset row** | Gantt-style row per rentable asset |

### 9.2 Conflict Rules (Phase 1)

- For each `rental_asset_id` + date range: sum of `quantity` on confirmed+ contracts must not exceed `quantity_available`.
- Draft contracts do not block availability.
- Cancelled contracts release availability immediately.
- Admin with `rental.confirm` and `allow_overbook` may override with audit note (Phase 2); Phase 1 hard block.

### 9.3 Calendar Entry Points

- Dashboard → **View calendar**
- Asset detail → **See bookings**
- New contract → inline availability hint when dates selected

---

## 10. Security Deposits

### 10.1 Deposit Flow (Phase 1)

```
On confirm: deposit_required calculated
  → Record deposit received (rental_deposits type=received)
  → Update contract.deposit_received
  → If require_deposit_before_delivery: block delivery until deposit_received >= deposit_required
On return close-out:
  → Apply damage_charge_total, late_fee_total
  → deduction entries on deposit
  → Refund balance (type=refund) via Payments or manual record
  → Activity log: rental_deposit_settled
```

### 10.2 Deposit Methods (Phase 1)

| Method | Notes |
|--------|-------|
| Cash | Manual receipt |
| UPI | Reference number |
| Bank transfer | NEFT/IMPS ref |
| Cheque | Cheque number |

### 10.3 Deposit Rules

- `deposit_received` = sum of `received` minus refunds/deductions tracked in ledger.
- Cannot refund more than remaining held deposit.
- Damage deductions require `return_condition` = damaged on at least one line.

---

## 11. Delivery

### 11.1 Delivery Flow (Phase 1)

```
Contract confirmed
  → Set delivery_address, delivery_scheduled_at
  → Status transition: confirmed → delivered (manual dispatch action)
  → Record delivery_completed_at
  → Status → on_rent when rental_start reached (or immediately if start ≤ now)
  → Activity log: rental_delivered
```

### 11.2 Delivery Rules

- Delivery address required before dispatch.
- If `require_deposit_before_delivery`: deposit must be fully received.
- Partial line delivery not supported Phase 1—all lines delivered together.

### 11.3 Phase 2: Field Service Link

- Create **Field Service order** type `delivery` from contract.
- Technician marks on-site handoff; sync `delivery_completed_at`.

---

## 12. Returns

### 12.1 Return Flow (Phase 1)

```
rental_end approaching → reminder alert
  → Schedule return_scheduled_at
  → Status → return_scheduled
On pickup:
  → Mark returned; record return_completed_at, actual_return_at
  → Inspect each line: return_condition, damage_notes
  → Compute late_fee if actual_return_at > rental_end + grace
  → Apply damage charges (manual amount per line Phase 1)
  → Generate damage/late invoices if needed
  → Settle deposit
  → Status → closed
  → Activity log: rental_returned, rental_closed
```

### 12.2 Return Condition Values

| Value | Meaning |
|-------|---------|
| `good` | No issues; full deposit refund |
| `fair` | Minor wear; optional partial deduction |
| `damaged` | Damage charge required |

### 12.3 Late Return Rules

- Late fee = `late_fee_per_day` × days late after `grace_hours_after_due`.
- Days late rounded up to whole days for Phase 1.

---

## 13. Invoicing

### 13.1 Invoice Types (Phase 1)

| Type | When |
|------|------|
| `rental` | On confirm or on return (setting) |
| `damage` | On return with damage charges |
| `late_fee` | On return when overdue |

### 13.2 Invoice Content

- Lines from `rental_contract_lines` with GST per asset `gst_rate`.
- Reference: `contract_number`, rental period in notes.
- Status: `draft` or `issued` per `auto_invoice_mode`.
- Link via `rental_invoices` table.

### 13.3 Payment Linkage

- Rental and damage invoices use existing **Payments** flow.
- Deposit received may link to **Payments** record Phase 2; manual ledger Phase 1.

---

## 14. Rental Dashboard & KPIs

### 14.1 Phase 1 KPIs

- Active contracts (`on_rent` + `delivered`)
- Assets on rent (units)
- Returns due (7d / overdue)
- Deposits held (total `deposit_received` − refunded − deducted on open contracts)
- Rental revenue MTD (closed contracts `grand_total`)
- Utilization % (units on rent ÷ total active asset quantity)

### 14.2 Phase 1 Lists

- Deliveries scheduled today
- Returns due this week
- Overdue returns
- Contracts awaiting deposit
- Recently closed contracts

---

## 15. Information Architecture and Navigation

### 15.1 CRM Sidebar (Staff)

| Route | Purpose |
|-------|---------|
| `/rental` | Dashboard |
| `/rental/calendar` | Booking calendar |
| `/rental/contracts` | Contract list |
| `/rental/assets` | Rentable asset catalog |
| `/rental/settings` | Module settings |

Sidebar label: **Rental** (requires `rental.view`).  
Grouped under **Operations** (product default).

### 15.2 Entry Points

- App launcher: **Rental** tile
- Contact detail: “New rental” (Phase 2)
- Quotation convert → rental contract (Phase 2)
- Notifications: delivery / return alert → contract detail

---

## 16. Detailed Functional Requirements

### 16.1 Dashboard

- KPI cards: on rent, returns due, deposits held, revenue MTD, utilization
- Tables: deliveries today, returns due, overdue, awaiting deposit
- Quick actions: New contract, View calendar

### 16.2 Asset List / Form

- CRUD rentable assets; rates; quantity; archive/retire
- Filter by category and status

### 16.3 Booking Calendar

- Date range navigation (week/month)
- Asset rows with booked blocks
- Click block → contract detail
- Conflict warning on new booking form

### 16.4 Contract List

- Filters: status, contact, date range, asset
- Columns: RNT #, contact, period, status, total, deposit status

### 16.5 Contract Detail

- Header: contact, period, status
- Tabs: Lines, Deposit, Delivery, Return, Invoices
- Actions: Confirm, Record deposit, Dispatch, Schedule return, Complete return, Close, Cancel

### 16.6 Settings

- Enable module, prefix, rate basis default, deposit %, late fee, grace hours, notify roles

### 16.7 Permissions

| Permission | Capability |
|------------|------------|
| `rental.view` | View dashboard, calendar, assets, contracts |
| `rental.manage_assets` | Create/edit rentable assets |
| `rental.create` | Create draft rental contracts |
| `rental.confirm` | Confirm booking and reserve calendar |
| `rental.dispatch` | Mark delivery dispatched / delivered |
| `rental.process_return` | Record return, condition, close contract |
| `rental.manage_deposits` | Record deposit received, refund, deduction |
| `rental.cancel` | Cancel contracts |
| `rental.manage_settings` | Module configuration |

**Default matrix:**

| Role | view | manage_assets | create | confirm | dispatch | process_return | manage_deposits | cancel | manage_settings |
|------|------|---------------|--------|---------|----------|----------------|-----------------|--------|-----------------|
| Admin | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Manager | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | — |
| Sales | ✓ | — | ✓ | ✓ | — | — | — | — | — |
| Accountant | ✓ | — | — | — | — | — | ✓ | — | — |
| Employee | ✓ | — | — | — | ✓ | ✓ | — | — | — |

---

## 17. Validation and Business Rules

1. Module must be `is_enabled` for rental routes.
2. Cannot book retired or maintenance assets on new contracts.
3. `rental_end` must be after `rental_start`.
4. Confirmed contract must pass availability conflict check.
5. Delivery blocked if deposit required and not fully received.
6. Cannot close contract until status is `returned` and all lines have `return_condition`.
7. `contract_number` unique per company.
8. All queries scoped by `company_id`.
9. Cancelled contract releases calendar reservation.
10. GST on invoices follows line `gst_rate` and company tax settings.
11. Damage charge cannot exceed remaining deposit without manager override note (Phase 2); Phase 1 warn only.

---

## 18. Integration Points

### 18.1 API Endpoints (Proposed)

**Settings & assets**

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET/PUT | `/rental/settings` | Settings |
| GET/POST | `/rental/assets` | List / create assets |
| GET/PUT | `/rental/assets/{id}` | Asset detail / update |
| GET | `/rental/assets/{id}/bookings` | Booking history |

**Calendar & contracts**

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/rental/dashboard` | KPIs |
| GET | `/rental/calendar` | Calendar events |
| GET/POST | `/rental/contracts` | List / create contract |
| GET | `/rental/contracts/{id}` | Detail |
| POST | `/rental/contracts/{id}/confirm` | Confirm and reserve |
| POST | `/rental/contracts/{id}/cancel` | Cancel |
| POST | `/rental/contracts/{id}/dispatch` | Mark delivered |
| POST | `/rental/contracts/{id}/schedule-return` | Schedule pickup |
| POST | `/rental/contracts/{id}/return` | Complete return + condition |
| POST | `/rental/contracts/{id}/close` | Settle deposit, close |
| GET | `/rental/contracts/{id}/availability` | Conflict check |

**Deposits & invoices**

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/rental/contracts/{id}/deposits` | Record deposit movement |
| GET | `/rental/contracts/{id}/deposits` | Deposit ledger |
| POST | `/rental/contracts/{id}/generate-invoice` | Create rental invoice |

### 18.2 Implementation Alignment

**Builds on (existing)**

- `contacts`, `products`, `invoices`, `payments`
- `permissions_data.py`, `activity.py`, `notifications`
- Invoice creation helpers from `invoices_router` or shared service (same pattern as Subscriptions / POS)

**New (greenfield)**

- Tables in §6.2
- `rental_router.py`, `rental_config.py`, `rental_schemas.py`
- `services/rental_service.py` — availability, pricing, deposit settlement, reminders
- Frontend: `RentalDashboard.jsx`, `RentalCalendar.jsx`, `RentalAssets.jsx`, `RentalAssetForm.jsx`, `RentalContracts.jsx`, `RentalContractForm.jsx`, `RentalContractDetail.jsx`, `RentalSettings.jsx`

---

## 19. Reporting and Insights

### Phase 1

- Dashboard utilization and deposits held
- Returns due / overdue lists
- Rental revenue MTD (closed contracts)

### Phase 2

- Asset utilization by category CSV export
- Average rental duration
- Damage / late fee summary
- Top renters by revenue

### Phase 3

- Fleet ROI (revenue vs asset cost)
- Seasonal demand forecast
- Deposit reconciliation report

---

## 20. Release Phasing

### Phase 1 (MVP)

- Rental settings and rentable asset catalog
- Create draft contract with lines and conflict check
- Confirm booking → calendar reservation
- Booking calendar (week view)
- Deposit record (received, refund, deduction)
- Delivery and return status workflow
- Close contract with condition and deposit settlement
- Rental invoice generation (draft/issue)
- Dashboard KPIs and lists
- In-app reminders (delivery, return due)
- Permissions and activity logs

### Phase 2

- Month calendar and asset Gantt view
- Quotation / sales order → rental conversion
- Field Service delivery / pickup orders
- Per-serial asset unit tracking
- Payments module link for deposits
- Contact detail entry point
- Email reminders
- Overbook override with approval

### Phase 3

- Customer self-service booking portal
- Online deposit payment (Razorpay)
- Telematics / metered billing (hours, km)
- Dynamic pricing rules
- Insurance and damage claim workflow

---

## 21. UAT Acceptance Checklist

1. Admin can enable Rental in settings.
2. Admin can create rentable asset with daily rate and quantity.
3. User can create draft contract; conflict shown if asset unavailable.
4. User can confirm contract; calendar shows booked block.
5. User can record deposit received; delivery blocked until deposit met (if setting on).
6. User can mark delivery; contract moves to `on_rent`.
7. User can schedule and complete return with line condition.
8. User can deduct damage and refund remaining deposit; contract closes.
9. Rental invoice generated and linked to contract.
10. User without `rental.confirm` cannot confirm booking.
11. Cross-company rental access blocked.
12. Activity log records confirm, deliver, return, deposit, and close.

---

## 22. Open Product Questions

1. **Invoice timing** — on confirm vs on return vs split (deposit + rental)?
2. **Tax-inclusive** vs exclusive rental rates for India GST?
3. **Minimum rental period** — 1 day default or configurable per asset?
4. **Partial return** — return 2 of 5 chairs early (Phase 2)?
5. Link rentable asset to **Inventory** product stock automatically?
6. **Extension** mid-rental — new end date with supplemental invoice Phase 1 or Phase 2?
7. **Internal transfer** between yards — affects availability?
8. **Weekend / holiday** rate multiplier Phase 2?
9. **Contract PDF** with terms and signature Phase 2?
10. Same contact **multiple open rentals** — allowed?

---

## Appendix A: Example Rental Journey

1. Admin registers asset **5 KVA Generator** — qty 3, ₹2,000/day, 18% GST.
2. Sales creates contract **RNT-2026-0015** for **Acme Events**, 3 units, 15–17 Jun 2026 (3 days).
3. System calculates rental ₹18,000 + GST; deposit 20% = ₹4,320.
4. Calendar shows all 3 units booked; fourth booking on same dates is blocked.
5. Acme pays deposit via UPI; coordinator dispatches delivery 15 Jun morning.
6. Contract status `on_rent` through event weekend.
7. Return scheduled 17 Jun 6 PM; yard receives units — 1 unit `fair`, others `good`.
8. ₹500 damage deduction; ₹3,820 deposit refunded; rental invoice **INV-2026-0312** issued.
9. Contract **closed**; dashboard utilization updates.

---

## Appendix B: Contract Status Timeline

```
draft → confirmed → delivered → on_rent → return_scheduled → returned → closed
  ↓         ↓
cancelled  cancelled
```

---

## Appendix C: Starter Permissions Seed

```python
RENTAL_PERMISSIONS = [
    ("rental.view", "View rental dashboard, calendar, assets, and contracts"),
    ("rental.manage_assets", "Create and edit rentable assets"),
    ("rental.create", "Create draft rental contracts"),
    ("rental.confirm", "Confirm bookings and reserve calendar"),
    ("rental.dispatch", "Mark rental delivery dispatched or delivered"),
    ("rental.process_return", "Process returns and close rental contracts"),
    ("rental.manage_deposits", "Record deposit received, refund, and deductions"),
    ("rental.cancel", "Cancel rental contracts"),
    ("rental.manage_settings", "Configure rental module settings"),
]
```

---

## Appendix D: Alignment with Product Roadmap

| Roadmap item | Rental contribution |
|--------------|----------------------|
| Invoices | Rental period and damage billing |
| Contacts | Renter identity |
| Customer Ledger | Balance per renter |
| Field Service | Delivery and pickup visits Phase 2 |
| Inventory | Physical unit stock alignment Phase 2 |
| Subscriptions | Short-term rent vs long-term recurring |
| eCommerce | Online rental booking Phase 3 |
| Multi-tenant SaaS | Per-tenant rental fleet Phase 3 (`MULTI_TENANT_ROADMAP`) |

---

## Appendix E: Relationship to Adjacent Modules

| Module | Rental vs |
|--------|-----------|
| **Subscriptions** | Time-bound asset rent vs recurring service billing |
| **Sales Orders** | One-time sale vs temporary use of assets |
| **Maintenance CMMS** | Internal fleet repair vs customer-facing rental |
| **Field Service** | Install/repair visit vs delivery/pickup logistics |
| **Inventory** | Stock on hand vs units **out on rent** |
| **POS** | Walk-in sale vs scheduled multi-day contract |

Rental Management handles **short-term asset allocation and deposit lifecycle**; Subscriptions handle **recurring revenue**; Field Service handles **service execution** at the customer site—link in Phase 2 when delivery is a dispatched visit.

---

*End of PRD — Rental Management v1.0*
