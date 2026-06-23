"""
Seed demo data for Level 3: expenses, purchase orders, vendor bills,
inventory, stock movements, and warehouses.

Prerequisites: seed_company, seed_permissions, seed_master_employees,
seed_clients, seed_master_services, seed_demo_level2 (recommended for tax/ledger reports).

Use: python seed_demo_level3.py --reset
"""

from __future__ import annotations

import sys
from datetime import datetime, timedelta, timezone
from decimal import Decimal

from database import SessionLocal
from models import (
    Company,
    Contact,
    Expense,
    LocationStock,
    LocationStockMovement,
    Product,
    PurchaseOrder,
    PurchaseOrderBilling,
    PurchaseOrderLineItem,
    PurchaseOrderReceipt,
    StockMovement,
    User,
    VendorBill,
    VendorBillLineItem,
    VendorBillPayment,
    WarehouseLocation,
)

DEMO_MARKER = "[demo-level3]"
YEAR = datetime.now(timezone.utc).year


def _user(db, email: str) -> User | None:
    return db.query(User).filter(User.email == email).first()


def _line_totals(qty: float, unit_price: float, tax_rate: float = 18.0) -> dict:
    subtotal = Decimal(str(qty)) * Decimal(str(unit_price))
    tax = subtotal * Decimal(str(tax_rate)) / Decimal("100")
    total = subtotal + tax
    return {"line_subtotal": subtotal, "line_total": total, "tax": tax}


def _sum_po_lines(lines: list[dict]) -> dict:
    subtotal = sum(l["line_subtotal"] for l in lines)
    tax = sum(l["tax"] for l in lines)
    return {"subtotal": subtotal, "total_tax": tax, "grand_total": subtotal + tax}


def _apply_product_stock(
    db,
    *,
    product: Product,
    user: User,
    movement_type: str,
    direction: str,
    quantity: float,
    unit_value: float,
    movement_date: datetime,
    notes: str,
    reason: str | None = None,
) -> StockMovement:
    before = float(product.on_hand_quantity or 0)
    delta = quantity if direction == "in" else -quantity
    after = before + delta
    movement = StockMovement(
        company_id=product.company_id,
        product_id=product.id,
        recorded_by_id=user.id,
        movement_type=movement_type,
        direction=direction,
        quantity=Decimal(str(quantity)),
        unit_value=Decimal(str(unit_value)),
        total_value=Decimal(str(quantity * unit_value)),
        quantity_before=Decimal(str(before)),
        quantity_after=Decimal(str(after)),
        movement_date=movement_date,
        source_module="seed",
        notes=notes,
        reason=reason,
    )
    db.add(movement)
    product.on_hand_quantity = Decimal(str(after))
    product.unit_valuation = Decimal(str(unit_value))
    product.last_movement_at = movement_date
    if movement_type == "opening":
        product.opening_recorded = True
        product.inventory_tracked = True
    return movement


