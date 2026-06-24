# Product Requirements Document (PRD)
## POS — Point of Sale (Level 4 CRM Module)

**Project:** BlackPapers CRM  
**Product Area:** Commerce / In-Store Sales / Counter Billing  
**Document Version:** v1.0  
**Date:** 2026-06-24  
**Status:** Draft for Product + Design Sign-off

---

## 1. Executive Summary

POS extends BlackPapers CRM with a **fast in-store billing layer** so Indian retail shops, showrooms, pharmacies, and restaurants can bill walk-in customers at the counter, collect payments, print or share receipts, and keep inventory in sync—without a separate billing machine or spreadsheet.

The module must use the same **Products / Services**, **Inventory**, **Contacts**, **Invoices**, **Payments**, and **Stock Out** records as the rest of the CRM. A sale at the counter should be a first-class CRM transaction, not an offline silo.

Core promise from product scope:

> **Enable retail counters or restaurants to bill customers, accept payments, and sync inventory.**

---

## 2. Problem Statement

Today, CRM supports quotations, sales orders, invoices, and inventory—but there is no **counter-optimized billing experience** for high-volume walk-in sales. Retail and restaurant staff still use external POS software, handwritten bills, or manual invoice entry after the fact.

Common issues this module should solve:

- Walk-in sales are billed outside CRM (Vyapar, Petpooja, Excel, paper kacha bills)
- **Stock** is not reduced automatically when items are sold at the counter
- **Payments** (cash, UPI, card) at the counter are not recorded in CRM Payments
- **GST invoices** for counter sales require duplicate data entry in Invoice Generator
- Managers cannot see **today’s counter revenue** alongside online and B2B sales
- Cashiers have no **shift / register** view for cash reconciliation
- Returns and exchanges at the counter have no structured workflow
- Restaurant **table orders** and kitchen tickets are managed on paper or a separate app
- Finance cannot reconcile **cash drawer** totals with CRM payment records
- Product prices in CRM and at the billing counter drift apart

---

## 3. Goals and Non-Goals

### 3.1 Goals

1. Provide a **touch-friendly POS billing screen** optimized for speed (search, scan, tap-to-add).
2. Bill **walk-in customers** with optional link to CRM Contact.
3. Support **hold / recall cart** for busy counters and restaurants.
4. Accept **multiple payment methods** per sale: cash, UPI, card, split payment (Phase 2).
5. **Auto-create Invoice** (and optional Sales Order) on completed sale with GST breakdown.
6. **Deduct inventory** immediately for inventory-tracked products via Stock Out / inventory movement.
7. Print or share **thermal receipt** and GST invoice (PDF / WhatsApp Phase 2).
8. Support **returns and exchanges** at counter with link to original bill.
9. Provide **register / session management**: open shift, cash float, close shift, Z-report.
10. Enforce **role-based permissions** for billing, void, discount, returns, and settings.
11. Preserve **audit trail** on every sale, void, return, discount, and shift close.
12. Provide **POS dashboard** in CRM: today’s sales, payment mix, top items, open sessions.
13. Support **retail** and **restaurant** modes (tables + KOT Phase 2).
14. Respect **India GST** (CGST/SGST/IGST, HSN, GSTIN on B2B counter bills).

### 3.2 Non-Goals (This Phase)

1. Full **restaurant ERP** (recipe costing, ingredient depletion, waiter payroll).
2. **Offline-first** POS with sync-after-reconnect (Phase 3).
3. **Hardware ecosystem** beyond basic receipt printer and barcode scanner (weighing scale, customer display Phase 3).
4. **Franchise / multi-brand** POS with central kitchen routing.
5. **Loyalty points**, gift cards, and complex promotion stacks (basic discount Phase 1; loyalty Phase 3).
6. **International multi-currency** (INR / India-first Phase 1).
7. **Table reservation** and delivery-aggregator integrations (Swiggy/Zomato).
8. **Full accounting GL posting** and Tally real-time sync.
9. **Native tablet app** (responsive web POS Phase 1).
10. Replacing **eCommerce** online checkout—POS is the in-store channel only.

