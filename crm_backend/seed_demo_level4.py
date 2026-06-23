"""
Seed demo data for Level 4: projects, tasks, leave requests, documents,
and timesheet entries (after timesheets migration).

Prerequisites: seed_company, seed_permissions, seed_master_employees,
seed_clients, seed_demo_level2 (recommended for linked deals/orders).

Use: python seed_demo_level4.py --reset
"""

from __future__ import annotations

import os
import sys
import uuid
from datetime import datetime, timedelta, timezone
from decimal import Decimal
from pathlib import Path

from database import SessionLocal
from models import (
    AttendanceRecord,
    ChatMessage,
    Company,
    Contact,
    Deal,
    EmployeeProfile,
    JobApplicant,
    JobOpening,
    LeaveRequest,
    Payslip,
    Project,
    ProjectMember,
    ProjectTask,
    SalesOrder,
    TimesheetEntry,
    UploadedFile,
    User,
)

DEMO_MARKER = "[demo-level4]"
YEAR = datetime.now(timezone.utc).year


def _user(db, email: str) -> User | None:
    return db.query(User).filter(User.email == email).first()


def _staff_users(db, company_id: int) -> list[User]:
    return (
        db.query(User)
        .filter(
            User.company_id == company_id,
            User.role.in_(["Admin", "Manager", "Employee", "Sales", "Accountant"]),
            User.status == "active",
        )
        .order_by(User.id)
        .all()
    )


def _date_at_noon(days_offset: int = 0) -> datetime:
    now = datetime.now(timezone.utc) + timedelta(days=days_offset)
    return now.replace(hour=12, minute=0, second=0, microsecond=0)


def _clear_demo(db, company_id: int) -> None:
    chats = db.query(ChatMessage).filter(
        ChatMessage.company_id == company_id,
        ChatMessage.body.like(f"%{DEMO_MARKER}%"),
    ).all()
    for row in chats:
        db.delete(row)
    db.commit()

    payslips = db.query(Payslip).filter(
        Payslip.company_id == company_id,
        Payslip.notes.like(f"%{DEMO_MARKER}%"),
    ).all()
    for row in payslips:
        db.delete(row)
    db.commit()

    jobs = db.query(JobOpening).filter(
        JobOpening.company_id == company_id,
        JobOpening.notes.like(f"%{DEMO_MARKER}%"),
    ).all()
    for row in jobs:
        db.delete(row)
    db.commit()

    attendance = db.query(AttendanceRecord).filter(
        AttendanceRecord.company_id == company_id,
        AttendanceRecord.notes.like(f"%{DEMO_MARKER}%"),
    ).all()
    for row in attendance:
        db.delete(row)
    db.commit()

    profiles = db.query(EmployeeProfile).filter(
        EmployeeProfile.company_id == company_id,
        EmployeeProfile.notes.like(f"%{DEMO_MARKER}%"),
    ).all()
    for row in profiles:
        db.delete(row)
    db.commit()

    # Remove any leftover demo-style today rows without marker (legacy seed)
    today = _date_at_noon(0)
    legacy_today = db.query(AttendanceRecord).filter(
        AttendanceRecord.company_id == company_id,
        AttendanceRecord.attendance_date == today,
        AttendanceRecord.recorded_by_id.isnot(None),
    ).all()
    for row in legacy_today:
        db.delete(row)
    db.commit()

    ts = db.query(TimesheetEntry).filter(
        TimesheetEntry.company_id == company_id,
        TimesheetEntry.description.like(f"%{DEMO_MARKER}%"),
    ).all()
    for row in ts:
        db.delete(row)
    db.commit()

    leaves = db.query(LeaveRequest).filter(
        LeaveRequest.company_id == company_id,
        LeaveRequest.reason.like(f"%{DEMO_MARKER}%"),
    ).all()
    for row in leaves:
        db.delete(row)
    db.commit()

    projects = db.query(Project).filter(
        Project.company_id == company_id,
        Project.description.like(f"%{DEMO_MARKER}%"),
    ).all()
    for row in projects:
        db.delete(row)
    db.commit()

    files = db.query(UploadedFile).filter(
        UploadedFile.company_id == company_id,
        UploadedFile.stored_filename.like("demo-level4-%"),
    ).all()
    for row in files:
        if row.file_path and os.path.isfile(row.file_path):
            try:
                os.remove(row.file_path)
            except OSError:
                pass
        db.delete(row)
    db.commit()


