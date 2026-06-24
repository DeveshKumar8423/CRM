# Product Requirements Document (PRD)
## eCommerce (Level 5 CRM Module)

**Project:** BlackPapers CRM  
**Product Area:** Commerce / Online Sales / Customer Self-Service  
**Document Version:** v1.0  
**Date:** 2026-06-24  
**Status:** Draft for Product + Design Sign-off

---

## 1. Executive Summary

eCommerce extends BlackPapers CRM and **Website Builder** with a full **online selling layer** so Indian SMEs can run a product catalog, shopping cart, checkout, payments, delivery, returns, and customer accounts on their public site—without Shopify, WooCommerce, or manual order entry.

The module must sync with existing **Products / Services**, **Inventory**, **Contacts**, **Sales Orders**, **Invoices**, and **Payments** so online orders are first-class CRM records, not a separate spreadsheet.

Core promise from product scope:

> **Add online product catalog, cart, checkout, payment, delivery, returns, and customer accounts.**

---

## 2. Problem Statement

Today, Website Builder can display products and capture leads via forms—but visitors cannot **buy online**. Businesses that sell physical goods or fixed-price services still rely on WhatsApp orders, manual quotations, or external storefronts.

Common issues this module should solve:

- No **online product catalog** with filters, search, and buy buttons on the public site
- **Cart and checkout** happen outside CRM (phone, email, third-party cart)
- **Payments** for web orders are not recorded in CRM Payments / Invoices automatically
- **Delivery / shipping** status is not tracked for online buyers
- **Returns and refunds** have no structured workflow tied to the original order
- **Customer accounts** do not exist for repeat buyers (order history, addresses, profile)
- **Inventory** is not decremented when an online sale completes (or is reserved at checkout)
- **GST-compliant invoices** for web orders require manual recreation in Invoice Generator
- Sales and finance cannot answer “how much did we sell online this month?” from CRM reports
- Website traffic converts to leads, but not to **paid orders** without staff intervention

---

## 3. Goals and Non-Goals

### 3.1 Goals

1. Provide a **public online product catalog** synced from CRM Products (with eCommerce visibility flags).
2. Enable **shopping cart** (add, update quantity, remove, persist for session / logged-in customer).
3. Support **guest checkout** and **registered customer checkout**.
4. Implement **checkout flow**: cart review → customer details → shipping/billing address → payment → confirmation.
5. Integrate **payment collection** (Phase 1: manual/bank transfer + record payment; Phase 2: Razorpay / UPI / cards).
6. Create **Sales Order** and/or **Invoice** in CRM when checkout completes successfully.
7. Support **delivery management**: shipping method, tracking ID, status (processing → shipped → delivered).
8. Support **returns workflow**: return request, approval, refund or exchange, link to original order.
9. Provide **customer accounts** on the public store: register, login, profile, order history, saved addresses.
10. Respect **GST** (tax lines, GSTIN on B2B checkout, India address fields).
11. Optionally **reserve or deduct inventory** for inventory-tracked products.
12. Enforce **role-based permissions** for store settings, order management, returns approval.
13. Preserve **audit trail** via activity logs on order placement, payment, shipment, return.
14. Provide **store admin dashboard** inside CRM: orders, revenue, abandoned carts (Phase 2), returns queue.

### 3.2 Non-Goals (This Phase)

1. Full **Shopify / Amazon marketplace** replacement with app ecosystem.
2. **Multi-vendor marketplace** (sellers on one storefront) — single-tenant store only.
3. **Subscription / recurring billing** (Phase 3).
4. **Complex promotions engine** (BOGO, tiered discounts, coupon stacks) — basic coupon Phase 2.
5. **International multi-currency** checkout (INR / India-first Phase 1).
6. **Same-day hyperlocal delivery** routing and driver app.
7. **Advanced warehouse pick-pack-ship** (use Warehouse Management links Phase 2).
8. **Buy now pay later** (BNPL) integrations Phase 3.
9. **Native mobile store app** (responsive web store Phase 1).
10. **Digital downloads / license keys** as primary product type Phase 1 (physical + simple services first).

---

## 4. Target Users and Roles

### 4.1 Primary Users (CRM Staff)

