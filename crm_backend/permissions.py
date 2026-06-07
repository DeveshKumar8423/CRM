from sqlalchemy.orm import Session

from models import Permission, RolePermission


def get_permissions_for_role(db: Session, role: str) -> list[str]:
    rows = (
        db.query(Permission.code)
        .join(RolePermission, RolePermission.permission_id == Permission.id)
        .filter(RolePermission.role == role)
        .order_by(Permission.module, Permission.code)
        .all()
    )
    return [row[0] for row in rows]


def role_has_permission(db: Session, role: str, code: str) -> bool:
    return (
        db.query(Permission.id)
        .join(RolePermission, RolePermission.permission_id == Permission.id)
        .filter(RolePermission.role == role, Permission.code == code)
        .first()
        is not None
    )
