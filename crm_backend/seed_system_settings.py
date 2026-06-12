"""Seed Level 2 system settings and branding asset path."""

import shutil
from pathlib import Path

from database import SessionLocal
from level2_defaults import SYSTEM_SETTING_DEFAULTS
from models import Company, SystemSetting

ROOT = Path(__file__).resolve().parent.parent
BACKEND_ASSETS = Path(__file__).resolve().parent / "assets" / "branding"
FRONTEND_ASSETS = ROOT / "crm_frontend" / "public" / "branding"

LOGO_CANDIDATES = [
    ROOT / "BlackPapers New Logo.svg",
    ROOT / "BlackPapers .png",
    ROOT / "BlackPapers New Logo wo boxx.jpg.jpeg",
]


def _install_logo() -> str | None:
    BACKEND_ASSETS.mkdir(parents=True, exist_ok=True)
    FRONTEND_ASSETS.mkdir(parents=True, exist_ok=True)

    for src in LOGO_CANDIDATES:
        if not src.exists():
            continue
        if src.suffix.lower() == ".svg":
            dest_name = "logo.svg"
        elif src.suffix.lower() in {".png", ".jpeg", ".jpg"}:
            dest_name = f"logo{src.suffix.lower()}"
        else:
            dest_name = "logo" + src.suffix

        backend_dest = BACKEND_ASSETS / dest_name
        frontend_dest = FRONTEND_ASSETS / dest_name
        shutil.copy2(src, backend_dest)
        shutil.copy2(src, frontend_dest)
        print(f"Logo copied from {src.name} -> assets/branding/{dest_name}")
        return dest_name

    print("WARN: No logo file found in repo root")
    return None


def seed():
    logo_filename = _install_logo()
    db = SessionLocal()
    try:
        company = db.query(Company).first()
        if not company:
            print("SKIP: run seed_company.py first")
            return

        settings = (
            db.query(SystemSetting).filter(SystemSetting.company_id == company.id).first()
        )
        if not settings:
            settings = SystemSetting(company_id=company.id)
            db.add(settings)

        for key, value in SYSTEM_SETTING_DEFAULTS.items():
            setattr(settings, key, value)
        if logo_filename:
            settings.logo_filename = logo_filename

        db.commit()
        print("System settings ready (quote/invoice prefixes, default lead source)")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