def _seed_projects(db, company: Company, admin: User, staff: list[User]) -> list[Project]:
    deal_aadi = db.query(Deal).filter(Deal.id == 14).first()
    deal_ashapuri = db.query(Deal).filter(Deal.id == 15).first()
    contact_aadi = db.query(Contact).filter(Contact.id == 7).first()
    contact_ashapuri = db.query(Contact).filter(Contact.id == 4).first()
    order_demo = (
        db.query(SalesOrder)
        .filter(SalesOrder.company_id == company.id, SalesOrder.internal_notes.like("%[demo-level2]%"))
        .order_by(SalesOrder.id)
        .first()
    )

    pm = admin
    members = [u for u in staff if u.id != admin.id][:4]
    now = datetime.now(timezone.utc)

    specs = [
        {
            "num": 1,
            "name": "GST registration — Aadi Shakti Camphor",
            "status": "active",
            "priority": "high",
            "type": "client",
            "contact": contact_aadi,
            "deal": deal_aadi,
            "order": order_demo,
            "deadline": now + timedelta(days=12),
            "stage_tasks": [
                ("kickoff", "Collect KYC documents", "done", members[0] if members else pm, -14),
                ("discovery", "Verify business premises proof", "in_progress", members[1] if len(members) > 1 else pm, 3),
                ("execution", "File GST REG-01 on portal", "todo", members[2] if len(members) > 2 else pm, 7),
                ("review", "Client sign-off on ARN", "todo", pm, 10),
            ],
        },
        {
            "num": 2,
            "name": "ROC annual filing — A1 Ashapuri Tours",
            "status": "active",
            "priority": "normal",
            "type": "client",
            "contact": contact_ashapuri,
            "deal": deal_ashapuri,
            "order": None,
            "deadline": now + timedelta(days=5),
            "stage_tasks": [
                ("kickoff", "Confirm FY and director list", "done", pm, -10),
                ("execution", "Prepare AOC-4 and MGT-7", "in_progress", members[0] if members else pm, 2),
                ("execution", "Board resolution draft", "blocked", members[1] if len(members) > 1 else pm, 1),
                ("review", "File on MCA V3", "todo", pm, 4),
            ],
        },
        {
            "num": 3,
            "name": "Internal CRM rollout — Phase 1",
            "status": "active",
            "priority": "normal",
            "type": "internal",
            "contact": None,
            "deal": None,
            "order": None,
            "deadline": now + timedelta(days=30),
            "stage_tasks": [
                ("kickoff", "Train managers on sales flow", "done", pm, -7),
                ("discovery", "UAT for Level 3 modules", "in_progress", members[2] if len(members) > 2 else pm, 14),
                ("execution", "Level 4 HR modules rollout", "todo", members[3] if len(members) > 3 else pm, 21),
            ],
        },
        {
            "num": 4,
            "name": "Trademark objection reply — demo (on hold)",
            "status": "on_hold",
            "priority": "low",
            "type": "client",
            "contact": contact_aadi,
            "deal": None,
            "order": None,
            "deadline": now - timedelta(days=3),
            "stage_tasks": [
                ("discovery", "Await client affidavit", "blocked", members[0] if members else pm, -2),
            ],
        },
        {
            "num": 5,
            "name": "12A registration — completed demo",
            "status": "completed",
            "priority": "normal",
            "type": "client",
            "contact": contact_ashapuri,
            "deal": None,
            "order": None,
            "deadline": now - timedelta(days=20),
            "stage_tasks": [
                ("closure", "Handover certificate to client", "done", pm, -18),
            ],
        },
    ]

    created: list[Project] = []
    for spec in specs:
        project = Project(
            company_id=company.id,
            project_number=f"PRJ-{YEAR}-{spec['num']:04d}",
            name=spec["name"],
            description=f"Demo delivery project for BlackPapers CRM Level 4. {DEMO_MARKER}",
            project_type=spec["type"],
            status=spec["status"],
            priority=spec["priority"],
            contact_id=spec["contact"].id if spec["contact"] else None,
            deal_id=spec["deal"].id if spec["deal"] else None,
            sales_order_id=spec["order"].id if spec["order"] else None,
            project_manager_id=pm.id,
            created_by_id=admin.id,
            start_date=now - timedelta(days=21),
            deadline=spec["deadline"],
            completed_at=now - timedelta(days=15) if spec["status"] == "completed" else None,
        )
        db.add(project)
        db.flush()

        db.add(ProjectMember(project_id=project.id, user_id=pm.id, role="manager", added_by_id=admin.id))
        for member in members[:3]:
            db.add(ProjectMember(project_id=project.id, user_id=member.id, role="member", added_by_id=admin.id))

        for idx, (stage, title, status, assignee, due_days) in enumerate(spec["stage_tasks"]):
            task = ProjectTask(
                project_id=project.id,
                stage_key=stage,
                title=title,
                description=f"Demo task for project delivery tracking. {DEMO_MARKER}",
                assigned_to_id=assignee.id,
                created_by_id=admin.id,
                status=status,
                priority="high" if status == "blocked" else "normal",
                due_date=_date_at_noon(due_days),
                completed_at=now - timedelta(days=abs(due_days)) if status == "done" else None,
                sort_order=idx,
                blocked_reason="Waiting on client documents" if status == "blocked" else None,
            )
            db.add(task)

        created.append(project)

    return created