---

## 4. Target Users and Roles

### 4.1 Primary Users (CRM Staff)

| User | POS need |
|------|----------|
| **Cashier / Billing staff** | Fast billing, take payment, print receipt |
| **Store manager** | Approve discounts/voids, close shift, review day sales |
| **Admin / Owner** | Configure registers, tax, receipt template, product visibility |
| **Accountant** | Reconcile cash/UPI/card totals with invoices and payments |
| **Inventory / Store** | See stock impact of counter sales in real time |

### 4.2 Secondary Users (CRM Staff)

| User | POS need |
|------|----------|
| **Sales** | View counter revenue alongside pipeline |
| **Leadership** | Channel split: counter vs online vs B2B in reports |
| **Employee** | View-only session summary (if granted) |

### 4.3 Counter Customers (Walk-in)

| User | POS need |
|------|----------|
| **Walk-in buyer** | Quick bill, pay, receive receipt/invoice |
| **Repeat retail customer** | Bill linked to Contact for history |
| **B2B walk-in** | GSTIN on bill, tax invoice preference |

---

## 5. Scope Overview

### 5.1 In Scope

| Capability | Description |
|------------|-------------|
| **POS terminal UI** | Product grid, search, cart, checkout |
| **Product catalog** | Products flagged `sell_at_pos` from CRM master |
| **Cart** | Add, qty, remove, line discount (manager), hold/recall |
| **Customer on bill** | Walk-in anonymous or linked Contact |
| **Payment** | Cash, UPI, card manual; split Phase 2 |
| **Invoice creation** | Auto GST invoice on sale complete |
| **Inventory sync** | Stock out on sale for tracked products |
| **Receipt** | Print-friendly / thermal layout |
| **Returns** | Return against original POS bill |
| **Sessions** | Open/close register shift with cash summary |
| **CRM admin** | Sessions, bills, returns, settings |
| **Permissions** | `pos.*` permission group |
| **Activity log** | Sale, void, return, shift close |

### 5.2 Out of Scope (Phase 1)

- Barcode scanner hardware integration (manual SKU search Phase 1)
- Razorpay POS / card terminal live integration
- Restaurant table map and KOT printing
- Kitchen display system (KDS)
- Offline mode
- Weighing-scale integration
- Combo meals / modifier groups (restaurant Phase 2)
- Customer-facing display pole

---

## 6. Core Product Concept

POS adds a **Register** inside CRM. Staff open a **session**, add products to a **cart**, complete **checkout** with payment, and the system creates a **POS Bill** that syncs to **Invoice**, **Payment**, and **Stock Out**.

Three primary surfaces:

1. **POS Terminal** — fullscreen billing UI (`/pos` or `/pos/terminal`).
2. **POS Back Office** — sessions, bills, returns, catalog flags (`/pos` in CRM sidebar).
3. **Manager Console** — shift reports, void approval, settings.

### 6.1 Relationship to Existing CRM Modules

| Module | Role relative to POS |
|--------|---------------------|
| **Products / Services** | Source of SKU, price, GST, HSN; `sell_at_pos` flag |
| **Inventory Management** | Decrement `on_hand_quantity` on sale |
| **Stock In / Stock Out** | Create `sale` stock-out movement per bill |
| **Warehouse Management** | Optional: deduct from default store location Phase 2 |
| **Contacts** | Optional customer on bill; walk-in creates Contact Phase 2 |
| **Sales Orders** | Optional POS bill → Sales Order for fulfillment-heavy retail |
| **Invoices** | Auto-generate GST invoice on payment success |
| **Payments** | Record cash/UPI/card against invoice |
| **Customer Ledger** | Counter sale posts to customer account when Contact linked |
| **eCommerce** | Sibling channel: online vs in-store; shared product catalog |
| **Sales Reports** | Counter channel revenue widget Phase 2 |
| **GST / Tax Reports** | POS invoices included in sales tax register |
| **Users (CRM)** | Cashier uses staff login; separate device PIN Phase 2 |
| **Activity Logs** | Bill lifecycle audit |

