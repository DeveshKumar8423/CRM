"""Seed demo AI Reports (Phase 1 MVP)."""

from __future__ import annotations

import argparse

from database import SessionLocal
from models import Company, User
from routers.ai_reports_router import _get_settings
from services.ai_insight_service import run_insight_generation


def seed_demo_ai_reports(generate: bool = True) -> None:
    db = SessionLocal()
    try:
        company = db.query(Company).first()
        if not company:
            print("No company found. Run seed_company.py first.")
            return

        settings = _get_settings(db, company)
        settings.is_enabled = True
        settings.default_period = "30d"
        settings.default_domains_json = ["sales", "finance", "inventory", "hr", "operations"]
        settings.include_executive_brief = True
        settings.notify_roles_json = ["Admin", "Manager"]
        settings.generation_mode = "template"
        db.commit()
        print("AI Reports settings enabled.")

        if not generate:
            return

        user = db.query(User).filter(User.role == "Admin").first()
        if not user:
            print("No admin user found. Skipping demo insight run.")
            return

        from datetime import date, timedelta
        from models import AiInsightRun

        today = date.today()
        period_start = today - timedelta(days=29)
        period_end = today

        exists = (
            db.query(AiInsightRun.id)
            .filter(AiInsightRun.company_id == company.id, AiInsightRun.run_number.like("AIR-DEMO-%"))
            .first()
        )
        if exists:
            print("Demo AI insight run already exists.")
            return

        run = AiInsightRun(
            company_id=company.id,
            run_number="AIR-DEMO-0001",
            period_start=period_start,
            period_end=period_end,
            domains_json=settings.default_domains_json,
            status="pending",
            generated_by_id=user.id,
        )
        db.add(run)
        db.flush()
        run_insight_generation(
            db,
            company,
            user,
            settings,
            run,
            settings.default_domains_json,
            settings.include_executive_brief,
        )
        db.commit()
        print(f"Created demo insight run {run.run_number} (status={run.status}).")
    finally:
        db.close()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Seed AI Reports demo data")
    parser.add_argument("--no-generate", action="store_true", help="Only enable settings, skip demo run")
    args = parser.parse_args()
    seed_demo_ai_reports(generate=not args.no_generate)