def _seed_leaves(db, company: Company, admin: User, staff: list[User]) -> int:
    employees = [u for u in staff if u.role in ("Employee", "Manager")][:5]
    if not employees:
        employees = staff[:3]
    reviewer = admin
    now = datetime.now(timezone.utc)
    count = 0

    specs = [
        ("casual", employees[0], "pending", 7, 8, False, None, "Family function in hometown — need 2 days off."),
        ("sick", employees[1] if len(employees) > 1 else employees[0], "approved", -5, -4, False, None, "Fever and rest advised by doctor."),
        ("earned", employees[2] if len(employees) > 2 else employees[0], "draft", 14, 18, False, None, "Planned vacation — will confirm tickets soon."),
        ("casual", employees[0], "approved", -12, -12, True, "morning", "Half-day for bank KYC visit."),
        ("unpaid", employees[3] if len(employees) > 3 else employees[0], "rejected", 3, 4, False, "Insufficient notice period for planned leave.", "Personal work — need 2 days."),
        ("sick", employees[4] if len(employees) > 4 else employees[0], "pending", 1, 2, False, None, "Dental procedure scheduled — may need follow-up day."),
        ("earned", employees[1] if len(employees) > 1 else employees[0], "approved", 20, 24, False, None, "Festival week travel with family."),
        ("other", employees[2] if len(employees) > 2 else employees[0], "cancelled", 10, 10, True, "afternoon", "Cancelled — client meeting rescheduled."),
    ]

    seq = 1
    for leave_type, employee, status, start_off, end_off, is_half, reviewer_note, reason in specs:
        start = _date_at_noon(start_off)
        end = _date_at_noon(end_off if not is_half else start_off)
        total = 0.5 if is_half else max(1.0, float((end.date() - start.date()).days + 1))

        leave = LeaveRequest(
            company_id=company.id,
            leave_number=f"LV-{YEAR}-{seq:04d}" if status != "draft" else None,
            employee_id=employee.id,
            leave_type=leave_type,
            start_date=start,
            end_date=end,
            total_days=Decimal(str(total)),
            is_half_day=is_half,
            half_day_period="morning" if is_half else None,
            reason=f"{reason} {DEMO_MARKER}",
            status=status,
            submitted_at=now - timedelta(days=2) if status not in ("draft",) else None,
            reviewed_by_id=reviewer.id if status in ("approved", "rejected") else None,
            reviewed_at=now - timedelta(days=1) if status in ("approved", "rejected") else None,
            reviewer_note=reviewer_note if status == "rejected" else ("Approved — team coverage arranged." if status == "approved" else None),
        )
        db.add(leave)
        seq += 1
        count += 1

    return count