### 6.2 Proposed Data Model (Phase 1)

**`pos_settings`** (per company, 1:1)

| Field | Purpose |
|-------|---------|
| `company_id` | Tenant scope |
| `is_enabled` | POS module on/off |
| `default_register_id` | Default terminal |
| `bill_number_prefix` | e.g. POS |
| `auto_create_invoice` | Boolean |
| `auto_issue_invoice` | Boolean Phase 2 |
| `inventory_deduct_on_sale` | Boolean |
| `allow_negative_stock` | Boolean default false |
| `default_warehouse_location_id` | Phase 2 |
| `receipt_header`, `receipt_footer` | Print text |
| `require_customer_phone` | Boolean |
| `max_line_discount_pct` | Cashier limit |
| `restaurant_mode_enabled` | Phase 2 |

**`pos_registers`** (terminals / counters)

| Field | Purpose |
|-------|---------|
| `id` | PK |
| `company_id` | Tenant |
| `name` | "Main counter", "Billing 2" |
| `code` | Short code |
| `is_active` | |
| `default_payment_method` | cash |
| `opening_float_default` | Decimal |

**`pos_sessions`** (cashier shifts)

| Field | Purpose |
|-------|---------|
| `id` | PK |
| `company_id` | Tenant |
| `register_id` | FK |
| `opened_by_id` | FK users |
| `closed_by_id` | FK nullable |
| `status` | open, closed |
| `opening_float` | Cash in drawer at open |
| `closing_cash_counted` | Decimal nullable |
| `expected_cash` | Computed |
| `cash_variance` | Decimal nullable |
| `opened_at`, `closed_at` | |
| `notes` | |

**`pos_carts`** (active / held carts)

| Field | Purpose |
|-------|---------|
| `id` | PK |
| `company_id` | Tenant |
| `session_id` | FK |
| `status` | active, held, completed, voided |
| `contact_id` | FK nullable |
| `customer_name`, `customer_phone` | Walk-in |
| `held_label` | e.g. "Table 4", "Rajesh" |
| `subtotal`, `discount_total`, `tax_total`, `grand_total` | Decimal |
| `created_by_id` | FK users |

**`pos_cart_items`**

| Field | Purpose |
|-------|---------|
| `id` | PK |
| `cart_id` | FK |
| `product_id` | FK |
| `quantity` | Decimal |
| `unit_price` | Snapshot |
| `discount_amount` | Line discount |
| `gst_rate` | Snapshot |
| `line_total` | |

**`pos_bills`** (completed sale header)

| Field | Purpose |
|-------|---------|
| `id` | PK |
| `company_id` | Tenant |
| `bill_number` | POS-2026-0042 |
| `session_id` | FK |
| `register_id` | FK |
| `contact_id` | FK nullable |
| `invoice_id` | FK nullable |
| `sales_order_id` | FK nullable |
| `status` | completed, voided, returned, partially_returned |
| `subtotal`, `discount_total`, `tax_total`, `grand_total` | Decimal |
| `customer_name`, `customer_phone`, `customer_gstin` | |
| `cashier_id` | FK users |
| `completed_at` | |
| `voided_at`, `void_reason`, `voided_by_id` | |

**`pos_bill_items`**

| Field | Purpose |
|-------|---------|
| `id` | PK |
| `bill_id` | FK |
| `product_id` | FK |
| `product_name_snapshot` | |
| `quantity`, `unit_price`, `discount_amount`, `gst_rate`, `line_total` | |

**`pos_payments`** (split payments Phase 2)