| User | eCommerce need |
|------|----------------|
| **Admin / Owner** | Enable store, configure payment/shipping, manage catalog visibility |
| **Sales / Operations** | View online orders, update delivery status, handle customer queries |
| **Manager** | Approve returns, monitor order SLA, review store KPIs |
| **Accountant** | Reconcile web payments with invoices, process refunds |
| **Warehouse / Inventory** | Fulfill orders, update stock, mark shipped |

### 4.2 Secondary Users (CRM Staff)

| User | eCommerce need |
|------|----------------|
| **Marketing** | Promote catalog pages, track conversion from Website Builder |
| **Employee** | View-only order list (if granted) |
| **Leadership** | Online revenue and return rate in reports |

### 4.3 Store Customers (Public)

| User | eCommerce need |
|------|----------------|
| **Guest buyer** | Browse catalog, cart, checkout without account |
| **Registered customer** | Account, order history, saved addresses, faster checkout |
| **B2B buyer** | GSTIN, company name, invoice preference |

---

## 5. Scope Overview

### 5.1 In Scope

| Capability | Description |
|------------|-------------|
| **Online catalog** | Public product listing, detail pages, categories, search |
| **Cart** | Session cart + customer cart merge on login |
| **Checkout** | Multi-step checkout with address and order summary |
| **Payment** | Payment method selection, record payment, gateway Phase 2 |
| **Order creation** | Web order → CRM Sales Order + Invoice draft/issue |
| **Delivery** | Shipping methods, fulfillment status, tracking number |
| **Returns** | Return request, approval, refund status |
| **Customer accounts** | Register, login, profile, addresses, order history |
| **Store settings** | Enable/disable store, currency, tax, shipping rules |
| **CRM admin** | Online orders list, detail, actions (ship, cancel, refund) |
| **Website integration** | Catalog and cart on `/s/{company_slug}/shop` |
| **Permissions** | `ecommerce.*` permission group |
| **Activity log** | Order placed, paid, shipped, returned |

### 5.2 Out of Scope (Phase 1)

- Payment gateway live charges (Razorpay/Stripe) — record manual payment first
- Abandoned cart email automation
- Product reviews and ratings
- Wishlists and compare
- Gift cards
- Multi-warehouse ship-from logic
- Complex shipping rate tables (flat rate + free above threshold Phase 1)
- Affiliate / referral tracking

---

## 6. Core Product Concept

eCommerce adds a **Store** on top of the public website. The store reads from **Products** marked `sell_online = true`, maintains a **Cart**, and completes **Checkout** by creating a **Web Order** that syncs to CRM **Sales Order** and **Invoice**.

Three primary surfaces:

1. **Public Store** — catalog, product detail, cart, checkout, customer account (`/s/{slug}/shop/...`).
2. **Customer Account Portal** — orders, addresses, profile (public, customer JWT/session).
3. **CRM Store Admin** — orders, returns, settings (`/ecommerce` in CRM sidebar).

### 6.1 Relationship to Existing CRM Modules

| Module | Role relative to eCommerce |
|--------|---------------------------|
| **Website Builder** | Store lives on same public site; shop section / nav link; branding shared |
| **Products / Services** | Source of SKU, price, GST, description, images; `sell_online` flag |
| **Inventory Management** | Reserve/deduct stock on order confirm; block oversell if configured |
| **Contacts** | Guest checkout creates/updates Contact; registered customer links Contact |
| **Leads** | Optional: abandon checkout → lead (Phase 2) |
| **Sales Orders** | Web order converts to Sales Order for fulfillment workflow |
| **Invoices** | Auto-generate GST invoice on payment success |
| **Payments** | Record online payment against invoice |
| **Customer Ledger** | Customer account balance from invoices/payments |
| **Warehouse / Stock Out** | Ship action triggers stock-out movement Phase 2 |
| **Sales Reports** | Online channel revenue and conversion Phase 2 |
| **Users (CRM)** | Staff manage orders; separate **Store Customer** auth |
| **Activity Logs** | Order lifecycle audit |

### 6.2 Proposed Data Model (Phase 1)

**`store_settings`** (per company, 1:1)

| Field | Purpose |
|-------|---------|
| `company_id` | Tenant scope |
| `is_enabled` | Store on/off |
| `store_name` | Display name override |
| `currency` | Default INR |
| `guest_checkout_allowed` | Boolean |
| `require_login_to_checkout` | Boolean Phase 2 |
| `flat_shipping_rate` | Decimal |
| `free_shipping_above` | Decimal nullable |
| `default_payment_method` | cod, bank_transfer, online |
| `order_number_prefix` | e.g. WEB |
| `auto_create_invoice` | Boolean |
| `auto_issue_invoice` | Boolean Phase 2 |
| `inventory_reserve_on_checkout` | Boolean |
| `terms_url_slug` | Link to website page |