def _clear_demo(db, company_id: int) -> None:
    bills = db.query(VendorBill).filter(
        VendorBill.company_id == company_id,
        VendorBill.internal_notes.like(f"%{DEMO_MARKER}%"),
    ).all()
    for bill in bills:
        db.delete(bill)
    db.commit()

    pos = db.query(PurchaseOrder).filter(
        PurchaseOrder.company_id == company_id,
        PurchaseOrder.notes.like(f"%{DEMO_MARKER}%"),
    ).all()
    for po in pos:
        db.delete(po)
    db.commit()

    expenses = db.query(Expense).filter(
        Expense.company_id == company_id,
        Expense.notes.like(f"%{DEMO_MARKER}%"),
    ).all()
    for exp in expenses:
        db.delete(exp)
    db.commit()

    loc_moves = db.query(LocationStockMovement).filter(
        LocationStockMovement.company_id == company_id,
        LocationStockMovement.notes.like(f"%{DEMO_MARKER}%"),
    ).all()
    for m in loc_moves:
        db.delete(m)
    db.commit()

    stocks = db.query(LocationStock).join(Product).filter(
        Product.description.like(f"%{DEMO_MARKER}%"),
    ).all()
    for s in stocks:
        db.delete(s)
    db.commit()

    movements = db.query(StockMovement).filter(
        StockMovement.company_id == company_id,
        StockMovement.notes.like(f"%{DEMO_MARKER}%"),
    ).all()
    for m in movements:
        db.delete(m)
    db.commit()

    locations = db.query(WarehouseLocation).filter(
        WarehouseLocation.company_id == company_id,
        WarehouseLocation.notes.like(f"%{DEMO_MARKER}%"),
    ).order_by(WarehouseLocation.id.desc()).all()
    for loc in locations:
        db.delete(loc)
    db.commit()

    products = db.query(Product).filter(
        Product.company_id == company_id,
        Product.description.like(f"%{DEMO_MARKER}%"),
    ).all()
    for p in products:
        p.inventory_tracked = False
        p.on_hand_quantity = Decimal("0")
        p.opening_recorded = False
        p.unit_valuation = Decimal("0")
        db.delete(p)
    db.commit()

    vendors = db.query(Contact).filter(
        Contact.company_id == company_id,
        Contact.email.like("demo-vendor-%@blackpapers.demo"),
    ).all()
    for v in vendors:
        db.delete(v)
    db.commit()