| Field | Purpose |
|-------|---------|
| `id` | PK |
| `bill_id` | FK |
| `amount` | |
| `method` | cash, upi, card, other |
| `reference` | UPI ref, last 4 digits |
| `status` | completed, refunded |
| `crm_payment_id` | FK nullable |

**`pos_returns`**

| Field | Purpose |
|-------|---------|
| `id` | PK |
| `bill_id` | FK original |
| `return_number` | RET-POS-2026-0001 |
| `status` | completed, voided |
| `reason` | |
| `refund_amount` | |
| `refund_method` | cash, upi, original |
| `items_json` | Lines + qty |
| `processed_by_id` | FK users |
| `processed_at` | |

**Product extension** (migration on `products`):

| Field | Purpose |
|-------|---------|
| `sell_at_pos` | Boolean default false |
| `pos_category` | Grid grouping e.g. Beverages |
| `pos_sort_order` | Display order |

---

## 7. POS Terminal Experience

### 7.1 Terminal Routes (Staff — authenticated)

| Route | Purpose |
|-------|---------|
| `/pos` | Landing: open session or resume |
| `/pos/terminal` | Main billing screen (requires open session) |
| `/pos/terminal/held` | Held carts list |
| `/pos/terminal/returns` | Return lookup by bill # |

### 7.2 Billing Screen Layout (Phase 1)

```
┌─────────────────────────────────────────────────────────────┐
│ Register: Main Counter · Session #12 · Cashier: Priya    [≡] │
├──────────────────────────────┬──────────────────────────────┤
│  [Search products…]          │  CART (3 items)              │
│  Category: All | Snacks | …  │  ─────────────────────────   │
│  ┌────┐ ┌────┐ ┌────┐       │  Item A          x2   ₹400   │
│  │ P1 │ │ P2 │ │ P3 │       │  Item B          x1   ₹150   │
│  └────┘ └────┘ └────┘       │  ─────────────────────────   │
│  (product tile grid)         │  Subtotal            ₹550    │
│                              │  GST                 ₹99     │
│                              │  Total               ₹649    │
│                              │  [Hold] [Customer] [Pay]     │
└──────────────────────────────┴──────────────────────────────┘
```

### 7.3 Product Visibility Rules

- Only products with `sell_at_pos = true` and `status = active` appear on terminal.
- Out-of-stock: show badge; block add if `inventory_tracked` and qty ≤ 0 (unless `allow_negative_stock`).
- Services without inventory (e.g. consultation fee) billable as fixed-price lines.
- Price from `offer_price` or `total_price`; manager can override with permission.

### 7.4 Terminal Features (Phase 1)

- Product search by name / service code
- Category filter (`pos_category`)
- Tap product tile → add to cart (qty 1); tap again increments
- Quantity stepper on cart line
- Remove line
- **Hold cart** with label; recall from held list
- Optional customer name + phone on cart
- Checkout modal: payment method, amount tendered (cash change), complete
- Post-sale: print receipt, new sale button

### 7.5 Restaurant Mode (Phase 2)

- Table selector (floor plan or list)
- Order type: dine-in, takeaway, delivery counter
- Send to kitchen (KOT) without payment
- Settle table → payment → invoice
- Split bill by seat or amount

---

## 8. Checkout and Payment

### 8.1 Checkout Flow

```
Review cart
  → Optional customer (name, phone, GSTIN)
  → Apply bill discount (manager permission)
  → Select payment method(s)
  → Confirm sale
  → Create pos_bill (status: completed)
  → Create Invoice (if auto_create_invoice)
  → Record pos_payment(s) + CRM Payment
  → Stock out (if inventory_deduct_on_sale)
  → Print receipt
  → Activity log: pos_sale_completed
```

### 8.2 Payment Methods (Phase 1)

| Method | Behavior |
|--------|----------|
| **Cash** | Amount tendered → change due; counts toward session cash |
| **UPI** | Manual entry; optional reference note |
| **Card** | Manual mark paid; reference last 4 digits |
| **Other** | Petty / store credit note Phase 2 |

