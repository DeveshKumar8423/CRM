"""Seed demo Subscription Management (Phase 1 MVP)."""

from __future__ import annotations

import argparse
from datetime import date, timedelta

from database import SessionLocal
from models import Company, Contact, CustomerSubscription, SubscriptionPlan
from routers.subscriptions_router import _get_settings
from services.subscription_service import initialize_subscription_dates


def seed_demo_subscriptions(reset: bool = False) -> None:
    db = SessionLocal()
    try:
        company = db.query(Company).first()
        if not company:
            print("No company found. Run seed_company.py first.")
            return

        settings = _get_settings(db, company)
        settings.is_enabled = True
        settings.subscription_prefix = "SUB"
        settings.default_reminder_days = [7, 3, 1]
        settings.auto_invoice_mode = "draft"
        settings.notify_roles_json = ["Admin", "Manager", "Accountant"]

        contact = db.query(Contact).filter(Contact.company_id == company.id).first()
        if not contact:
            print("No contact found. Run seed data first.")
            return

        plan = (
            db.query(SubscriptionPlan)
            .filter(SubscriptionPlan.company_id == company.id, SubscriptionPlan.plan_code == "AMC-GOLD")
            .first()
        )
        if not plan:
            plan = SubscriptionPlan(
                company_id=company.id,
                plan_code="AMC-GOLD",
                name="Annual AMC — Gold",
                description="Yearly maintenance contract — demo plan",
                billing_interval="yearly",
                price=24000,
                currency="INR",
                gst_rate=18,
                trial_days=0,
                status="active",
                sort_order=1,
            )
            db.add(plan)
            db.flush()

        monthly = (
            db.query(SubscriptionPlan)
            .filter(SubscriptionPlan.company_id == company.id, SubscriptionPlan.plan_code == "SVC-MONTHLY")
            .first()
        )
        if not monthly:
            monthly = SubscriptionPlan(
                company_id=company.id,
                plan_code="SVC-MONTHLY",
                name="Monthly Service Retainer",
                description="Monthly recurring service fee",
                billing_interval="monthly",
                price=5000,
                currency="INR",
                gst_rate=18,
                status="active",
                sort_order=2,
            )
            db.add(monthly)
            db.flush()

        exists = (
            db.query(CustomerSubscription.id)
            .filter(
                CustomerSubscription.company_id == company.id,
                CustomerSubscription.subscription_number == "SUB-DEMO-001",
            )
            .first()
        )
        if not exists:
            start = date.today() - timedelta(days=30)
            sub = CustomerSubscription(
                company_id=company.id,
                subscription_number="SUB-DEMO-001",
                contact_id=contact.id,
                plan_id=monthly.id,
                quantity=1,
                notes="Phase 1 subscription demo",
            )
            initialize_subscription_dates(sub, monthly, start)
            db.add(sub)

        db.commit()
        print("Subscriptions demo ready")
        print("  CRM: /subscriptions")
        print(f"  Demo subscriber: {contact.name} on {monthly.name}")
        print(f"  Plans: {plan.plan_code}, {monthly.plan_code}")
    finally:
        db.close()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Seed Subscriptions demo data")
    parser.add_argument("--reset", action="store_true")
    args = parser.parse_args()
    seed_demo_subscriptions(reset=args.reset)
