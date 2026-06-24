"""Seed demo Quality Control (Phase 1 MVP)."""

from __future__ import annotations

import argparse

from database import SessionLocal
from models import Company, QualityChecklistTemplate, QualitySettings
from quality_config import DEFAULT_CHECKLIST, SEED_INSPECTION_POINTS
from services.quality_service import get_quality_settings, seed_inspection_points


def seed_demo_quality(reset: bool = False) -> None:
    db = SessionLocal()
    try:
        company = db.query(Company).first()
        if not company:
            print("No company found. Run seed_company.py first.")
            return

        settings = get_quality_settings(db, company)
        settings.is_enabled = True
        settings.default_incoming_required = True
        settings.block_on_fail_default = True
        settings.alert_repeat_fail_threshold = 3
        settings.alert_overdue_hours = 24

        seed_inspection_points(db, company.id)

        from models import InspectionPoint

        final_point = (
            db.query(InspectionPoint)
            .filter(InspectionPoint.company_id == company.id, InspectionPoint.code == "WO_FINAL")
            .first()
        )
        incoming_point = (
            db.query(InspectionPoint)
            .filter(InspectionPoint.company_id == company.id, InspectionPoint.code == "INCOMING_GRN")
            .first()
        )

        for point, name in [
            (final_point, "Standard — final inspection"),
            (incoming_point, "Standard — incoming GRN"),
        ]:
            if not point:
                continue
            tmpl = (
                db.query(QualityChecklistTemplate)
                .filter(
                    QualityChecklistTemplate.company_id == company.id,
                    QualityChecklistTemplate.inspection_point_id == point.id,
                    QualityChecklistTemplate.name == name,
                )
                .first()
            )
            if not tmpl:
                tmpl = QualityChecklistTemplate(
                    company_id=company.id,
                    name=name,
                    inspection_point_id=point.id,
                    items_json=DEFAULT_CHECKLIST,
                    status="active",
                    version="1.0",
                )
                db.add(tmpl)
                db.flush()
            else:
                tmpl.status = "active"
                tmpl.items_json = DEFAULT_CHECKLIST
            point.default_template_id = tmpl.id

        db.commit()
        print("Quality Control demo ready")
        print(f"  Inspection points: {len(SEED_INSPECTION_POINTS)}")
        print("  CRM: /quality")
    finally:
        db.close()


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--reset", action="store_true")
    args = parser.parse_args()
    seed_demo_quality(reset=args.reset)