### 8.3 Phase 2 — Payment Integrations

- Razorpay POS / QR dynamic UPI
- Card terminal webhook
- Split payment: e.g. ₹500 cash + ₹300 UPI

### 8.4 GST / Tax Rules

- Per-line `gst_rate` from product; compute CGST/SGST or IGST per company rules (same as Invoice Generator).
- B2B: optional GSTIN on bill; validate format; store on Contact.
- Bill discount applied before tax per company policy (document in settings).
- Receipt shows "Tax Invoice" when GSTIN provided and invoice issued.

---

## 9. Inventory Sync

### 9.1 On Sale Complete

When `inventory_deduct_on_sale = true` and product `inventory_tracked`:

1. Decrement `products.on_hand_quantity` by sold qty.
2. Create **Stock Out** movement:
   - `movement_type`: sale
   - `reference`: `pos_bill:{bill_number}`
   - `reason`: POS sale
   - `user_id`: cashier

### 9.2 On Return Complete

- Increment stock if product tracked and return policy restocks.
- Create **Stock In** movement with reference to `pos_return`.

### 9.3 Phase 2 — Warehouse Location

- Deduct from `default_warehouse_location_id` on register or company settings.
- Block sale if location stock insufficient.

### 9.4 Conflict with eCommerce

- Shared `on_hand_quantity` at product level Phase 1.
- Channel-specific stock pools Phase 3.

---

## 10. Returns and Voids

### 10.1 Void Bill (Same Session)

- Manager permission required.
- Only before end-of-day close (configurable window).
- Reverses invoice (cancel draft / credit note Phase 2).
- Restocks inventory if already deducted.
- Activity log: `pos_bill_voided`.

### 10.2 Return (After Sale)

- Lookup bill by `bill_number` or scan receipt QR Phase 2.
- Select lines + qty to return.
- Refund via cash/UPI; record `pos_return`.
- Partial returns allowed.
- Return window configurable (default 7 days).

### 10.3 Exchange (Phase 2)

- Return line + add new product in one transaction.

---

## 11. Register Sessions and Cash Management

### 11.1 Open Session

- Cashier selects register → enters opening float → session `open`.
- Only one open session per register.

### 11.2 During Session

- All bills attributed to session.
- Running totals: cash, UPI, card, bill count.

### 11.3 Close Session (Z-Report)

- Cashier counts cash in drawer.
- System shows expected cash (opening float + cash sales − cash refunds).
- Variance recorded; manager notes if over/short.
- Session `closed`; terminal requires new open to bill.

### 11.4 Z-Report Contents

- Session id, register, cashier, open/close time
- Bill count, gross sales, discounts, net sales
- Payment method breakdown
- Cash opening, cash sales, cash refunds, expected, counted, variance
- Void and return summary

---

## 12. Receipts and Invoices

### 12.1 Receipt (Phase 1)

- Company name, address, GSTIN, phone
- Bill number, date/time, cashier
- Line items with qty, rate, amount
- Subtotal, discount, GST breakup, grand total
- Payment method and change (cash)
- "Thank you" footer from settings
- Print via browser print → thermal 80mm CSS

### 12.2 Tax Invoice

- Link to CRM Invoice record when issued
- PDF preview / download from bill detail
- WhatsApp share Phase 2

---

## 13. Information Architecture and Navigation

### 13.1 CRM Sidebar (Staff)

| Route | Purpose |
|-------|---------|
| `/pos` | POS home: open terminal, session status |
| `/pos/sessions` | Session history and Z-reports |
| `/pos/bills` | All POS bills list |
| `/pos/bills/:id` | Bill detail, reprint, void |
| `/pos/returns` | Returns list |
| `/pos/catalog` | `sell_at_pos` product manager |
| `/pos/settings` | Registers, receipt, tax, flags |