**`store_customers`** (public buyers — not CRM staff Users)

| Field | Purpose |
|-------|---------|
| `id` | PK |
| `company_id` | Tenant |
| `contact_id` | FK contacts nullable |
| `email` | Unique per company |
| `phone` | |
| `password_hash` | |
| `name` | |
| `gstin` | B2B optional |
| `is_active` | |
| `created_at`, `updated_at` | |

**`store_customer_addresses`**

| Field | Purpose |
|-------|---------|
| `id` | PK |
| `customer_id` | FK |
| `label` | Home / Office |
| `line1`, `line2`, `city`, `state`, `pincode` | India address |
| `is_default_shipping`, `is_default_billing` | |

**`store_carts`**

| Field | Purpose |
|-------|---------|
| `id` | PK |
| `company_id` | Tenant |
| `session_id` | Anonymous cart |
| `customer_id` | FK nullable |
| `expires_at` | |
| `created_at`, `updated_at` | |

**`store_cart_items`**

| Field | Purpose |
|-------|---------|
| `id` | PK |
| `cart_id` | FK |
| `product_id` | FK products |
| `quantity` | Decimal |
| `unit_price_snapshot` | Price at add time |
| `gst_rate_snapshot` | |

**`store_orders`** (web order header)

| Field | Purpose |
|-------|---------|
| `id` | PK |
| `company_id` | Tenant |
| `order_number` | WEB-2026-0001 |
| `customer_id` | FK nullable (guest) |
| `contact_id` | FK |
| `sales_order_id` | FK nullable |
| `invoice_id` | FK nullable |
| `status` | pending_payment, paid, processing, shipped, delivered, cancelled, returned |
| `payment_status` | unpaid, paid, refunded, partial_refund |
| `subtotal`, `tax_total`, `shipping_total`, `grand_total` | Decimal |
| `currency` | INR |
| `guest_email`, `guest_phone`, `guest_name` | Guest checkout |
| `shipping_address_json`, `billing_address_json` | |
| `shipping_method` | standard, express, pickup |
| `tracking_number` | |
| `customer_note` | |
| `placed_at`, `paid_at`, `shipped_at`, `delivered_at` | |
| `created_at`, `updated_at` | |

**`store_order_items`**

| Field | Purpose |
|-------|---------|
| `id` | PK |
| `order_id` | FK |
| `product_id` | FK |
| `product_name_snapshot` | |
| `quantity`, `unit_price`, `gst_rate`, `line_total` | |

**`store_payments`**

| Field | Purpose |
|-------|---------|
| `id` | PK |
| `order_id` | FK |
| `amount` | |
| `method` | cod, bank_transfer, razorpay, upi |
| `gateway_reference` | Phase 2 |
| `status` | pending, completed, failed, refunded |
| `recorded_by_id` | Staff for manual |
| `created_at` | |

**`store_returns`**

| Field | Purpose |
|-------|---------|
| `id` | PK |
| `order_id` | FK |
| `return_number` | RET-2026-0001 |
| `status` | requested, approved, rejected, received, refunded, closed |
| `reason` | Text |
| `items_json` | Lines + qty returned |
| `refund_amount` | |
| `requested_at`, `resolved_at` | |
| `resolved_by_id` | FK users |

**Product extension** (migration on `products`):

| Field | Purpose |
|-------|---------|
| `sell_online` | Boolean default false |
| `online_slug` | URL slug |
| `online_description` | Override for store |
| `online_image_url` | |
| `compare_at_price` | Optional strike-through MRP |

---

## 7. Storefront Catalog

### 7.1 Catalog Pages (Public)

| Route | Purpose |
|-------|---------|
| `/s/{slug}/shop` | Product grid, categories, search |
| `/s/{slug}/shop/{product_slug}` | Product detail, add to cart |
| `/s/{slug}/cart` | Cart review |
| `/s/{slug}/checkout` | Checkout steps |
| `/s/{slug}/checkout/confirmation/{order_number}` | Thank you page |
| `/s/{slug}/account` | Customer dashboard |
| `/s/{slug}/account/orders` | Order history |
| `/s/{slug}/account/orders/{order_number}` | Order detail + return request |
| `/s/{slug}/account/login` | Customer login |
| `/s/{slug}/account/register` | Customer register |

