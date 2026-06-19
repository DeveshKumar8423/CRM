"""
Seed demo data for Level 2 modules: quotations, sales orders, invoices, client notes.
Uses existing manager data: contacts, products, deals, staff.

Safe to re-run: skips if demo records exist (marked in internal_notes).
Use: python seed_demo_level2.py --reset
"""

from __future__ import annotations

import secrets
import sys
from datetime import datetime, timedelta, timezone
from decimal import Decimal

from database import SessionLocal
from models import (
    ClientNote,
    Company,
    Contact,
    Deal,
    Invoice,
    InvoiceLineItem,
    InvoicePayment,
    Product,
    Quotation,
    QuotationLineItem,
    SalesOrder,
    SalesOrderLineItem,
    SalesOrderMilestone,
    SystemSetting,
    User,
)
from quotation_config import DEFAULT_PAYMENT_TERMS, DEFAULT_VALIDITY_CLAUSE, DEFAULT_LEGAL_FOOTER

DEMO_MARKER = "[demo-level2]"


def _user(db, email: str) -> User | None:
    return db.query(User).filter(User.email == email).first()


def _line_totals(qty: float, unit_price: float, tax_rate: float = 18.0) -> dict:
    subtotal = Decimal(str(qty)) * Decimal(str(unit_price))
    tax = subtotal * Decimal(str(tax_rate)) / Decimal("100")
    total = subtotal + tax
    return {
        "line_subtotal": subtotal,
        "line_total": total,
        "tax": tax,
    }


def _sum_lines(lines: list[dict]) -> dict:
    subtotal = sum(l["line_subtotal"] for l in lines)
    tax = sum(l["tax"] for l in lines)
    grand = subtotal + tax
    return {
        "subtotal": subtotal,
        "total_tax": tax,
        "grand_total": grand,
    }


def _quote_number(db, company_id: int, seq: int) -> str:
    settings = db.query(SystemSetting).filter(SystemSetting.company_id == company_id).first()
    prefix = settings.quote_prefix if settings else "Quote-"
    return f"{prefix}{seq:05d}"


def _order_number(seq: int) -> str:
    return f"SO-{seq:05d}"


def _invoice_number(db, company_id: int, seq: int) -> str:
    settings = db.query(SystemSetting).filter(SystemSetting.company_id == company_id).first()
    prefix = settings.invoice_prefix if settings else "Inv-"
    return f"{prefix}{seq:05d}"


def _clear_demo(db, company_id: int) -> None:
    demo_notes = db.query(ClientNote).filter(
        ClientNote.company_id == company_id,
        ClientNote.body.like(f"%{DEMO_MARKER}%"),
    ).all()
    for note in demo_notes:
        db.delete(note)
    db.commit()

    demo_invoices = db.query(Invoice).filter(
        Invoice.company_id == company_id,
        Invoice.internal_notes.like(f"%{DEMO_MARKER}%"),
    ).all()
    for inv in demo_invoices:
        db.delete(inv)
    db.commit()

    demo_orders = db.query(SalesOrder).filter(
        SalesOrder.company_id == company_id,
        SalesOrder.internal_notes.like(f"%{DEMO_MARKER}%"),
    ).all()
    for order in demo_orders:
        db.delete(order)
    db.commit()

    demo_quotes = db.query(Quotation).filter(
        Quotation.company_id == company_id,
        Quotation.internal_notes.like(f"%{DEMO_MARKER}%"),
    ).all()
    for quote in demo_quotes:
        db.delete(quote)
    db.commit()