Sidebar label: **Point of Sale** (requires `pos.view`).  
Grouped under **Sales** or **Operations**.

### 13.2 Entry Points

- App launcher: **Point of Sale** tile
- Fullscreen **Open Terminal** CTA from `/pos`
- Products detail: "Sell at POS" toggle
- Inventory: link to POS bills affecting stock

---

## 14. Detailed Functional Requirements

### 14.1 POS Home (CRM)

- Show register list with open/closed status
- **Open session** / **Resume terminal** if user has open session
- KPI cards: today sales, bills today, open sessions
- Quick links: bills, sessions, settings

### 14.2 Terminal (Billing)

- Requires `pos.bill` permission and open session
- Product grid loads from `sell_at_pos` catalog
- Keyboard shortcuts: `/` focus search, `+`/`-` qty, `F2` hold, `F4` pay (Phase 1 web)
- Checkout blocked on empty cart
- Success screen with reprint and new sale

### 14.3 Bills List (CRM)

- Filters: date range, register, cashier, payment method, status
- Columns: bill #, customer, total, payment, cashier, time
- Export CSV Phase 2

### 14.4 Bill Detail (CRM)

- Lines, tax, payments, linked invoice
- Reprint receipt
- Void (manager)
- Initiate return

### 14.5 Catalog Manager (CRM)

- List products with `sell_at_pos` toggle
- Bulk enable/disable
- Set `pos_category` and sort order
- Preview on terminal grid

### 14.6 Settings (CRM)

- Enable/disable POS
- Manage registers
- Bill prefix, auto-invoice toggles
- Inventory deduct toggle
- Receipt header/footer
- Max cashier discount %
- Return window days

### 14.7 Permissions

| Permission | Capability |
|------------|------------|
| `pos.view` | View dashboard, bills, sessions |
| `pos.bill` | Use terminal, complete sales |
| `pos.hold` | Hold and recall carts |
| `pos.discount` | Apply line/bill discounts |
| `pos.void` | Void completed bills |
| `pos.return` | Process returns |
| `pos.manage_sessions` | Open/close any session, view Z-reports |
| `pos.manage_catalog` | Toggle sell_at_pos, categories |
| `pos.manage_settings` | Registers and POS configuration |

**Default matrix:**

| Role | view | bill | hold | discount | void | return | manage_sessions | manage_catalog | manage_settings |
|------|------|------|------|----------|------|--------|-----------------|----------------|-----------------|
| Admin | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Manager | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | — |
| Sales | ✓ | ✓ | ✓ | — | — | — | — | ✓ | — |
| Accountant | ✓ | — | — | — | — | ✓ | ✓ | — | — |
| Employee | ✓ | ✓ | ✓ | — | — | — | — | — | — |

---

## 15. UI / UX Requirements

### 15.1 Terminal

- Large tap targets (min 48px) for product tiles
- High contrast cart panel always visible
- Sub-second product search results
- Clear error when out of stock
- Payment modal: large numeric keypad for cash tendered
- Fullscreen mode on tablet; minimal CRM chrome

### 15.2 Back Office

- Status badges consistent with Invoice / Sales Order patterns
- One-click reprint receipt
- Confirm dialogs on void and return
- Session close wizard with variance highlight

---

## 16. Validation and Business Rules

1. POS must be `is_enabled` to open terminal.
2. Billing requires an **open session** on the register.
3. Cart line quantity ≥ 1; max 999 per line.
4. Cannot complete sale with empty cart.
5. Server recalculates totals; never trust client totals.
6. Void only with `pos.void`; within void window policy.
7. Return qty ≤ originally sold minus prior returns.
8. `sell_at_pos` products must have price > 0.
9. One open session per register at a time.
10. All queries scoped by `company_id`.
11. Cashier cannot close another user's session without `pos.manage_sessions`.
12. Bill discount above `max_line_discount_pct` requires manager PIN Phase 2.

---

## 17. Integration Points

