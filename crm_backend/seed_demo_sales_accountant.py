"""
Assign demo data for sales@crm.com and accountant@crm.com so their portals are populated.

Run after seed_users.py and the other demo seeds (level2–level4 recommended):

    python seed_demo_sales_accountant.py
    python seed_demo_sales_accountant.py --reset

Prerequisites: seed_company.py, seed_users.py
Recommended: seed_demo_level2.py, seed_demo_reminders.py, seed_demo_level3.py, seed_demo_level4.py
"""

from __future__ import annotations

import sys
import uuid
from datetime import datetime, timedelta, timezone
from decimal import Decimal
from pathlib import Path

from database import SessionLocal
from models import (
    ClientNote,
    Company,
    Contact,
    Deal,
    EmployeeProfile,
    Expense,
    FollowUpReminder,
    Lead,
    LeaveRequest,
    Project,
    ProjectMember,
    ProjectTask,
    PurchaseOrder,
    PurchaseOrderLineItem,
    Quotation,
    TimesheetEntry,
    UploadedFile,
    User,
    VendorBill,
    VendorBillLineItem,
)

DEMO_MARKER = "[demo-sales-acct]"
YEAR = datetime.now(timezone.utc).year


def _user(db, email: str) -> User | None:
    return db.query(User).filter(User.email == email.lower()).first()


def _clear_marker_rows(db, company_id: int) -> None:
    for model, col in [
        (FollowUpReminder, FollowUpReminder.notes),
        (ClientNote, ClientNote.body),
        (Expense, Expense.notes),
        (VendorBill, VendorBill.internal_notes),
        (PurchaseOrder, PurchaseOrder.notes),
        (TimesheetEntry, TimesheetEntry.description),
        (LeaveRequest, LeaveRequest.reason),
        (UploadedFile, UploadedFile.original_filename),
    ]:
        rows = db.query(model).filter(
            getattr(model, "company_id") == company_id,
            col.like(f"%{DEMO_MARKER}%"),
        ).all()
        for row in rows:
            if isinstance(row, UploadedFile) and row.file_path:
                try:
                    Path(row.file_path).unlink(missing_ok=True)
                except OSError:
                    pass
            db.delete(row)
    db.commit()


def _ensure_company_link(db, user: User, company: Company) -> None:
    if user.company_id != company.id:
        user.company_id = company.id


def _ensure_employee_profile(db, user: User, company: Company) -> None:
    profile = db.query(EmployeeProfile).filter(
        EmployeeProfile.user_id == user.id,
        EmployeeProfile.company_id == company.id,
    ).first()
    if profile:
        return
    db.add(
        EmployeeProfile(
            company_id=company.id,
            user_id=user.id,
            joining_date=datetime.now(timezone.utc) - timedelta(days=180),
            employment_type="full_time",
            salary_monthly=Decimal("45000"),
            city="Gurugram",
            state="Haryana",
            notes=f"Demo profile for {user.role} portal. {DEMO_MARKER}",
        )
    )


def _patch_sales_assignments(db, company: Company, sales: User) -> int:
    count = 0
    for model, limit in [(Quotation, 2), (Deal, 2), (Lead, 8)]:
        query = db.query(model).filter(model.company_id == company.id)
        if model is Quotation:
            query = query.filter(Quotation.internal_notes.like("%[demo-level2]%"))
        elif model is Deal:
            query = query.filter(Deal.stage.notin_(("won", "lost")))
        rows = query.order_by(model.id).limit(limit).all()
        for row in rows:
            if getattr(row, "assigned_to_id", None) != sales.id:
                row.assigned_to_id = sales.id
                count += 1
    return count