### 7.2 Product Visibility Rules

- Only products with `sell_online = true` and `status = active` appear in catalog.
- Out-of-stock: show “Out of stock” if `inventory_tracked` and `on_hand_quantity <= 0` (configurable: hide vs show).
- Services without inventory can be sold as fixed-price SKUs (e.g. compliance packages).

### 7.3 Catalog Features (Phase 1)

- Category filter (from `products.category`)
- Search by name / service code
- Sort: price asc/desc, name
- Product card: image, name, price (offer/total), GST note “excl. GST” or inclusive per setting
- Product detail: description, price breakdown, quantity selector, add to cart

### 7.4 Website Builder Integration

- New section type: **`shop_featured`** — featured products grid with “View shop” CTA.
- Store nav link in public site header when `store_settings.is_enabled`.
- Optional dedicated **Shop** page template in Website Builder.

---

## 8. Cart and Checkout

### 8.1 Cart Behavior

- Anonymous cart keyed by `session_id` (cookie).
- On customer login, merge anonymous cart into customer cart (higher qty wins per line).
- Cart expiry: 7 days inactive (configurable).
- Max quantity per line validated against stock if tracked.
- Price snapshot at add-to-cart; recalculate on checkout if product price changed (show warning).

### 8.2 Checkout Steps (Phase 1)

```
1. Cart review
2. Customer identity (guest: name, email, phone OR logged-in profile)
3. Shipping address (India: pincode, state, city)
4. Billing address (same as shipping toggle)
5. Shipping method (flat rate / free above threshold / pickup)
6. Order summary (subtotal, GST, shipping, total)
7. Payment method (COD, bank transfer, pay online Phase 2)
8. Place order → confirmation
```

### 8.3 GST / Tax Rules

- Use product `gst_rate` per line; compute CGST/SGST or IGST based on company state vs shipping state (same rules as Invoice Generator).
- B2B: optional GSTIN field on checkout; validate format; store on Contact.
- Display tax-inclusive vs exclusive per `store_settings` (default: exclusive + GST shown).

### 8.4 Order Placement Flow

```
Place order
  → Validate cart, stock, addresses
  → Create store_order (status: pending_payment or paid for COD)
  → Create/update Contact
  → Create Sales Order (optional config)
  → Reserve inventory (if enabled)
  → If auto_create_invoice: create Invoice draft
  → If payment completed: record store_payment, update invoice, mark paid
  → Clear cart
  → Return confirmation + order number
  → Activity log: store_order_placed
```

---

## 9. Payment

### 9.1 Payment Methods (Phase 1)

| Method | Behavior |
|--------|----------|
| **Cash on Delivery (COD)** | Order confirmed; payment_status unpaid until delivery collection |
| **Bank transfer / UPI manual** | Show company bank/UPI details; staff marks paid in CRM |
| **Pay online** | Phase 2 — Razorpay checkout |

### 9.2 Phase 2 — Payment Gateway

- Razorpay Orders API: create order, redirect/checkout modal, webhook `payment.captured`.
- On success: `store_payment.status = completed`, link to CRM `payments` record and invoice.
- On failure: order remains `pending_payment`; customer can retry.

### 9.3 Refunds

- Full or partial refund on approved return.
- Update `payment_status`, invoice credit note (Phase 2), `store_returns.refund_amount`.
- Activity log: `store_refund_issued`.

---

## 10. Delivery and Fulfillment

### 10.1 Order Fulfillment Statuses

| Status | Meaning |
|--------|---------|
| `pending_payment` | Awaiting payment (bank transfer) |
| `paid` | Payment received; ready to process |
| `processing` | Picking / packing |
| `shipped` | Handed to courier; tracking set |
| `delivered` | Customer received |
| `cancelled` | Cancelled before ship |
| `returned` | Return completed |

### 10.2 Shipping Configuration (Phase 1)

- Flat rate per order (e.g. ₹99).
- Free shipping above order value (e.g. ₹2,000).
- Pickup from office (₹0) — show company address.

### 10.3 CRM Actions

- Staff updates status, enters `tracking_number`, sets `shipped_at`.
- Optional email/WhatsApp notification Phase 2.
- Phase 2: trigger **Stock Out** movement when marked shipped.