def seed(*, reset: bool = False):
    db = SessionLocal()
    try:
        company = db.query(Company).first()
        if not company:
            print("Company not found — run seed_company.py first.")
            return

        existing = (
            db.query(Quotation)
            .filter(Quotation.company_id == company.id, Quotation.internal_notes.like(f"%{DEMO_MARKER}%"))
            .count()
        )
        if existing and not reset:
            print(f"Demo Level 2 data already exists ({existing} quotations) — skipping.")
            print("Run: python seed_demo_level2.py --reset")
            return

        if reset and existing:
            _clear_demo(db, company.id)
            print("Cleared existing demo Level 2 records.")

        creator = _user(db, "hr@blackpapers.in") or db.query(User).filter(User.role == "Admin").first()
        manager = _user(db, "manager@crm.com")
        palak = _user(db, "bgc.blackpapers01@gmail.com")
        anita = _user(db, "bgc.blackpapers02@gmail.com")
        gunjan = _user(db, "exe.blackpapers01@gmail.com")
        mohini = _user(db, "exe.blackpapers02@gmail.com")
        isha = _user(db, "hr@blackpapers.in")

        deal_proposal = db.query(Deal).filter(Deal.id == 13).first()
        deal_won_aadi = db.query(Deal).filter(Deal.id == 14).first()
        deal_won_ashapuri = db.query(Deal).filter(Deal.id == 15).first()
        deal_meeting = db.query(Deal).filter(Deal.id == 12).first()
        contact_aadi = db.query(Contact).filter(Contact.id == 7).first()
        contact_ashapuri = db.query(Contact).filter(Contact.id == 4).first()
        contact_aadhar = db.query(Contact).filter(Contact.id == 5).first()

        prod_ngo = db.query(Product).filter(Product.id == 4).first()
        prod_12a = db.query(Product).filter(Product.id == 2).first()
        prod_accounting = db.query(Product).filter(Product.id == 8).first()
        prod_trademark = db.query(Product).filter(Product.id == 3).first()

        now = datetime.now(timezone.utc)

        # --- Quotations (5 across statuses) ---
        quote_specs = [
            {
                "num": 1,
                "title": "Startup compliance bundle — Akhilesh Kumar",
                "status": "draft",
                "deal": deal_proposal,
                "contact": None,
                "assignee": gunjan,
                "products": [(prod_12a, 1), (prod_accounting, 1)],
                "client_name": "Akhilesh Kumar",
                "client_org": None,
            },
            {
                "num": 2,
                "title": "Company incorporation — MASTAANE SHYAM Foundation",
                "status": "pending_approval",
                "deal": deal_meeting,
                "contact": None,
                "assignee": manager,
                "products": [(prod_ngo, 1), (prod_12a, 1)],
                "client_name": "MADHU SUDAN SHARMA",
                "client_org": "MASTAANE SHYAM Foundation",
                "requires_approval": 1,
            },
            {
                "num": 3,
                "title": "Trademark + GST — Aadi Shakti Camphor",
                "status": "sent",
                "deal": deal_won_aadi,
                "contact": contact_aadi,
                "assignee": mohini,
                "products": [(prod_trademark, 1)],
                "client_name": contact_aadi.name if contact_aadi else "Tripuranjay Tripathi",
                "client_org": contact_aadi.organization_name if contact_aadi else "Aadi Shakti Camphor Pvt Ltd",
                "sent_at": now - timedelta(days=5),
            },
            {
                "num": 4,
                "title": "ROC annual filing — A1 Ashapuri Tours",
                "status": "accepted",
                "deal": deal_won_ashapuri,
                "contact": contact_ashapuri,
                "assignee": isha,
                "products": [(prod_accounting, 1)],
                "client_name": contact_ashapuri.name if contact_ashapuri else "Devkar Ganesh Vasantrav",
                "client_org": contact_ashapuri.organization_name if contact_ashapuri else "A1 Ashapuri Tours",
                "accepted_at": now - timedelta(days=10),
            },
            {
                "num": 5,
                "title": "Audit support — AADHAR SEVABHAVI SANSTHA",
                "status": "rejected",
                "deal": None,
                "contact": contact_aadhar,
                "assignee": anita,
                "products": [(prod_accounting, 1)],
                "client_name": contact_aadhar.name if contact_aadhar else "Patil Sunil Suresh",
                "client_org": contact_aadhar.organization_name if contact_aadhar else "AADHAR SEVABHAVI SANSTHA",
                "rejected_at": now - timedelta(days=2),
            },
        ]

        quotes: list[Quotation] = []
        for spec in quote_specs:
            line_data = []
            items = []
            for idx, (product, qty) in enumerate(spec["products"]):
                price = float(product.total_price or product.our_fees or 10000)
                calc = _line_totals(qty, price, float(product.gst_rate or 18))
                line_data.append(calc)
                items.append((product, qty, price, calc, idx))

            totals = _sum_lines(line_data)
            quote = Quotation(
                company_id=company.id,
                deal_id=spec["deal"].id if spec["deal"] else None,
                lead_id=spec["deal"].lead_id if spec["deal"] else None,
                contact_id=spec["contact"].id if spec["contact"] else None,
                assigned_to_id=spec["assignee"].id if spec["assignee"] else None,
                created_by_id=creator.id,
                approved_by_id=isha.id if spec["status"] in {"approved", "sent", "accepted"} else None,
                quote_number=_quote_number(db, company.id, spec["num"]),
                title=spec["title"],
                status=spec["status"],
                currency="INR",
                quote_date=now - timedelta(days=14 - spec["num"]),
                valid_until=now + timedelta(days=30),
                client_name=spec["client_name"],
                client_org=spec.get("client_org"),
                client_email="client@example.com",
                subtotal=totals["subtotal"],
                total_tax=totals["total_tax"],
                grand_total=totals["grand_total"],
                payment_terms=DEFAULT_PAYMENT_TERMS,
                validity_clause=DEFAULT_VALIDITY_CLAUSE,
                legal_footer=DEFAULT_LEGAL_FOOTER,
                internal_notes=f"{DEMO_MARKER} Demo quotation for UI testing.",
                requires_approval=spec.get("requires_approval", 0),
                share_token=secrets.token_urlsafe(24) if spec["status"] in {"sent", "accepted"} else None,
                sent_at=spec.get("sent_at"),
                accepted_at=spec.get("accepted_at"),
                rejected_at=spec.get("rejected_at"),
                approved_at=spec.get("sent_at") or spec.get("accepted_at"),
            )
            db.add(quote)
            db.flush()

            for product, qty, price, calc, idx in items:
                db.add(
                    QuotationLineItem(
                        quotation_id=quote.id,
                        product_id=product.id,
                        sort_order=idx,
                        item_name=product.name,
                        description=product.description,
                        quantity=qty,
                        unit=product.unit or "Service",
                        unit_price=price,
                        tax_rate=float(product.gst_rate or 18),
                        line_subtotal=calc["line_subtotal"],
                        line_total=calc["line_total"],
                    )
                )
            quotes.append(quote)

        db.flush()

        # --- Sales orders (3) from accepted/sent quotes ---
        order_specs = [
            {
                "num": 1,
                "quote": quotes[3],
                "status": "confirmed",
                "assignee": isha,
                "progress": 40,
                "prep": "in_progress",
            },
            {
                "num": 2,
                "quote": quotes[2],
                "status": "in_execution",
                "assignee": mohini,
                "progress": 65,
                "prep": "completed",
            },
            {
                "num": 3,
                "quote": None,
                "status": "draft",
                "assignee": palak,
                "title": "SAMAPRABHA WELFARE — Annual compliance",
                "deal": db.query(Deal).filter(Deal.id == 10).first(),
                "contact": None,
                "client_name": "AYUSH GOYAL",
                "client_org": "SAMAPRABHA WELFARE FOUNDATION",
                "products": [(prod_ngo, 1)],
            },
        ]

        orders: list[SalesOrder] = []
        for spec in order_specs:
            if spec.get("quote"):
                quote = spec["quote"]
                line_items_src = quote.line_items
                title = quote.title
                deal_id = quote.deal_id
                lead_id = quote.lead_id
                contact_id = quote.contact_id
                client_name = quote.client_name
                client_org = quote.client_org
                subtotal = quote.subtotal
                total_tax = quote.total_tax
                grand_total = quote.grand_total
                source_type = "quotation"
            else:
                quote = None
                line_items_src = []
                title = spec["title"]
                deal_id = spec["deal"].id if spec.get("deal") else None
                lead_id = spec["deal"].lead_id if spec.get("deal") else None
                contact_id = None
                client_name = spec["client_name"]
                client_org = spec["client_org"]
                line_data = []
                for product, qty in spec["products"]:
                    price = float(product.total_price or 10000)
                    line_data.append(_line_totals(qty, price, float(product.gst_rate or 18)))
                totals = _sum_lines(line_data)
                subtotal = totals["subtotal"]
                total_tax = totals["total_tax"]
                grand_total = totals["grand_total"]
                source_type = "manual"

            order = SalesOrder(
                company_id=company.id,
                quotation_id=quote.id if quote else None,
                deal_id=deal_id,
                lead_id=lead_id,
                contact_id=contact_id,
                assigned_to_id=spec["assignee"].id if spec["assignee"] else None,
                created_by_id=creator.id,
                confirmed_by_id=isha.id if spec["status"] == "confirmed" else None,
                order_number=_order_number(spec["num"]),
                title=title,
                status=spec["status"],
                source_type=source_type,
                currency="INR",
                order_date=now - timedelta(days=7),
                confirmation_date=now - timedelta(days=5) if spec["status"] != "draft" else None,
                client_name=client_name,
                client_org=client_org,
                subtotal=subtotal,
                total_tax=total_tax,
                grand_total=grand_total,
                fulfillment_progress=spec.get("progress", 0),
                preparation_status=spec.get("prep", "not_started"),
                internal_notes=f"{DEMO_MARKER} Demo sales order.",
                share_token=secrets.token_urlsafe(24) if spec["status"] != "draft" else None,
                confirmed_at=now - timedelta(days=5) if spec["status"] != "draft" else None,
            )
            db.add(order)
            db.flush()

            if quote:
                for li in line_items_src:
                    db.add(
                        SalesOrderLineItem(
                            sales_order_id=order.id,
                            product_id=li.product_id,
                            quotation_line_item_id=li.id,
                            sort_order=li.sort_order,
                            item_name=li.item_name,
                            description=li.description,
                            quantity=li.quantity,
                            unit=li.unit,
                            unit_price=li.unit_price,
                            tax_rate=li.tax_rate,
                            line_subtotal=li.line_subtotal,
                            line_total=li.line_total,
                            fulfillment_status="in_progress" if spec["status"] == "in_execution" else "pending",
                        )
                    )
            else:
                for idx, (product, qty) in enumerate(spec["products"]):
                    price = float(product.total_price or 10000)
                    calc = _line_totals(qty, price, float(product.gst_rate or 18))
                    db.add(
                        SalesOrderLineItem(
                            sales_order_id=order.id,
                            product_id=product.id,
                            sort_order=idx,
                            item_name=product.name,
                            quantity=qty,
                            unit=product.unit or "Service",
                            unit_price=price,
                            tax_rate=float(product.gst_rate or 18),
                            line_subtotal=calc["line_subtotal"],
                            line_total=calc["line_total"],
                        )
                    )

            if spec["status"] in {"confirmed", "in_execution"}:
                db.add(
                    SalesOrderMilestone(
                        sales_order_id=order.id,
                        owner_id=spec["assignee"].id,
                        sort_order=0,
                        title="Collect documents from client",
                        status="completed" if spec["status"] == "in_execution" else "pending",
                        due_date=now + timedelta(days=3),
                        completed_at=now - timedelta(days=2) if spec["status"] == "in_execution" else None,
                    )
                )
                db.add(
                    SalesOrderMilestone(
                        sales_order_id=order.id,
                        owner_id=spec["assignee"].id,
                        sort_order=1,
                        title="File with department",
                        status="in_progress" if spec["status"] == "in_execution" else "pending",
                        due_date=now + timedelta(days=10),
                    )
                )

            orders.append(order)

        db.flush()

        # --- Invoices (4) ---
        inv_specs = [
            {
                "num": 1,
                "order": orders[0],
                "status": "paid",
                "assignee": isha,
                "paid_full": True,
            },
            {
                "num": 2,
                "order": orders[1],
                "status": "partially_paid",
                "assignee": mohini,
                "paid_full": False,
            },
            {
                "num": 3,
                "order": None,
                "quote": quotes[2],
                "status": "issued",
                "assignee": mohini,
                "title": "Trademark + GST — Advance invoice",
            },
            {
                "num": 4,
                "order": None,
                "quote": None,
                "status": "draft",
                "assignee": anita,
                "title": "GST filing — PRATIVA DEBNATH FOUNDATION",
                "deal": db.query(Deal).filter(Deal.id == 11).first(),
                "contact": None,
                "client_name": "SOUMYA KARMAKAR",
                "client_org": "PRATIVA DEBNATH FOUNDATION",
                "products": [(prod_accounting, 1)],
            },
        ]

        invoices: list[Invoice] = []
        for spec in inv_specs:
            if spec.get("order"):
                order = spec["order"]
                title = f"Invoice — {order.title}"
                deal_id = order.deal_id
                contact_id = order.contact_id
                quotation_id = order.quotation_id
                client_name = order.client_name
                client_org = order.client_org
                subtotal = order.subtotal
                total_tax = order.total_tax
                grand_total = order.grand_total
                source_type = "sales_order"
            elif spec.get("quote"):
                quote = spec["quote"]
                title = spec["title"]
                deal_id = quote.deal_id
                contact_id = quote.contact_id
                quotation_id = quote.id
                client_name = quote.client_name
                client_org = quote.client_org
                subtotal = quote.subtotal
                total_tax = quote.total_tax
                grand_total = quote.grand_total
                source_type = "quotation"
                order = None
            else:
                order = None
                quote = None
                title = spec["title"]
                deal_id = spec["deal"].id if spec.get("deal") else None
                contact_id = None
                quotation_id = None
                client_name = spec["client_name"]
                client_org = spec["client_org"]
                line_data = [_line_totals(1, float(spec["products"][0][0].total_price or 12000))]
                totals = _sum_lines(line_data)
                subtotal = totals["subtotal"]
                total_tax = totals["total_tax"]
                grand_total = totals["grand_total"]
                source_type = "manual"

            paid = grand_total if spec.get("paid_full") else (grand_total / 2 if spec["status"] == "partially_paid" else Decimal("0"))
            outstanding = grand_total - paid

            inv = Invoice(
                company_id=company.id,
                sales_order_id=order.id if order else None,
                quotation_id=quotation_id,
                deal_id=deal_id,
                contact_id=contact_id,
                assigned_to_id=spec["assignee"].id,
                created_by_id=creator.id,
                reviewed_by_id=isha.id if spec["status"] not in {"draft"} else None,
                issued_by_id=isha.id if spec["status"] in {"issued", "paid", "partially_paid"} else None,
                invoice_number=_invoice_number(db, company.id, spec["num"]),
                title=title,
                status=spec["status"],
                source_type=source_type,
                currency="INR",
                issue_date=now - timedelta(days=3) if spec["status"] != "draft" else None,
                due_date=now + timedelta(days=15),
                client_name=client_name,
                client_org=client_org,
                subtotal=subtotal,
                total_tax=total_tax,
                grand_total=grand_total,
                amount_paid=paid,
                outstanding_amount=outstanding,
                internal_notes=f"{DEMO_MARKER} Demo invoice.",
                share_token=secrets.token_urlsafe(24) if spec["status"] in {"issued", "paid", "partially_paid"} else None,
                issued_at=now - timedelta(days=3) if spec["status"] != "draft" else None,
            )
            db.add(inv)
            db.flush()

            if order:
                for li in order.line_items:
                    db.add(
                        InvoiceLineItem(
                            invoice_id=inv.id,
                            product_id=li.product_id,
                            sales_order_line_item_id=li.id,
                            sort_order=li.sort_order,
                            item_name=li.item_name,
                            description=li.description,
                            quantity=li.quantity,
                            unit=li.unit,
                            unit_price=li.unit_price,
                            tax_rate=li.tax_rate,
                            line_subtotal=li.line_subtotal,
                            line_total=li.line_total,
                        )
                    )
            elif quote:
                for li in quote.line_items:
                    db.add(
                        InvoiceLineItem(
                            invoice_id=inv.id,
                            product_id=li.product_id,
                            sort_order=li.sort_order,
                            item_name=li.item_name,
                            description=li.description,
                            quantity=li.quantity,
                            unit=li.unit,
                            unit_price=li.unit_price,
                            tax_rate=li.tax_rate,
                            line_subtotal=li.line_subtotal,
                            line_total=li.line_total,
                        )
                    )
            else:
                product, qty = spec["products"][0]
                price = float(product.total_price or 12000)
                calc = _line_totals(qty, price)
                db.add(
                    InvoiceLineItem(
                        invoice_id=inv.id,
                        product_id=product.id,
                        sort_order=0,
                        item_name=product.name,
                        quantity=qty,
                        unit=product.unit or "Service",
                        unit_price=price,
                        tax_rate=18,
                        line_subtotal=calc["line_subtotal"],
                        line_total=calc["line_total"],
                    )
                )

            if paid > 0:
                db.add(
                    InvoicePayment(
                        invoice_id=inv.id,
                        recorded_by_id=isha.id,
                        amount=paid,
                        payment_date=now - timedelta(days=1),
                        payment_method="bank_transfer",
                        reference=f"UTR-DEMO-{spec['num']:04d}",
                        note=f"{DEMO_MARKER} Demo payment.",
                    )
                )

            invoices.append(inv)

        db.flush()

        # --- Client notes (8) ---
        note_specs = [
            {
                "type": "call",
                "title": "Initial discovery call",
                "body": f"{DEMO_MARKER} Client interested in annual compliance package. Asked for quote by Friday.",
                "contact": contact_ashapuri,
                "deal": deal_won_ashapuri,
                "author": palak,
                "follow_up": True,
                "due_days": 2,
                "priority": "high",
            },
            {
                "type": "meeting",
                "title": "Founder meeting — incorporation scope",
                "body": f"{DEMO_MARKER} Met directors. Need MOA/AOA draft and DSC for 2 directors.",
                "contact": None,
                "deal": deal_meeting,
                "author": manager,
                "follow_up": True,
                "due_days": 5,
            },
            {
                "type": "requirement",
                "title": "Trademark class preference",
                "body": f"{DEMO_MARKER} Client wants Class 3 and 35. Logo files shared on WhatsApp.",
                "contact": contact_aadi,
                "quotation": quotes[2],
                "author": mohini,
                "pinned": True,
            },
            {
                "type": "billing",
                "title": "50% advance received",
                "body": f"{DEMO_MARKER} Advance of Rs 14,000 credited. Balance on delivery.",
                "contact": contact_aadi,
                "invoice": invoices[2],
                "author": isha,
            },
            {
                "type": "follow_up",
                "title": "Chase signed quotation",
                "body": f"{DEMO_MARKER} Sent reminder on email. Client asked for 7-day extension.",
                "contact": contact_aadhar,
                "quotation": quotes[4],
                "author": anita,
                "follow_up": True,
                "due_days": 1,
                "priority": "urgent",
            },
            {
                "type": "internal",
                "title": "Pricing approved by manager",
                "body": f"{DEMO_MARKER} Manager approved 10% discount for NGO client.",
                "contact": contact_ashapuri,
                "quotation": quotes[3],
                "author": manager,
                "visibility": "internal",
            },
            {
                "type": "email_summary",
                "title": "Documents checklist sent",
                "body": f"{DEMO_MARKER} Emailed PAN, GST, bank statement checklist to client.",
                "contact": contact_ashapuri,
                "order": orders[0],
                "author": isha,
            },
            {
                "type": "risk",
                "title": "Client comparing with local CA",
                "body": f"{DEMO_MARKER} Client mentioned competitor quote 15% lower. Needs value justification.",
                "contact": contact_aadhar,
                "deal": db.query(Deal).filter(Deal.id == 16).first(),
                "author": anita,
                "sensitive": True,
                "visibility": "sensitive",
            },
        ]

        for spec in note_specs:
            db.add(
                ClientNote(
                    company_id=company.id,
                    contact_id=spec["contact"].id if spec.get("contact") else None,
                    lead_id=spec["deal"].lead_id if spec.get("deal") else None,
                    deal_id=spec["deal"].id if spec.get("deal") else None,
                    quotation_id=spec["quotation"].id if spec.get("quotation") else None,
                    sales_order_id=spec["order"].id if spec.get("order") else None,
                    invoice_id=spec["invoice"].id if spec.get("invoice") else None,
                    author_id=spec["author"].id,
                    assigned_to_id=spec["author"].id,
                    note_type=spec["type"],
                    title=spec["title"],
                    body=spec["body"],
                    visibility_scope=spec.get("visibility", "team"),
                    is_pinned=spec.get("pinned", False),
                    is_sensitive=spec.get("sensitive", False),
                    follow_up_required=spec.get("follow_up", False),
                    follow_up_due_date=now + timedelta(days=spec["due_days"]) if spec.get("follow_up") else None,
                    follow_up_priority=spec.get("priority", "normal"),
                    tags="demo,level2",
                )
            )

        db.commit()
        print("Seeded demo Level 2 data:")
        print(f"  Quotations: {len(quotes)} (draft, pending, sent, accepted, rejected)")
        print(f"  Sales orders: {len(orders)} (draft, confirmed, in_execution)")
        print(f"  Invoices: {len(invoices)} (draft, issued, partially_paid, paid)")
        print(f"  Client notes: {len(note_specs)} (calls, meetings, follow-ups, billing)")
        print("Uses manager data: contacts, products/services, deals, staff names.")
        print("Manager sample quote DOCX + invoice PDF are layout refs only — not imported.")
    finally:
        db.close()


if __name__ == "__main__":
    seed(reset="--reset" in sys.argv)