def _seed_sales_activity(db, company: Company, sales: User, admin: User) -> int:
    now = datetime.now(timezone.utc)
    created = 0
    deal = db.query(Deal).filter(Deal.company_id == company.id).order_by(Deal.id).first()
    lead = db.query(Lead).filter(Lead.company_id == company.id).order_by(Lead.id).first()
    contact = db.query(Contact).filter(Contact.company_id == company.id, Contact.contact_type == "Customer").first()

    reminder_specs = [
        ("call", "Call lead — compliance package follow-up", now - timedelta(hours=1), lead.id if lead else None, deal.id if deal else None),
        ("email", "Send revised quotation to client", now + timedelta(hours=3), None, deal.id if deal else None),
        ("meeting", "Demo meeting — incorporation scope", now + timedelta(days=1), lead.id if lead else None, None),
        ("whatsapp", "WhatsApp reminder — pending documents", now - timedelta(days=1), lead.id if lead else None, None),
    ]
    for rtype, title, due, lead_id, deal_id in reminder_specs:
        db.add(
            FollowUpReminder(
                company_id=company.id,
                lead_id=lead_id,
                deal_id=deal_id,
                assigned_to_id=sales.id,
                created_by_id=admin.id,
                reminder_type=rtype,
                title=title,
                notes=f"Sales demo follow-up. {DEMO_MARKER}",
                status="pending",
                priority="high" if due < now else "normal",
                due_at=due,
            )
        )
        created += 1

    note_specs = [
        ("call", "Client interested in GST + trademark bundle", "Discussed pricing; send formal quote by Friday."),
        ("meeting", "Site visit completed", "Verified premises documents — ready for filing."),
    ]
    for ntype, title, body in note_specs:
        db.add(
            ClientNote(
                company_id=company.id,
                contact_id=contact.id if contact else None,
                deal_id=deal.id if deal else None,
                author_id=sales.id,
                assigned_to_id=sales.id,
                note_type=ntype,
                title=title,
                body=f"{body} {DEMO_MARKER}",
                follow_up_required=True,
                follow_up_due_date=now + timedelta(days=2),
                follow_up_priority="high",
            )
        )
        created += 1

    return created


def _seed_sales_projects(db, company: Company, sales: User, admin: User) -> int:
    projects = (
        db.query(Project)
        .filter(Project.company_id == company.id)
        .order_by(Project.id)
        .limit(2)
        .all()
    )
    if not projects:
        return 0

    now = datetime.now(timezone.utc)
    count = 0
    for project in projects:
        member = db.query(ProjectMember).filter(
            ProjectMember.project_id == project.id,
            ProjectMember.user_id == sales.id,
        ).first()
        if not member:
            db.add(
                ProjectMember(
                    project_id=project.id,
                    user_id=sales.id,
                    role="member",
                    added_by_id=admin.id,
                )
            )
            count += 1

        for title, status, due_days in [
            ("Prepare client quotation revision", "in_progress", 1),
            ("Collect signed engagement letter", "todo", 3),
        ]:
            existing = db.query(ProjectTask).filter(
                ProjectTask.project_id == project.id,
                ProjectTask.title == title,
                ProjectTask.assigned_to_id == sales.id,
            ).first()
            if existing:
                continue
            db.add(
                ProjectTask(
                    project_id=project.id,
                    stage_key="execution",
                    title=title,
                    description=f"Sales demo task. {DEMO_MARKER}",
                    assigned_to_id=sales.id,
                    created_by_id=admin.id,
                    status=status,
                    priority="normal",
                    due_date=now + timedelta(days=due_days),
                    sort_order=99,
                )
            )
            count += 1

    proj = projects[0]
    for day_off, hours, status, desc in [
        (-2, 3.0, "approved", "Client discovery call and CRM updates"),
        (-1, 2.5, "submitted", "Quotation draft and internal review"),
        (0, 1.5, "draft", "Pipeline follow-up emails"),
    ]:
        work_date = (now + timedelta(days=day_off)).replace(hour=12, minute=0, second=0, microsecond=0)
        db.add(
            TimesheetEntry(
                company_id=company.id,
                entry_number=f"TS-SA-{YEAR}-{uuid.uuid4().hex[:4].upper()}",
                employee_id=sales.id,
                project_id=proj.id,
                work_date=work_date,
                hours=Decimal(str(hours)),
                is_billable=True,
                status=status,
                description=f"{desc} {DEMO_MARKER}",
                submitted_at=now - timedelta(days=1) if status != "draft" else None,
            )
        )
        count += 1

    db.add(
        LeaveRequest(
            company_id=company.id,
            leave_number=f"LV-SA-{YEAR}-0001",
            employee_id=sales.id,
            leave_type="casual",
            start_date=now + timedelta(days=10),
            end_date=now + timedelta(days=11),
            total_days=Decimal("2"),
            reason=f"Personal travel — sales demo leave. {DEMO_MARKER}",
            status="pending",
            submitted_at=now,
        )
    )
    count += 1
    return count