def _seed_documents(db, company: Company, admin: User, projects: list[Project]) -> int:
    upload_dir = Path(__file__).resolve().parent / "uploads"
    upload_dir.mkdir(parents=True, exist_ok=True)

    contact = db.query(Contact).filter(Contact.id == 7).first()
    deal = db.query(Deal).filter(Deal.id == 14).first()
    project = projects[0] if projects else None

    specs = [
        ("BlackPapers-Employee-Handbook.txt", "sop", None, None, "Employee handbook and office policies (demo)."),
        ("Client-KYC-Checklist.txt", "kyc", "contacts", contact.id if contact else None, "Standard KYC checklist for new clients."),
        ("GST-Registration-SOP.txt", "sop", None, None, "Step-by-step GST registration procedure."),
        ("Signed-Engagement-Letter-Demo.txt", "contracts", "deals", deal.id if deal else None, "Sample engagement letter for demo deal."),
        ("Leave-Policy-2026.txt", "hr", None, None, "Company leave policy summary."),
        ("Project-Kickoff-Notes.txt", "other", "projects", project.id if project else None, "Kickoff meeting notes for active project."),
    ]

    count = 0
    for filename, category, module, record_id, body in specs:
        stored = f"demo-level4-{uuid.uuid4().hex[:12]}.txt"
        path = upload_dir / stored
        path.write_text(f"{body}\n\n{DEMO_MARKER}\n", encoding="utf-8")
        size = path.stat().st_size

        db.add(
            UploadedFile(
                company_id=company.id,
                original_filename=filename,
                stored_filename=stored,
                file_path=str(path),
                file_type="text/plain",
                file_size=size,
                uploaded_by_id=admin.id,
                related_module=module,
                related_record_id=record_id,
                category=category,
            )
        )
        count += 1

    return count


def _seed_timesheets(db, company: Company, admin: User, staff: list[User], projects: list[Project]) -> int:
    if not projects:
        return 0

    employees = [u for u in staff if u.role in ("Employee", "Manager")][:4]
    if not employees:
        employees = staff[:2]

    proj = projects[0]
    tasks = db.query(ProjectTask).filter(ProjectTask.project_id == proj.id).limit(3).all()
    now = datetime.now(timezone.utc)
    count = 0
    seq = 1

    specs = [
        (employees[0], proj, tasks[0] if tasks else None, -4, 3.5, True, "submitted", "GST portal data entry and document review"),
        (employees[0], proj, tasks[1] if len(tasks) > 1 else None, -3, 2.0, True, "approved", "Client call and premises verification"),
        (employees[1] if len(employees) > 1 else employees[0], projects[1] if len(projects) > 1 else proj, None, -2, 4.0, True, "approved", "ROC form preparation"),
        (employees[1] if len(employees) > 1 else employees[0], projects[2] if len(projects) > 2 else proj, None, -1, 1.5, False, "submitted", "Internal CRM training session"),
        (employees[2] if len(employees) > 2 else employees[0], proj, None, 0, 2.0, True, "draft", "Follow-up email to client"),
        (employees[0], proj, tasks[0] if tasks else None, -5, 6.0, True, "approved", "Full-day GST registration work"),
    ]

    for employee, project, task, day_off, hours, billable, status, desc in specs:
        work_date = _date_at_noon(day_off)
        entry = TimesheetEntry(
            company_id=company.id,
            entry_number=f"TS-{YEAR}-{seq:04d}" if status != "draft" else None,
            employee_id=employee.id,
            project_id=project.id,
            task_id=task.id if task else None,
            contact_id=project.contact_id,
            work_date=work_date,
            hours=Decimal(str(hours)),
            is_billable=billable,
            description=f"{desc}. {DEMO_MARKER}",
            status=status,
            submitted_at=now - timedelta(days=1) if status in ("submitted", "approved", "rejected") else None,
            reviewed_by_id=admin.id if status == "approved" else None,
            reviewed_at=now if status == "approved" else None,
            reviewer_note="Approved for billing." if status == "approved" else None,
        )
        db.add(entry)
        seq += 1
        count += 1

    return count


def _seed_employee_profiles(db, company: Company, admin: User, staff: list[User]) -> int:
    now = datetime.now(timezone.utc)
    salaries = [85000, 45000, 38000, 32000, 28000, 25000]
    count = 0
    for idx, user in enumerate(staff[:6]):
        existing = db.query(EmployeeProfile).filter(
            EmployeeProfile.company_id == company.id, EmployeeProfile.user_id == user.id
        ).first()
        if existing:
            continue
        profile = EmployeeProfile(
            company_id=company.id,
            user_id=user.id,
            joining_date=now - timedelta(days=365 + idx * 90),
            employment_type="full_time" if idx < 4 else "intern",
            manager_id=admin.id if user.id != admin.id else None,
            salary_monthly=Decimal(str(salaries[idx % len(salaries)])),
            emergency_contact_name=f"Emergency contact — {user.name.split()[0]}",
            emergency_contact_phone="+91-98765-43210",
            city="Gurugram",
            state="Haryana",
            pan=f"DEMO{idx:05d}A",
            bank_name="HDFC Bank",
            bank_account_last4=f"{1000 + idx}",
            notes=f"Demo HR profile for BlackPapers CRM. {DEMO_MARKER}",
        )
        db.add(profile)
        count += 1
    return count