---

## 11. Returns

### 11.1 Customer-Initiated Return (Public)

- From order detail (within return window, e.g. 7 days after delivery).
- Select items + quantity, reason, optional note.
- Creates `store_returns` with status `requested`.

### 11.2 Staff Return Workflow (CRM)

| Status | Action |
|--------|--------|
| `requested` | Manager reviews |
| `approved` | Customer ships back / schedule pickup Phase 2 |
| `rejected` | Reason recorded |
| `received` | Warehouse confirms receipt |
| `refunded` | Accountant processes refund |
| `closed` | Complete |

### 11.3 Business Rules

- Return window configurable (default 7 days from `delivered_at`).
- Non-returnable flag per product Phase 2.
- Partial returns allowed per line item.
- Restock inventory on `received` if product tracked.

---

## 12. Customer Accounts

### 12.1 Registration and Login

- Separate auth from CRM staff (`store_customers` table).
- Register: name, email, phone, password (bcrypt).
- Login: email + password → customer session JWT or secure cookie.
- Password reset via email Phase 2 (reuse forgot-password pattern).

### 12.2 Account Features (Phase 1)

- Profile: name, phone, email (read-only), GSTIN optional
- Saved addresses: add, edit, delete, set default
- Order history: list + detail with status timeline
- Reorder button Phase 2 (add past order lines to cart)

### 12.3 Contact Sync

- On first order or registration, create/update **Contact** with source `Online Store`.
- Link `store_customers.contact_id` for CRM 360° view.

---

## 13. Information Architecture and Navigation

### 13.1 CRM Sidebar (Staff)

| Route | Purpose |
|-------|---------|
| `/ecommerce` | Store dashboard (KPIs, recent orders) |
| `/ecommerce/orders` | Order list |
| `/ecommerce/orders/:id` | Order detail (ship, cancel, refund) |
| `/ecommerce/returns` | Returns queue |
| `/ecommerce/returns/:id` | Return detail |
| `/ecommerce/catalog` | Online product visibility manager |
| `/ecommerce/settings` | Store settings |

Sidebar label: **Online Store** (requires `ecommerce.view`).  
May be grouped under **Website** or standalone in Sales category.

### 13.2 Entry Points

- App launcher: **Online Store** tile
- Website dashboard: “Manage shop” link when store enabled
- Products detail: “Sell online” toggle and slug
- Contact detail: online orders tab Phase 2

---

## 14. Detailed Functional Requirements

### 14.1 Store Dashboard (CRM)

**KPI cards:** orders today, revenue (7d), pending shipment, open returns, unpaid orders.

**Recent orders table:** order #, customer, total, status, placed at.

**Quick actions:** View orders, configure store, open public shop.

### 14.2 Orders List (CRM)

- Filters: status, payment_status, date range, customer search
- Columns: order #, customer, items count, grand total, status, payment, placed at
- Export CSV Phase 2

### 14.3 Order Detail (CRM)