def seed(*, reset: bool = False):
    db = SessionLocal()
    try:
        company = db.query(Company).first()
        if not company:
            print("Company not found — run seed_company.py first.")
            return

        existing = (
            db.query(Expense)
            .filter(Expense.company_id == company.id, Expense.notes.like(f"%{DEMO_MARKER}%"))
            .count()
        )
        if existing and not reset:
            print(f"Demo Level 3 data exists ({existing} expenses) — skipping. Use --reset to replace.")
            return

        if reset and existing:
            _clear_demo(db, company.id)
            print("Cleared existing demo Level 3 records.")

        admin = _user(db, "hr@blackpapers.in") or db.query(User).filter(User.role == "Admin").first()
        manager = _user(db, "manager@crm.com") or admin
        palak = _user(db, "bgc.blackpapers01@gmail.com") or admin
        anita = _user(db, "bgc.blackpapers02@gmail.com") or admin
        gunjan = _user(db, "exe.blackpapers01@gmail.com") or admin

        now = datetime.now(timezone.utc)
        marker_note = f"{DEMO_MARKER} Demo record for Level 3 accounting & inventory modules."

        # --- Vendor contacts ---
        vendor_specs = [
            {
                "name": "Rajesh Kumar",
                "organization_name": "PrintPro Stationery Pvt Ltd",
                "email": "demo-vendor-printpro@blackpapers.demo",
                "phone": "9876501001",
                "gstin": "07AABCP1234F1Z5",
                "city": "New Delhi",
            },
            {
                "name": "Meera Shah",
                "organization_name": "TechSupply India",
                "email": "demo-vendor-techsupply@blackpapers.demo",
                "phone": "9876501002",
                "gstin": "09AABCT5678G1Z9",
                "city": "Noida",
            },
            {
                "name": "Vikram Desai",
                "organization_name": "SecurePack Logistics",
                "email": "demo-vendor-securepack@blackpapers.demo",
                "phone": "9876501003",
                "gstin": "27AABCS9012H1Z3",
                "city": "Mumbai",
            },
        ]
        vendors: list[Contact] = []
        for spec in vendor_specs:
            v = Contact(
                company_id=company.id,
                created_by_id=admin.id,
                assigned_to_id=gunjan.id,
                contact_type="Vendor",
                status="active",
                **spec,
            )
            db.add(v)
            vendors.append(v)
        db.flush()

        # --- Inventory products ---
        product_specs = [
            ("INV-001", "A4 Paper Ream (500 sheets)", "Unit", 280.0, 50, 20),
            ("INV-002", "GST Invoice Printer Toner", "Unit", 3200.0, 12, 5),
            ("INV-003", "Compliance File Box (pack of 10)", "Unit", 450.0, 80, 25),
        ]
        products: list[Product] = []
        for code, name, unit, price, opening_qty, reorder in product_specs:
            p = Product(
                company_id=company.id,
                service_code=code,
                name=name,
                category="Office & Supplies",
                sub_category="Inventory",
                unit=unit,
                offer_price=Decimal(str(price)),
                total_price=Decimal(str(price * 1.18)),
                gst_rate=Decimal("18"),
                status="active",
                inventory_tracked=True,
                on_hand_quantity=Decimal("0"),
                unit_valuation=Decimal(str(price)),
                reorder_level=Decimal(str(reorder)),
                opening_recorded=False,
                description=f"{DEMO_MARKER} Demo inventory product.",
            )
            db.add(p)
            products.append(p)
        db.flush()

        paper, toner, filebox = products

        # --- Warehouse locations ---
        branch = WarehouseLocation(
            company_id=company.id,
            created_by_id=admin.id,
            location_code="BP-DEL-HQ",
            name="BlackPapers Delhi HQ",
            location_type="branch",
            status="active",
            address="Connaught Place, New Delhi",
            is_default_receiving=True,
            notes=marker_note,
        )
        db.add(branch)
        db.flush()

        warehouse = WarehouseLocation(
            company_id=company.id,
            parent_id=branch.id,
            created_by_id=admin.id,
            location_code="WH-MAIN-01",
            name="Main Storage Warehouse",
            location_type="warehouse",
            status="active",
            is_default_dispatch=True,
            notes=marker_note,
        )
        db.add(warehouse)
        db.flush()

        bin_rack = WarehouseLocation(
            company_id=company.id,
            parent_id=warehouse.id,
            created_by_id=admin.id,
            location_code="RACK-A-01",
            name="Rack A — Stationery",
            location_type="rack",
            status="active",
            notes=marker_note,
        )
        db.add(bin_rack)
        db.flush()

        # --- Opening stock + warehouse placement ---
        for product, qty, loc in [
            (paper, 50, bin_rack),
            (toner, 12, warehouse),
            (filebox, 80, bin_rack),
        ]:
            price = float(product.unit_valuation)
            _apply_product_stock(
                db,
                product=product,
                user=admin,
                movement_type="opening",
                direction="in",
                quantity=qty,
                unit_value=price,
                movement_date=now - timedelta(days=30),
                notes=marker_note,
                reason="opening_balance",
            )
            ls = LocationStock(
                company_id=company.id,
                product_id=product.id,
                location_id=loc.id,
                on_hand_quantity=Decimal(str(qty)),
                unit_valuation=Decimal(str(price)),
                reorder_level=product.reorder_level,
                last_movement_at=now - timedelta(days=30),
            )
            db.add(ls)
            db.add(
                LocationStockMovement(
                    company_id=company.id,
                    product_id=product.id,
                    location_id=loc.id,
                    recorded_by_id=admin.id,
                    movement_type="receipt",
                    direction="in",
                    quantity=Decimal(str(qty)),
                    unit_value=Decimal(str(price)),
                    total_value=Decimal(str(qty * price)),
                    quantity_before=Decimal("0"),
                    quantity_after=Decimal(str(qty)),
                    movement_date=now - timedelta(days=30),
                    notes=marker_note,
                    reason="opening_balance",
                )
            )

        # Recent stock out (consumption)
        _apply_product_stock(
            db,
            product=paper,
            user=palak,
            movement_type="sale",
            direction="out",
            quantity=5,
            unit_value=float(paper.unit_valuation),
            movement_date=now - timedelta(days=3),
            notes=marker_note,
            reason="internal_consumption",
        )
        paper_ls = db.query(LocationStock).filter_by(product_id=paper.id, location_id=bin_rack.id).first()
        if paper_ls:
            paper_ls.on_hand_quantity = Decimal("45")

        # --- Expenses (8 across statuses) ---
        expense_specs = [
            ("Travel — client visit Gurgaon", "travel", vendors[0].organization_name, 2450, "submitted", palak, 8),
            ("Team lunch — quarterly review", "meals_entertainment", "Cafe Delhi Heights", 3680, "under_review", anita, 5),
            ("Microsoft 365 subscription", "software_subscriptions", "Microsoft India", 12999, "approved", gunjan, 12),
            ("Courier — document dispatch", "logistics_courier", vendors[2].organization_name, 890, "paid", palak, 20),
            ("Office printer repair", "repairs_maintenance", "Delhi Tech Services", 4500, "rejected", anita, 15),
            ("Facebook ads — lead campaign", "marketing", "Meta Platforms", 15000, "draft", gunjan, 2),
            ("Client gift hampers — Diwali", "client_gifts", vendors[0].organization_name, 8800, "approved", manager, 10),
            ("Petty cash — pantry supplies", "office_supplies", "Local Mart", 1250, "paid", palak, 25),
        ]
        expense_rows: list[Expense] = []
        for idx, (title, cat, vendor, amount, status, submitter, days_ago) in enumerate(expense_specs, 1):
            exp_date = now - timedelta(days=days_ago)
            exp = Expense(
                company_id=company.id,
                submitted_by_id=submitter.id,
                expense_number=f"EXP-{YEAR}-{idx:05d}" if status != "draft" else None,
                title=title,
                category=cat,
                vendor_name=vendor,
                amount=Decimal(str(amount)),
                tax_amount=Decimal(str(round(amount * 0.18, 2))) if cat == "software_subscriptions" else Decimal("0"),
                expense_date=exp_date,
                payment_mode="company_card" if status == "paid" else "personal_reimbursement",
                status=status,
                notes=marker_note,
                cost_center="Operations",
                submitted_at=exp_date if status != "draft" else None,
                reviewed_at=exp_date + timedelta(hours=4) if status in ("under_review", "approved", "rejected", "paid") else None,
                reviewed_by_id=manager.id if status in ("under_review", "approved", "rejected", "paid") else None,
                approved_at=exp_date + timedelta(days=1) if status in ("approved", "paid") else None,
                approved_by_id=manager.id if status in ("approved", "paid") else None,
                paid_at=exp_date + timedelta(days=3) if status == "paid" else None,
                paid_by_id=admin.id if status == "paid" else None,
                rejection_reason="Missing GST invoice copy" if status == "rejected" else None,
            )
            db.add(exp)
            expense_rows.append(exp)
        db.flush()

        # --- Purchase orders ---
        def _add_po(
            seq: int,
            title: str,
            vendor: Contact,
            status: str,
            lines: list[tuple],
            *,
            received_pct: float = 0,
            billed_pct: float = 0,
            creator=gunjan,
        ) -> PurchaseOrder:
            line_rows = []
            for i, (desc, qty, price, product_id) in enumerate(lines):
                lt = _line_totals(qty, price)
                line_rows.append({
                    "description": desc,
                    "ordered_quantity": qty,
                    "unit_price": price,
                    "line_subtotal": lt["line_subtotal"],
                    "line_total": lt["line_total"],
                    "tax": lt["tax"],
                    "product_id": product_id,
                })
            totals = _sum_po_lines(line_rows)
            po_date = now - timedelta(days=20 - seq)
            po = PurchaseOrder(
                company_id=company.id,
                created_by_id=creator.id,
                contact_id=vendor.id,
                po_number=f"PO-{YEAR}-{seq:05d}" if status != "draft" else None,
                title=title,
                vendor_name=vendor.organization_name or vendor.name,
                vendor_email=vendor.email,
                vendor_phone=vendor.phone,
                status=status,
                payment_terms="net_30",
                po_date=po_date,
                expected_delivery_date=po_date + timedelta(days=14),
                delivery_location="BlackPapers Delhi HQ",
                notes=marker_note,
                subtotal=totals["subtotal"],
                total_tax=totals["total_tax"],
                grand_total=totals["grand_total"],
                submitted_at=po_date if status != "draft" else None,
                approved_at=po_date + timedelta(days=1) if status not in ("draft", "submitted", "rejected") else None,
                approved_by_id=manager.id if status not in ("draft", "submitted", "rejected") else None,
                sent_at=po_date + timedelta(days=2) if status not in ("draft", "submitted", "under_review", "rejected", "approved") else None,
                sent_by_id=gunjan.id if status not in ("draft", "submitted", "under_review", "rejected", "approved") else None,
            )
            db.add(po)
            db.flush()
            po_lines: list[PurchaseOrderLineItem] = []
            for i, lr in enumerate(line_rows):
                li = PurchaseOrderLineItem(
                    purchase_order_id=po.id,
                    product_id=lr["product_id"],
                    sort_order=i,
                    description=lr["description"],
                    ordered_quantity=Decimal(str(lr["ordered_quantity"])),
                    unit_price=Decimal(str(lr["unit_price"])),
                    tax_rate=Decimal("18"),
                    line_subtotal=lr["line_subtotal"],
                    line_total=lr["line_total"],
                )
                db.add(li)
                po_lines.append(li)
            db.flush()

            if received_pct > 0:
                for li in po_lines:
                    rq = float(li.ordered_quantity) * received_pct
                    li.received_quantity = Decimal(str(rq))
                    db.add(PurchaseOrderReceipt(
                        purchase_order_id=po.id,
                        line_item_id=li.id,
                        recorded_by_id=admin.id,
                        quantity=Decimal(str(rq)),
                        receipt_date=po_date + timedelta(days=7),
                        grn_reference=f"GRN-{seq:03d}",
                        notes=marker_note,
                    ))
                po.received_value = totals["grand_total"] * Decimal(str(received_pct))

            if billed_pct > 0:
                for li in po_lines:
                    bq = float(li.ordered_quantity) * billed_pct
                    amt = float(li.line_total) * billed_pct
                    li.billed_quantity = Decimal(str(bq))
                    li.billed_amount = Decimal(str(amt))
                    db.add(PurchaseOrderBilling(
                        purchase_order_id=po.id,
                        line_item_id=li.id,
                        recorded_by_id=admin.id,
                        quantity=Decimal(str(bq)),
                        amount=Decimal(str(amt)),
                        bill_reference=f"BILL-REF-{seq:03d}",
                        notes=marker_note,
                    ))
                po.billed_value = totals["grand_total"] * Decimal(str(billed_pct))
            return po

        po1 = _add_po(
            1, "Office stationery Q1 replenishment", vendors[0], "partially_billed",
            [("A4 Paper Ream", 100, 280, paper.id), ("File boxes pack", 20, 450, filebox.id)],
            received_pct=1.0, billed_pct=0.5,
        )
        po2 = _add_po(
            2, "Printer toner bulk order", vendors[1], "partially_received",
            [("GST Invoice Printer Toner", 8, 3200, toner.id)],
            received_pct=0.5,
        )
        po3 = _add_po(
            3, "Packaging material — compliance kits", vendors[2], "sent_to_vendor",
            [("Compliance file boxes", 50, 450, filebox.id)],
        )
        po4 = _add_po(
            4, "Annual software licenses (hardware tokens)", vendors[1], "approved",
            [("USB security token", 10, 1500, None)],
        )
        po5 = _add_po(
            5, "Emergency stationery top-up", vendors[0], "draft",
            [("A4 Paper Ream", 30, 280, paper.id)],
            creator=palak,
        )
        db.flush()

        # --- Vendor bills ---
        def _add_bill(
            seq: int,
            title: str,
            vendor: Contact,
            status: str,
            lines: list[tuple],
            *,
            po: PurchaseOrder | None = None,
            paid_amount: float = 0,
        ) -> VendorBill:
            line_rows = []
            for desc, qty, price in lines:
                lt = _line_totals(qty, price)
                line_rows.append({
                    "description": desc,
                    "quantity": qty,
                    "unit_price": price,
                    "line_subtotal": lt["line_subtotal"],
                    "line_total": lt["line_total"],
                })
            subtotal = sum(r["line_subtotal"] for r in line_rows)
            total_tax = sum(_line_totals(r["quantity"], r["unit_price"])["tax"] for r in line_rows)
            grand = subtotal + total_tax
            bill_date = now - timedelta(days=18 - seq)
            due = bill_date + timedelta(days=30)
            outstanding = grand - Decimal(str(paid_amount))
            bill = VendorBill(
                company_id=company.id,
                created_by_id=gunjan.id,
                contact_id=vendor.id,
                purchase_order_id=po.id if po else None,
                bill_number=f"VB-{YEAR}-{seq:05d}" if status != "draft" else None,
                supplier_invoice_number=f"SUP-INV-{2026000 + seq}",
                title=title,
                status="overdue" if status == "approved" and outstanding > 0 and due < now else status,
                bill_date=bill_date,
                due_date=due,
                payment_terms="Net 30",
                vendor_name=vendor.organization_name or vendor.name,
                vendor_email=vendor.email,
                vendor_gstin=vendor.gstin,
                vendor_address=vendor.city,
                subtotal=subtotal,
                total_tax=total_tax,
                grand_total=grand,
                amount_paid=Decimal(str(paid_amount)),
                outstanding_amount=outstanding if status not in ("draft", "cancelled") else grand,
                internal_notes=marker_note,
                submitted_at=bill_date if status != "draft" else None,
                approved_at=bill_date + timedelta(days=1) if status not in ("draft", "submitted", "rejected") else None,
                approved_by_id=manager.id if status not in ("draft", "submitted", "rejected") else None,
                last_payment_at=bill_date + timedelta(days=5) if paid_amount > 0 else None,
            )
            if paid_amount >= float(grand):
                bill.status = "paid"
                bill.outstanding_amount = Decimal("0")
            elif paid_amount > 0:
                bill.status = "partially_paid"
            db.add(bill)
            db.flush()
            for i, lr in enumerate(line_rows):
                db.add(VendorBillLineItem(
                    vendor_bill_id=bill.id,
                    sort_order=i,
                    description=lr["description"],
                    quantity=Decimal(str(lr["quantity"])),
                    unit_price=Decimal(str(lr["unit_price"])),
                    tax_rate=Decimal("18"),
                    line_subtotal=lr["line_subtotal"],
                    line_total=lr["line_total"],
                ))
            if paid_amount > 0:
                db.add(VendorBillPayment(
                    vendor_bill_id=bill.id,
                    recorded_by_id=admin.id,
                    amount=Decimal(str(paid_amount)),
                    payment_date=bill_date + timedelta(days=5),
                    payment_method="bank_transfer",
                    reference=f"NEFT-{seq:04d}",
                    note=marker_note,
                ))
            return bill

        _add_bill(
            1, "Stationery invoice — partial PO #1", vendors[0], "partially_paid",
            [("A4 Paper Ream", 50, 280), ("File boxes pack", 10, 450)],
            po=po1, paid_amount=20000,
        )
        _add_bill(
            2, "Toner delivery — 4 units", vendors[1], "approved",
            [("GST Invoice Printer Toner", 4, 3200)],
            po=po2, paid_amount=0,
        )
        _add_bill(
            3, "Logistics — secure packaging", vendors[2], "paid",
            [("Corrugated boxes & tape", 1, 12500)],
            paid_amount=14750,
        )
        _add_bill(
            4, "Software token invoice", vendors[1], "draft",
            [("USB security token", 10, 1500)],
        )
        _add_bill(
            5, "Overdue — printer maintenance AMC", vendors[1], "approved",
            [("Annual maintenance contract", 1, 18000)],
            paid_amount=0,
        )
        # Make bill 5 overdue
        overdue_bill = db.query(VendorBill).filter(VendorBill.bill_number == f"VB-{YEAR}-00005").first()
        if overdue_bill:
            overdue_bill.due_date = now - timedelta(days=15)
            overdue_bill.status = "overdue"
            overdue_bill.outstanding_amount = overdue_bill.grand_total

        db.commit()
        print(
            "Seeded Level 3 demo data:\n"
            f"  - {len(vendors)} vendor contacts\n"
            f"  - {len(products)} inventory products (with opening stock)\n"
            f"  - 3 warehouse locations\n"
            f"  - {len(expense_specs)} expenses\n"
            f"  - 5 purchase orders\n"
            f"  - 5 vendor bills\n"
            "  - stock movements + location stock"
        )
    finally:
        db.close()


if __name__ == "__main__":
    seed(reset="--reset" in sys.argv)