def _seed_sales_document(db, company: Company, sales: User) -> int:
    upload_dir = Path(__file__).resolve().parent / "uploads"
    upload_dir.mkdir(parents=True, exist_ok=True)
    stored = f"demo-sales-acct-{uuid.uuid4().hex[:10]}.txt"
    path = upload_dir / stored
    path.write_text(f"Sample sales collateral for demo. {DEMO_MARKER}\n", encoding="utf-8")
    db.add(
        UploadedFile(
            company_id=company.id,
            original_filename=f"Sales-Demo-Playbook{DEMO_MARKER}.txt",
            stored_filename=stored,
            file_path=str(path),
            file_type="text/plain",
            file_size=path.stat().st_size,
            uploaded_by_id=sales.id,
            category="sales",
        )
    )
    return 1


def _seed_accountant_queue(db, company: Company, accountant: User, submitter: User, admin: User) -> int:
    now = datetime.now(timezone.utc)
    count = 0
    vendor = db.query(Contact).filter(
        Contact.company_id == company.id,
        Contact.contact_type == "Vendor",
    ).first()
    if not vendor:
        vendor = Contact(
            company_id=company.id,
            created_by_id=admin.id,
            contact_type="Vendor",
            status="active",
            name="Demo Supplies Vendor",
            organization_name="Demo Supplies Pvt Ltd",
            email="demo-vendor-sales-acct@blackpapers.demo",
            phone="9876501099",
            city="New Delhi",
            gstin="07AABCD1234E1Z8",
        )
        db.add(vendor)
        db.flush()

    expense_specs = [
        ("Client travel — Noida site visit", "travel", 3200, "submitted"),
        ("Software subscription renewal", "software_subscriptions", 8999, "under_review"),
    ]
    for idx, (title, category, amount, status) in enumerate(expense_specs, 1):
        exp_date = now - timedelta(days=idx + 1)
        db.add(
            Expense(
                company_id=company.id,
                submitted_by_id=submitter.id,
                expense_number=f"EXP-SA-{YEAR}-{idx:04d}",
                title=title,
                category=category,
                vendor_name=vendor.organization_name or vendor.name,
                amount=Decimal(str(amount)),
                expense_date=exp_date,
                payment_mode="personal_reimbursement",
                status=status,
                notes=f"Pending accountant review. {DEMO_MARKER}",
                cost_center="Operations",
                submitted_at=exp_date,
                reviewed_at=exp_date + timedelta(hours=2) if status == "under_review" else None,
                reviewed_by_id=accountant.id if status == "under_review" else None,
            )
        )
        count += 1

    bill_date = now - timedelta(days=3)
    subtotal = Decimal("11800")
    tax = Decimal("2124")
    grand = subtotal + tax
    bill = VendorBill(
        company_id=company.id,
        created_by_id=submitter.id,
        contact_id=vendor.id,
        bill_number=f"VB-SA-{YEAR}-0001",
        supplier_invoice_number="SUP-SA-9001",
        title="Office supplies — pending finance approval",
        status="submitted",
        bill_date=bill_date,
        due_date=bill_date + timedelta(days=30),
        payment_terms="Net 30",
        vendor_name=vendor.organization_name or vendor.name,
        vendor_email=vendor.email,
        subtotal=subtotal,
        total_tax=tax,
        grand_total=grand,
        outstanding_amount=grand,
        internal_notes=f"Awaiting accountant approval. {DEMO_MARKER}",
        submitted_at=bill_date,
    )
    db.add(bill)
    db.flush()
    db.add(
        VendorBillLineItem(
            vendor_bill_id=bill.id,
            sort_order=0,
            description="Stationery and printing",
            quantity=Decimal("10"),
            unit_price=Decimal("1180"),
            tax_rate=Decimal("18"),
            line_subtotal=subtotal,
            line_total=grand,
        )
    )
    count += 1

    po_date = now - timedelta(days=2)
    po = PurchaseOrder(
        company_id=company.id,
        created_by_id=submitter.id,
        contact_id=vendor.id,
        po_number=f"PO-SA-{YEAR}-0001",
        title="Printer toner — accountant approval queue",
        vendor_name=vendor.organization_name or vendor.name,
        vendor_email=vendor.email,
        status="submitted",
        payment_terms="net_30",
        po_date=po_date,
        expected_delivery_date=po_date + timedelta(days=10),
        notes=f"Submitted for accountant review. {DEMO_MARKER}",
        subtotal=subtotal,
        total_tax=tax,
        grand_total=grand,
        submitted_at=po_date,
    )
    db.add(po)
    db.flush()
    db.add(
        PurchaseOrderLineItem(
            purchase_order_id=po.id,
            sort_order=0,
            description="GST invoice printer toner",
            ordered_quantity=Decimal("4"),
            unit_price=Decimal("2950"),
            tax_rate=Decimal("18"),
            line_subtotal=subtotal,
            line_total=grand,
        )
    )
    count += 1
    return count