### 17.1 API Endpoints (Proposed)

**Terminal (staff — session scoped)**

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/pos/terminal/catalog` | POS product grid |
| GET | `/pos/terminal/cart` | Active cart |
| POST | `/pos/terminal/cart/items` | Add line |
| PUT | `/pos/terminal/cart/items/{id}` | Update qty/discount |
| DELETE | `/pos/terminal/cart/items/{id}` | Remove line |
| POST | `/pos/terminal/cart/hold` | Hold cart |
| POST | `/pos/terminal/cart/recall/{id}` | Recall held |
| POST | `/pos/terminal/checkout` | Complete sale |
| GET | `/pos/terminal/bills/{bill_number}/receipt` | Receipt HTML/PDF |

**Sessions**

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/pos/sessions/open` | Open register session |
| POST | `/pos/sessions/{id}/close` | Close with cash count |
| GET | `/pos/sessions` | Session list |
| GET | `/pos/sessions/{id}/z-report` | Z-report data |

**Back office**

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/pos/dashboard` | KPIs |
| GET | `/pos/bills` | Bill list |
| GET | `/pos/bills/{id}` | Bill detail |
| POST | `/pos/bills/{id}/void` | Void bill |
| POST | `/pos/bills/{id}/returns` | Process return |
| GET | `/pos/catalog` | POS products |
| PUT | `/pos/catalog/{product_id}` | Update POS fields |
| GET/PUT | `/pos/settings` | Settings |
| GET/POST | `/pos/registers` | Register CRUD |

### 17.2 Implementation Alignment

**Builds on (existing)**

- `products` — extend with `sell_at_pos`, `pos_category`
- `invoices`, `payments` — bill settlement
- `inventory` / `stock_movements` — stock sync
- `contacts` — optional customer link
- `permissions_data.py`, `activity.py` patterns

**New (greenfield)**

- POS tables in §6.2
- `pos_router.py`, `pos_config.py`, `pos_schemas.py`
- Frontend: `PosTerminal.jsx`, `PosCheckout.jsx`, `PosSessions.jsx`, `PosBills.jsx`, CRM admin pages

---

## 18. Reporting and Insights

### Phase 1

- Dashboard KPIs: today sales, bill count, payment mix
- Session Z-report
- Bills list with filters

### Phase 2

- Counter vs online vs B2B in Sales Reports
- Top products by units/revenue (POS channel)
- Cashier performance
- Hourly sales heatmap
- CSV export bills

### Phase 3

- Inventory shrinkage vs POS returns
- Category margin analysis

---

## 19. Release Phasing

### Phase 1 (MVP)

- POS settings and registers
- Product `sell_at_pos` flag and catalog manager
- Session open/close with cash float
- Terminal: grid, search, cart, checkout
- Cash and UPI manual payment
- Auto invoice draft on sale
- Inventory deduct on sale
- Receipt print layout
- Bills list and detail in CRM
- Basic return and void (manager)
- Activity logs

### Phase 2

- Restaurant mode: tables, KOT, settle table
- Barcode scan (USB keyboard wedge)
- Split payments
- Razorpay QR / UPI dynamic
- Warehouse location deduct
- Bill discount presets and manager override PIN
- Sales Reports POS channel widget
- WhatsApp receipt share

### Phase 3

- Offline queue and sync
- Customer display pole
- Loyalty / store credit
- Weighing scale integration
- Multi-register consolidated dashboard
- Combo / modifier menus for restaurants

---

## 20. UAT Acceptance Checklist

1. Admin can enable POS and create a register.
2. Cashier can open session with opening float.
3. Products marked `sell_at_pos` appear on terminal grid.
4. Cashier can add items, change qty, and complete cash sale.
5. Bill appears in `/pos/bills` with correct total and GST.
6. Invoice is created and linked to bill (if auto-create enabled).
7. Inventory-tracked product decrements stock on sale.
8. Stock Out movement references POS bill number.
9. Receipt prints with company GSTIN and bill details.
10. Manager can void bill and stock is restored.
11. Return reduces bill total and restocks item.
12. Session close shows expected vs counted cash and variance.
13. User without `pos.bill` cannot access terminal.
14. Cross-company bill access is blocked.
15. Activity log records sale, void, return, and session close.

---

## 21. Open Product Questions

1. Should every POS sale create a **Sales Order** or **Invoice only**?
2. **Walk-in customer**: always anonymous vs prompt for phone on every sale?
3. **Restaurant Phase 2**: table-first UX or retail-first with restaurant add-on?
4. **Shared inventory** with eCommerce: single pool or reserved quantities per channel?
5. **Invoice timing**: issue tax invoice immediately at counter or end-of-day batch?
6. **Cash drawer**: track only in CRM or integrate with hardware kick?
7. **Device auth**: reuse CRM JWT on shared tablet or cashier PIN per session?
8. **Price override** at counter: allowed for all cashiers or manager only?
9. **HSN/SAC** on receipt: product-level mandatory before `sell_at_pos`?
10. Plan limits: max registers or bills/day on free tier?

---

## Appendix A: Example Customer Journey (Retail)

1. Cashier opens morning session on "Main Counter" with ₹2,000 float.
2. Customer buys 2 items; cashier taps products on grid.
3. Customer pays ₹650 cash; cashier enters ₹700 tendered → ₹50 change.
4. Receipt prints; bill `POS-2026-0188` created; invoice draft linked.
5. Inventory reduced for SKU items.
6. Evening: manager closes session; counted cash ₹14,200 vs expected ₹14,150 → ₹50 over noted.
7. Next day customer returns 1 item; manager processes return → cash refund → stock in.

---

## Appendix B: Example Customer Journey (Restaurant — Phase 2)

1. Waiter opens table T5, adds 3 items, sends KOT to kitchen.
2. Adds dessert later; KOT amendment.
3. Guest asks for bill; waiter opens settle screen.
4. Split: ₹400 UPI + ₹200 cash.
5. Table cleared; invoice issued with dine-in service charge if configured.

---

## Appendix C: Bill Status Timeline

```
cart (active) → checkout → completed
                    ↘ voided (manager)
