from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, EmailStr, Field


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class SignupRequest(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    email: EmailStr
    password: str = Field(min_length=6, max_length=128)
    phone: str | None = Field(default=None, max_length=30)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    message: str
    role: str
    name: str
    email: str
    permissions: list[str] = []


class PermissionResponse(BaseModel):
    code: str
    name: str
    module: str

    class Config:
        from_attributes = True


class RoleMatrixResponse(BaseModel):
    roles: list[str]
    permissions: list[PermissionResponse]
    matrix: dict[str, list[str]]


class UserProfileResponse(BaseModel):
    id: int
    company_id: int | None
    employee_id: str | None
    name: str
    email: str
    phone: str | None
    role: str
    status: str
    designation: str | None
    department: str | None
    created_at: datetime | None
    updated_at: datetime | None
    last_login_at: datetime | None

    class Config:
        from_attributes = True


class CompanyResponse(BaseModel):
    id: int
    legal_name: str
    display_name: str
    email: str | None
    phone: str | None
    website: str | None
    description: str | None
    address_line1: str | None
    address_line2: str | None
    city: str | None
    state: str | None
    pincode: str | None
    country: str
    gstin: str | None
    pan: str | None
    currency: str
    financial_year_start_month: int
    timezone: str
    created_at: datetime | None
    updated_at: datetime | None

    class Config:
        from_attributes = True


class CompanyCreateRequest(BaseModel):
    legal_name: str = Field(min_length=2, max_length=200)
    display_name: str = Field(min_length=2, max_length=200)
    email: EmailStr | None = None
    phone: str | None = Field(default=None, max_length=30)
    website: str | None = Field(default=None, max_length=255)
    description: str | None = Field(default=None, max_length=2000)
    address_line1: str | None = Field(default=None, max_length=255)
    address_line2: str | None = Field(default=None, max_length=255)
    city: str | None = Field(default=None, max_length=100)
    state: str | None = Field(default=None, max_length=100)
    pincode: str | None = Field(default=None, max_length=10)
    country: str = Field(default="India", max_length=100)
    gstin: str | None = Field(default=None, max_length=15)
    pan: str | None = Field(default=None, max_length=10)
    currency: str = Field(default="INR", max_length=3)
    financial_year_start_month: int = Field(default=4, ge=1, le=12)
    timezone: str = Field(default="Asia/Kolkata", max_length=50)


class CompanyUpdateRequest(BaseModel):
    legal_name: str = Field(min_length=2, max_length=200)
    display_name: str = Field(min_length=2, max_length=200)
    email: EmailStr | None = None
    phone: str | None = Field(default=None, max_length=30)
    website: str | None = Field(default=None, max_length=255)
    description: str | None = Field(default=None, max_length=2000)
    address_line1: str | None = Field(default=None, max_length=255)
    address_line2: str | None = Field(default=None, max_length=255)
    city: str | None = Field(default=None, max_length=100)
    state: str | None = Field(default=None, max_length=100)
    pincode: str | None = Field(default=None, max_length=10)
    country: str = Field(default="India", max_length=100)
    gstin: str | None = Field(default=None, max_length=15)
    pan: str | None = Field(default=None, max_length=10)
    currency: str = Field(default="INR", max_length=3)
    financial_year_start_month: int = Field(default=4, ge=1, le=12)
    timezone: str = Field(default="Asia/Kolkata", max_length=50)


class ProfileUpdateRequest(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    phone: str | None = Field(default=None, max_length=30)


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str = Field(min_length=6, max_length=128)


class AdminCreateUserRequest(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    email: EmailStr
    password: str = Field(min_length=6, max_length=128)
    role: str
    phone: str | None = Field(default=None, max_length=30)
    employee_id: str | None = Field(default=None, max_length=20)
    designation: str | None = Field(default=None, max_length=120)
    department: str | None = Field(default=None, max_length=120)
    status: str = "active"


class AdminUpdateUserRequest(BaseModel):
    name: str | None = Field(default=None, min_length=2, max_length=120)
    phone: str | None = Field(default=None, max_length=30)
    role: str | None = None
    status: str | None = None
    designation: str | None = Field(default=None, max_length=120)
    department: str | None = Field(default=None, max_length=120)
    employee_id: str | None = Field(default=None, max_length=20)


class AdminResetPasswordRequest(BaseModel):
    new_password: str = Field(min_length=6, max_length=128)


class StaffAssigneeResponse(BaseModel):
    id: int
    name: str
    email: str
    role: str


class ContactBaseFields(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    organization_name: str | None = Field(default=None, max_length=200)
    email: str | None = Field(default=None, max_length=255)
    phone: str | None = Field(default=None, max_length=30)
    alt_phone: str | None = Field(default=None, max_length=30)
    contact_type: str
    status: str = "active"
    designation: str | None = Field(default=None, max_length=120)
    website: str | None = Field(default=None, max_length=255)
    address_line1: str | None = Field(default=None, max_length=255)
    address_line2: str | None = Field(default=None, max_length=255)
    city: str | None = Field(default=None, max_length=100)
    state: str | None = Field(default=None, max_length=100)
    pincode: str | None = Field(default=None, max_length=10)
    country: str = Field(default="India", max_length=100)
    gstin: str | None = Field(default=None, max_length=15)
    pan: str | None = Field(default=None, max_length=10)
    assigned_to_id: int | None = None


class ContactCreateRequest(ContactBaseFields):
    pass


class ContactUpdateRequest(ContactBaseFields):
    pass


class ContactResponse(BaseModel):
    id: int
    company_id: int
    user_id: int | None
    name: str
    organization_name: str | None
    email: str | None
    phone: str | None
    alt_phone: str | None
    contact_type: str
    status: str
    designation: str | None
    website: str | None
    address_line1: str | None
    address_line2: str | None
    city: str | None
    state: str | None
    pincode: str | None
    country: str
    gstin: str | None
    pan: str | None
    assigned_to_id: int | None
    assigned_to_name: str | None = None
    created_by_id: int | None
    created_by_name: str | None = None
    created_at: datetime | None
    updated_at: datetime | None


class ContactListResponse(BaseModel):
    items: list[ContactResponse]
    total: int
    page: int
    limit: int


class ContactNoteCreateRequest(BaseModel):
    body: str = Field(min_length=1, max_length=5000)


class ContactNoteResponse(BaseModel):
    id: int
    contact_id: int
    body: str
    author_id: int
    author_name: str | None
    created_at: datetime | None


class ContactActivityCreateRequest(BaseModel):
    activity_type: str
    subject: str | None = Field(default=None, max_length=200)
    body: str = Field(min_length=1, max_length=5000)


class ContactActivityResponse(BaseModel):
    id: int
    contact_id: int
    activity_type: str
    subject: str | None
    body: str
    author_id: int
    author_name: str | None
    created_at: datetime | None


class ProductBaseFields(BaseModel):
    name: str = Field(min_length=2, max_length=255)
    service_code: str | None = Field(default=None, max_length=40)
    entity_type: str | None = Field(default=None, max_length=80)
    category: str | None = Field(default=None, max_length=120)
    sub_category: str | None = Field(default=None, max_length=120)
    unit: str = Field(default="Service", max_length=30)
    govt_charges: float | None = None
    our_fees: float | None = None
    gst_amount: float | None = None
    total_price: float | None = None
    market_price: float | None = None
    offer_price: float | None = None
    last_price: float | None = None
    gst_rate: float = Field(default=18, ge=0, le=100)
    filing_timeline: str | None = Field(default=None, max_length=80)
    completion_timeline: str | None = Field(default=None, max_length=80)
    description: str | None = Field(default=None, max_length=8000)
    status: str = "active"


class ProductCreateRequest(ProductBaseFields):
    pass


class ProductUpdateRequest(ProductBaseFields):
    pass


class ProductResponse(BaseModel):
    id: int
    company_id: int
    service_code: str | None
    name: str
    entity_type: str | None
    category: str | None
    sub_category: str | None
    unit: str
    govt_charges: float | None
    our_fees: float | None
    gst_amount: float | None
    total_price: float | None
    market_price: float | None
    offer_price: float | None
    last_price: float | None
    gst_rate: float
    filing_timeline: str | None
    completion_timeline: str | None
    description: str | None
    status: str
    created_at: datetime | None
    updated_at: datetime | None


class ProductListResponse(BaseModel):
    items: list[ProductResponse]
    total: int
    page: int
    limit: int


class ContactStatsResponse(BaseModel):
    total: int
    active: int
    inactive: int
    active_percent: float
    inactive_percent: float


class ActivityLogResponse(BaseModel):
    id: int
    user_id: int | None
    email: str | None
    action: str
    details: str | None
    ip_address: str | None
    created_at: datetime | None

    class Config:
        from_attributes = True


class ActivityLogListResponse(BaseModel):
    items: list[ActivityLogResponse]
    total: int
    page: int
    limit: int