def _seed_attendance(db, company: Company, admin: User, staff: list[User]) -> int:
    now = datetime.now(timezone.utc)
    count = 0
    for user in staff[:5]:
        for day_off in range(-7, 0):
            att_date = _date_at_noon(day_off)
            if db.query(AttendanceRecord).filter(
                AttendanceRecord.company_id == company.id,
                AttendanceRecord.user_id == user.id,
                AttendanceRecord.attendance_date == att_date,
            ).first():
                continue
            status = "present"
            late = 0
            if day_off == -2:
                status = "late"
                late = 25
            elif day_off == -5:
                status = "on_leave"
            check_in = None
            check_out = None
            worked = None
            if status in ("present", "late"):
                check_in = att_date.replace(hour=9, minute=30 + late, second=0)
                check_out = att_date.replace(hour=18, minute=15, second=0)
                worked = Decimal("8.25")
            rec = AttendanceRecord(
                company_id=company.id,
                user_id=user.id,
                attendance_date=att_date,
                status=status,
                check_in_at=check_in,
                check_out_at=check_out,
                worked_hours=worked,
                late_minutes=late,
                notes=f"Demo attendance record. {DEMO_MARKER}",
                recorded_by_id=admin.id,
            )
            db.add(rec)
            count += 1
    return count


def _seed_recruitment(db, company: Company, admin: User) -> tuple[int, int]:
    now = datetime.now(timezone.utc)
    job_specs = [
        ("Compliance Executive", "Operations", "open", 2, 30000, 45000),
        ("Sales Associate", "Sales", "open", 1, 25000, 35000),
        ("HR Intern", "HR", "closed", 1, 12000, 15000),
    ]
    jobs = []
    for i, (title, dept, status, openings, smin, smax) in enumerate(job_specs, 1):
        job = JobOpening(
            company_id=company.id,
            job_code=f"JOB-{YEAR}-{i:03d}",
            title=title,
            department=dept,
            description=f"Demo job opening for {title}. {DEMO_MARKER}",
            status=status,
            openings_count=openings,
            salary_min=Decimal(str(smin)),
            salary_max=Decimal(str(smax)),
            posted_at=now - timedelta(days=14 - i * 2),
            created_by_id=admin.id,
            notes=DEMO_MARKER,
        )
        db.add(job)
        db.flush()
        jobs.append(job)

    applicants_data = [
        (jobs[0], "Priya Sharma", "priya.demo@email.com", "applied", 2.0),
        (jobs[0], "Rahul Verma", "rahul.demo@email.com", "interview", 4.5),
        (jobs[0], "Anita Desai", "anita.demo@email.com", "offered", 3.0),
        (jobs[1], "Karan Mehta", "karan.demo@email.com", "screening", 1.5),
        (jobs[1], "Sneha Patel", "sneha.demo@email.com", "rejected", 0.5),
        (jobs[2], "Dev Intern", "dev.demo@email.com", "hired", 0.0),
    ]
    app_count = 0
    for job, name, email, status, exp in applicants_data:
        db.add(JobApplicant(
            job_opening_id=job.id,
            name=name,
            email=email,
            phone="+91-90000-12345",
            status=status,
            interview_round=1 if status == "interview" else 0,
            experience_years=Decimal(str(exp)),
            current_company="Demo Corp Pvt Ltd",
            resume_summary=f"Demo applicant profile. {DEMO_MARKER}",
        ))
        app_count += 1
    return len(jobs), app_count