def seed(*, reset: bool = False) -> None:
    db = SessionLocal()
    try:
        company = db.query(Company).first()
        if not company:
            print("Company not found — run seed_company.py first.")
            return

        sales = _user(db, "sales@crm.com")
        accountant = _user(db, "accountant@crm.com")
        admin = _user(db, "admin@crm.com") or db.query(User).filter(User.role == "Admin").first()
        employee = _user(db, "employee@crm.com") or admin

        if not sales or not accountant:
            print("Run seed_users.py first (sales@crm.com / accountant@crm.com).")
            return

        existing = (
            db.query(FollowUpReminder)
            .filter(
                FollowUpReminder.company_id == company.id,
                FollowUpReminder.notes.like(f"%{DEMO_MARKER}%"),
            )
            .count()
        )
        if existing and not reset:
            print(f"Sales/Accountant demo already seeded ({existing} markers) — skipping. Use --reset")
            return

        if reset and existing:
            _clear_marker_rows(db, company.id)
            print("Cleared prior sales/accountant demo rows.")

        for user in (sales, accountant, employee):
            if user:
                _ensure_company_link(db, user, company)
        _ensure_employee_profile(db, sales, company)
        _ensure_employee_profile(db, accountant, company)

        patched = _patch_sales_assignments(db, company, sales)
        sales_rows = _seed_sales_activity(db, company, sales, admin)
        sales_rows += _seed_sales_projects(db, company, sales, admin)
        sales_rows += _seed_sales_document(db, company, sales)
        acct_rows = _seed_accountant_queue(db, company, accountant, employee, admin)

        db.commit()
        print(
            f"Sales/Accountant demo seed complete: {patched} assignments patched, "
            f"{sales_rows} sales rows, {acct_rows} finance queue rows."
        )
        print("Log in as sales@crm.com / sales123 or accountant@crm.com / accountant123")
    finally:
        db.close()


if __name__ == "__main__":
    seed(reset="--reset" in sys.argv)
