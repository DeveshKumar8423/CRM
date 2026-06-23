from __future__ import annotations

"""Seed default numbering configurations."""

from database import SessionLocal
from models import NumberingConfiguration


def seed():
    db = SessionLocal()
    try:
        default_configs = [
            {"entity_name": "CONTACT", "prefix": "CNT", "starting_number": 1, "current_number": 0},
            {"entity_name": "LEAD", "prefix": "LEAD", "starting_number": 1, "current_number": 0},
            {"entity_name": "QUOTATION", "prefix": "QUO", "starting_number": 1, "current_number": 0},
            {"entity_name": "INVOICE", "prefix": "INV", "starting_number": 1000, "current_number": 1000},
            {"entity_name": "PAYMENT", "prefix": "PAY", "starting_number": 1, "current_number": 0},
            {"entity_name": "TASK", "prefix": "TASK", "starting_number": 1, "current_number": 0},
            {"entity_name": "EMPLOYEE", "prefix": "EMP", "starting_number": 1, "current_number": 0},
        ]

        for config_data in default_configs:
            entity_name = config_data["entity_name"]
            existing = (
                db.query(NumberingConfiguration)
                .filter(NumberingConfiguration.entity_name == entity_name)
                .first()
            )
            if not existing:
                config = NumberingConfiguration(**config_data)
                db.add(config)
                print(f"CREATE numbering configuration for {entity_name}")
            else:
                print(f"SKIP numbering configuration for {entity_name} (already exists)")

        db.commit()
        print("Numbering configurations seed complete.")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