def _seed_payroll(db, company: Company, admin: User, staff: list[User]) -> int:
    now = datetime.now(timezone.utc)
    month = now.month if now.month > 1 else 12
    year = now.year if now.month > 1 else now.year - 1
    count = 0
    for idx, user in enumerate(staff[:5]):
        profile = db.query(EmployeeProfile).filter(
            EmployeeProfile.user_id == user.id, EmployeeProfile.company_id == company.id
        ).first()
        basic = Decimal(str(float(profile.salary_monthly) if profile and profile.salary_monthly else 30000))
        hra = basic * Decimal("0.40")
        allowances = basic * Decimal("0.10")
        gross = basic + hra + allowances
        pf = basic * Decimal("0.12")
        tds = gross * Decimal("0.05")
        net = gross - pf - tds
        status = "paid" if idx < 3 else "generated"
        db.add(Payslip(
            company_id=company.id,
            employee_id=user.id,
            payslip_number=f"PAY-{year}-{idx + 1:04d}",
            period_month=month,
            period_year=year,
            basic_salary=basic,
            hra=hra,
            allowances=allowances,
            gross_salary=gross,
            pf_deduction=pf,
            tds_deduction=tds,
            net_salary=net,
            status=status,
            payment_date=now - timedelta(days=5) if status == "paid" else None,
            notes=f"Demo payslip. {DEMO_MARKER}",
            generated_by_id=admin.id,
        ))
        count += 1
    return count


def _seed_chat(db, company: Company, admin: User, staff: list[User], projects: list[Project]) -> int:
    messages = [
        (admin, "general", None, None, "Welcome to BlackPapers internal chat — use this for team updates."),
        (staff[1] if len(staff) > 1 else admin, "general", None, None, "GST registration project kickoff at 3 PM today."),
        (staff[2] if len(staff) > 2 else admin, "general", None, None, "Uploaded client KYC in Documents module."),
    ]
    if projects:
        messages.append((
            admin, "project", None, projects[0].id,
            f"Team — please update tasks on {projects[0].name} before EOD.",
        ))
    count = 0
    for sender, channel, recipient_id, project_id, body in messages:
        db.add(ChatMessage(
            company_id=company.id,
            sender_id=sender.id,
            channel=channel,
            recipient_id=recipient_id,
            project_id=project_id,
            body=f"{body} {DEMO_MARKER}",
        ))
        count += 1
    return count


def seed(*, reset: bool = False):
    db = SessionLocal()
    try:
        company = db.query(Company).first()
        if not company:
            print("Company not found — run seed_company.py first.")
            return

        existing = (
            db.query(Project)
            .filter(Project.company_id == company.id, Project.description.like(f"%{DEMO_MARKER}%"))
            .count()
        )
        if existing and not reset:
            print(f"Demo Level 4 data already exists ({existing} projects) — skipping.")
            print("Run: python seed_demo_level4.py --reset")
            return

        if reset and existing:
            _clear_demo(db, company.id)
            print("Cleared existing demo Level 4 records.")

        admin = _user(db, "hr@blackpapers.in") or db.query(User).filter(User.role == "Admin").first()
        if not admin:
            print("No admin user found — run seed_master_employees.py first.")
            return

        staff = _staff_users(db, company.id)
        projects = _seed_projects(db, company, admin, staff)
        leave_count = _seed_leaves(db, company, admin, staff)
        doc_count = _seed_documents(db, company, admin, projects)
        ts_count = _seed_timesheets(db, company, admin, staff, projects)
        hr_count = _seed_employee_profiles(db, company, admin, staff)
        att_count = _seed_attendance(db, company, admin, staff)
        job_count, app_count = _seed_recruitment(db, company, admin)
        pay_count = _seed_payroll(db, company, admin, staff)
        chat_count = _seed_chat(db, company, admin, staff, projects)

        db.commit()
        task_count = sum(
            db.query(ProjectTask).filter(ProjectTask.project_id == p.id).count() for p in projects
        )
        print(
            f"Seeded Level 4 demo: {len(projects)} projects, {task_count} tasks, "
            f"{leave_count} leaves, {doc_count} documents, {ts_count} timesheets, "
            f"{hr_count} HR profiles, {att_count} attendance, {job_count} jobs ({app_count} applicants), "
            f"{pay_count} payslips, {chat_count} chat messages."
        )
        print("Log out and log back in if new nav items are missing.")
    finally:
        db.close()


if __name__ == "__main__":
    reset_flag = "--reset" in sys.argv
    seed(reset=reset_flag)
