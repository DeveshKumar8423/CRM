from __future__ import annotations

"""Seed permissions and role-permission mappings."""

from database import SessionLocal
from models import Permission, RolePermission
from permissions_data import PERMISSIONS, ROLE_PERMISSIONS


def seed():
    db = SessionLocal()
    try:
        code_to_id: dict[str, int] = {}

        for code, name, module in PERMISSIONS:
            perm = db.query(Permission).filter(Permission.code == code).first()
            if not perm:
                perm = Permission(code=code, name=name, module=module)
                db.add(perm)
                db.flush()
                print(f"CREATE permission {code}")
            else:
                perm.name = name
                perm.module = module
                print(f"UPDATE permission {code}")
            code_to_id[code] = perm.id

        db.query(RolePermission).delete()

        for role, codes in ROLE_PERMISSIONS.items():
            for code in codes:
                if code not in code_to_id:
                    print(f"SKIP unknown permission {code} for {role}")
                    continue
                db.add(
                    RolePermission(role=role, permission_id=code_to_id[code])
                )
            print(f"ASSIGN {len(codes)} permissions to {role}")

        db.commit()
        print("Permissions seed complete.")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