- Customer info, addresses, line items, tax breakdown
- Links to Sales Order, Invoice, Contact
- Actions: mark paid, mark processing, ship (tracking #), mark delivered, cancel
- Timeline of status changes
- Initiate return on behalf of customer (staff)

### 14.4 Catalog Manager (CRM)

- List products with `sell_online` toggle
- Bulk enable/disable
- Edit online slug, image URL, compare-at price
- Preview link to public product page

### 14.5 Store Settings (CRM)

- Enable/disable store
- Shipping rates, free shipping threshold
- Payment methods enabled
- Guest checkout on/off
- Return window days
- Auto-create sales order / invoice toggles
- Order numbering prefix

### 14.6 Permissions

| Permission | Capability |
|------------|------------|
| `ecommerce.view` | View dashboard, orders, returns, catalog |
| `ecommerce.manage_orders` | Update status, tracking, cancel |
| `ecommerce.manage_returns` | Approve/reject/process returns |
| `ecommerce.manage_catalog` | Toggle sell_online, edit store product fields |
| `ecommerce.manage_settings` | Store configuration |
| `ecommerce.record_payment` | Mark manual payments, refunds |

**Default matrix:**

| Role | view | manage_orders | manage_returns | manage_catalog | manage_settings | record_payment |
|------|------|---------------|----------------|----------------|-----------------|----------------|
| Admin | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Manager | ✓ | ✓ | ✓ | ✓ | — | ✓ |
| Sales | ✓ | ✓ | — | ✓ | — | — |
| Accountant | ✓ | — | ✓ | — | — | ✓ |
| Employee | ✓ | — | — | — | — | — |

---

## 15. UI / UX Requirements

### 15.1 Public Store

- Mobile-first product grid and sticky “Add to cart” on detail
- Clear INR pricing and GST line in checkout summary
- Trust signals: company name, GSTIN in footer, secure checkout note
- Empty cart and empty order states with CTA to shop
- Guest checkout prominent; optional “Create account” after order

### 15.2 CRM Admin

- Order status badges consistent with Sales Order patterns
- One-click copy tracking number
- Confirm dialogs on cancel and refund

---

## 16. Validation and Business Rules

1. Store must be `is_enabled` for public catalog/checkout APIs.
2. Cart line quantity ≥ 1; max per product configurable (default 99).
3. Cannot checkout empty cart.
4. Guest checkout requires name, email, phone, shipping address.
5. PIN code 6 digits for India shipping.
6. Order totals recalculated server-side; never trust client totals.
7. Cancel only before `shipped` unless manager override.
8. Return quantity ≤ ordered quantity minus already returned.
9. `sell_online` products must have price > 0.
10. All queries scoped by `company_id`.

---

## 17. Integration Points

### 17.1 API Endpoints (Proposed)

**Public**

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/public/{slug}/shop/products` | Catalog list |
| GET | `/public/{slug}/shop/products/{product_slug}` | Product detail |
| GET | `/public/{slug}/cart` | Get cart |
| POST | `/public/{slug}/cart/items` | Add line |
| PUT | `/public/{slug}/cart/items/{id}` | Update qty |
| DELETE | `/public/{slug}/cart/items/{id}` | Remove line |
| POST | `/public/{slug}/checkout` | Place order |
| POST | `/public/{slug}/account/register` | Customer register |
| POST | `/public/{slug}/account/login` | Customer login |
| GET | `/public/{slug}/account/orders` | Customer orders (auth) |
| POST | `/public/{slug}/account/orders/{order_number}/returns` | Request return |

**Authenticated (CRM staff)**

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/ecommerce/dashboard` | KPIs |
| GET | `/ecommerce/orders` | List orders |
| GET | `/ecommerce/orders/{id}` | Order detail |
| PUT | `/ecommerce/orders/{id}/status` | Update fulfillment |
| POST | `/ecommerce/orders/{id}/payment` | Record payment |
| GET | `/ecommerce/returns` | Returns list |
| PUT | `/ecommerce/returns/{id}` | Approve/reject/refund |
| GET | `/ecommerce/catalog` | Online products |
| PUT | `/ecommerce/catalog/{product_id}` | Update online fields |
| GET/PUT | `/ecommerce/settings` | Store settings |

### 17.2 Implementation Alignment

**Builds on (existing)**

- `products` table — extend with online fields
- `Website Builder` — public routes, branding, `company_slug`
- `SalesOrder`, `Invoice`, `Payment` — order sync
- `Contact` — customer identity
- `inventory` — stock checks and movements
- `permissions_data.py`, `activity.py` patterns

**New (greenfield)**

- Store tables listed in §6.2
- `ecommerce_router.py`, `public_ecommerce_router.py`
- `ecommerce_config.py`
- Frontend: `ShopCatalog.jsx`, `Cart.jsx`, `Checkout.jsx`, `CustomerAccount.jsx`, CRM `EcommerceOrders.jsx`, etc.

---

## 18. Reporting and Insights

### Phase 1

- Dashboard KPIs: order count, revenue, AOV (average order value)
- Orders list filters and totals

### Phase 2

- Online vs offline revenue in Sales Reports
- Conversion funnel: shop views → cart → checkout → paid
- Top products by units/revenue
- Return rate by product
- CSV export orders

---

## 19. Release Phasing

### Phase 1 (MVP)

- Store settings (enable, shipping flat rate)
- Product `sell_online` flag and catalog manager
- Public catalog + product detail + cart
- Guest checkout (COD + bank transfer manual)
- Customer accounts (register, login, orders, addresses)
- CRM order list and detail
- Create Contact + Sales Order on place order
- Manual mark paid, ship, deliver
- Basic return request + staff approve/reject
- Activity logs on key events

### Phase 2

- Razorpay / UPI online payment + webhooks
- Auto invoice issue on payment
- Inventory reserve on checkout, stock-out on ship
- Email order confirmation and shipping updates
- Coupons / discount codes
- Abandoned cart report
- Reorder from account
- Sales Reports online channel widget

### Phase 3

- Advanced shipping zones and courier API
- BNPL, wallets
- Product reviews
- Subscription products
- Multi-warehouse fulfillment rules
- Marketplace seller onboarding (if product direction changes)

---

## 20. UAT Acceptance Checklist

1. Admin can enable store in settings and set flat shipping rate.
2. Admin can mark products `sell_online` and they appear on `/s/{slug}/shop`.
3. Guest can add products to cart and update quantities.
4. Guest can complete checkout with COD; order appears in CRM `/ecommerce/orders`.
5. Order creates or updates a **Contact** with source Online Store.
6. Staff can mark order paid, shipped (with tracking), and delivered.
7. Customer can register, login, and see order history.
8. Customer can request return on delivered order within window.
9. Manager can approve return and accountant can mark refunded.
10. GST totals on order match product GST rates.
11. Inventory-tracked product blocks checkout when out of stock (if configured).
12. Store disabled returns 404 on shop routes.
13. Cross-company order access is blocked.
14. Activity log records order placed and status changes.

---

## 21. Open Product Questions

1. Should every web order create a **Sales Order**, **Invoice**, or both by default?
2. **COD** orders: confirm on place or on manager review?
3. **Services** (non-inventory) sold online — same checkout or quote-only fallback?
4. **Guest vs login** required for B2B GSTIN orders?
5. Which **payment gateway** first — Razorpay only or multiple?
6. **Return shipping** cost: customer bears or free return threshold?
7. Should online customers use same **User** table with role `Customer` or separate `store_customers`? (PRD assumes separate.)
8. Integrate **Website Builder** `services_grid` “Buy” button vs separate shop only?
9. **Invoice PDF** auto-email to customer on payment?
10. Plan limits for multi-tenant: max orders/month on free tier?

---

## Appendix A: Example Customer Journey

1. Visitor opens `https://app.blackpapers.in/s/blackpapers/shop`.
2. Browses GST registration service package, adds to cart.
3. Proceeds to checkout as guest, enters Mumbai address.
4. Selects bank transfer, places order → `WEB-2026-0042`.
5. CRM: new order in **Online Store**, Contact created, Sales Order draft.
6. Accountant marks payment received → invoice issued.
7. Operations marks **shipped** with Delhivery tracking ID.
8. Customer registers with same email → sees order in **My orders**.
9. After delivery, customer requests return → manager approves → refund recorded.

---

## Appendix B: Order Status Timeline (UI)

```
placed → pending_payment → paid → processing → shipped → delivered
                              ↘ cancelled
                              ↘ returned (via return workflow)
```

---

## Appendix C: Starter Permissions Seed

```python
ECOMMERCE_PERMISSIONS = [
    ("ecommerce.view", "View online store dashboard and orders"),
    ("ecommerce.manage_orders", "Update order fulfillment and cancel orders"),
    ("ecommerce.manage_returns", "Approve and process returns"),
    ("ecommerce.manage_catalog", "Manage products sold online"),
    ("ecommerce.manage_settings", "Configure store settings"),
    ("ecommerce.record_payment", "Record payments and refunds for web orders"),
]
```

---

## Appendix D: Alignment with Product Roadmap

| Roadmap item | eCommerce contribution |
|--------------|----------------------|
| Website Builder | Shop on public site; extends marketing to transactions |
| Products / Services | Single catalogue for CRM + online |
| Inventory | Stock-aware selling |
| Invoices / GST | Compliant online billing |
| Payments | Unified payment tracking |
| Multi-tenant SaaS | Each tenant runs own storefront |
| Lead capture | Checkout abandons → leads Phase 2 |

---

## Appendix E: Relationship to Website Builder PRD

| Website Builder (done / planned) | eCommerce (this PRD) |
|----------------------------------|----------------------|
| Landing pages, blog, forms | Product catalog + cart |
| `services_grid` display only | Buy button + checkout |
| Leads from forms | Orders + Contacts from checkout |
| Public `/s/{slug}` | Public `/s/{slug}/shop` |
| Out of scope: checkout Phase 1 | In scope: full commerce layer |

---

*End of PRD — eCommerce v1.0*
