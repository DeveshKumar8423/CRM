from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session

from activity import log_activity
from auth_utils import (
    create_access_token,
    get_client_ip,
    get_current_user,
    get_db,
    hash_password,
    require_permission,
    verify_password,
)
from models import User
from permissions import get_permissions_for_role
from schemas import (
    ChangePasswordRequest,
    LoginRequest,
    ProfileUpdateRequest,
    SignupRequest,
    TokenResponse,
    UserProfileResponse,
)

router = APIRouter(tags=["auth"])


def _token_response(user: User, message: str, db: Session) -> TokenResponse:
    return TokenResponse(
        access_token=create_access_token(user),
        message=message,
        role=user.role,
        name=user.name,
        email=user.email,
        permissions=get_permissions_for_role(db, user.role),
    )


@router.post("/signup", response_model=TokenResponse)
def signup(data: SignupRequest, request: Request, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == data.email.lower()).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    user = User(
        name=data.name.strip(),
        email=data.email.lower(),
        phone=data.phone,
        password=hash_password(data.password),
        role="User",
        status="active",
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    log_activity(
        db,
        "signup",
        user_id=user.id,
        email=user.email,
        ip_address=get_client_ip(request),
    )

    return _token_response(user, "Signup Success", db)


@router.post("/login", response_model=TokenResponse)
def login(data: LoginRequest, request: Request, db: Session = Depends(get_db)):
    email = data.email.lower()
    user = db.query(User).filter(User.email == email).first()
    ip = get_client_ip(request)

    if not user:
        log_activity(
            db,
            "login_failed",
            email=email,
            details="Invalid email",
            ip_address=ip,
        )
        raise HTTPException(status_code=401, detail="Invalid Email")

    if user.status != "active":
        log_activity(
            db,
            "login_failed",
            user_id=user.id,
            email=email,
            details="Inactive account",
            ip_address=ip,
        )
        raise HTTPException(status_code=403, detail="Account is inactive")

    if not verify_password(data.password, user.password):
        log_activity(
            db,
            "login_failed",
            user_id=user.id,
            email=email,
            details="Invalid password",
            ip_address=ip,
        )
        raise HTTPException(status_code=401, detail="Invalid Password")

    user.last_login_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(user)

    log_activity(
        db,
        "login_success",
        user_id=user.id,
        email=user.email,
        ip_address=ip,
    )

    return _token_response(user, "Login Success", db)


@router.post("/logout")
def logout(
    request: Request,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    log_activity(
        db,
        "logout",
        user_id=user.id,
        email=user.email,
        ip_address=get_client_ip(request),
    )
    return {"message": "Logged out"}


@router.get("/users/me/permissions")
def get_my_permissions(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return {"permissions": get_permissions_for_role(db, user.role)}


@router.get("/users/me", response_model=UserProfileResponse)
def get_profile(user: User = Depends(require_permission("profile.view"))):
    return user


@router.put("/users/me", response_model=UserProfileResponse)
def update_profile(
    data: ProfileUpdateRequest,
    request: Request,
    user: User = Depends(require_permission("profile.edit")),
    db: Session = Depends(get_db),
):
    user.name = data.name.strip()
    user.phone = data.phone
    db.commit()
    db.refresh(user)

    log_activity(
        db,
        "profile_update",
        user_id=user.id,
        email=user.email,
        ip_address=get_client_ip(request),
    )

    return user


@router.put("/users/me/password")
def change_password(
    data: ChangePasswordRequest,
    request: Request,
    user: User = Depends(require_permission("profile.change_password")),
    db: Session = Depends(get_db),
):
    if not verify_password(data.current_password, user.password):
        raise HTTPException(status_code=400, detail="Current password is incorrect")

    user.password = hash_password(data.new_password)
    db.commit()

    log_activity(
        db,
        "password_change",
        user_id=user.id,
        email=user.email,
        ip_address=get_client_ip(request),
    )

    return {"message": "Password updated successfully"}