completed → partially_returned → returned
```

---

## Appendix D: Starter Permissions Seed

```python
POS_PERMISSIONS = [
    ("pos.view", "View POS dashboard, bills, and sessions"),
    ("pos.bill", "Use POS terminal and complete sales"),
    ("pos.hold", "Hold and recall POS carts"),
    ("pos.discount", "Apply POS discounts"),
    ("pos.void", "Void POS bills"),
    ("pos.return", "Process POS returns"),
    ("pos.manage_sessions", "Open, close, and audit register sessions"),
    ("pos.manage_catalog", "Manage products sold at POS"),
    ("pos.manage_settings", "Configure POS registers and settings"),
]
```

---

## Appendix E: Alignment with Product Roadmap

| Roadmap item | POS contribution |
|--------------|------------------|
| Products / Services | Single price list for counter and CRM |
| Inventory | Real-time stock on every counter sale |
| Invoices / GST | Compliant counter billing |
| Payments | Unified cash/UPI/card tracking |
| eCommerce | In-store + online channels |
| Sales Reports | Channel-aware revenue |
| Warehouse | Location-level deduct Phase 2 |

---

## Appendix F: Relationship to eCommerce PRD

| eCommerce | POS |
|-----------|-----|
| Public web shop | Staff-only terminal |
| Guest / customer accounts | Walk-in / optional Contact |
| Shipping and delivery | Immediate handover |
| `sell_online` flag | `sell_at_pos` flag |
| Web order → Sales Order | POS bill → Invoice |
| Online returns portal | Counter return by manager |
| Razorpay checkout Phase 2 | Razorpay QR / POS Phase 2 |

---

*End of PRD — POS v1.0*
