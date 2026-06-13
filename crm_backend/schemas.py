from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field


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

# Password reset schemas
class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ForgotPasswordResponse(BaseModel):
    success: bool = True
    message: str = "If the account exists, a reset link has been sent."

class VerifyResetTokenResponse(BaseModel):
    valid: bool

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str = Field(min_length=6, max_length=128)

class ResetPasswordResponse(BaseModel):
    success: bool = True
    message: str = "Password updated successfully"

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


class SystemSettingResponse(BaseModel):
    id: int
    company_id: int
    quote_prefix: str
    invoice_prefix: str
    quote_date_format: str
    invoice_date_format: str
    default_lead_source: str
    logo_filename: str | None

    class Config:
        from_attributes = True


class LeadBaseFields(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    phone: str | None = Field(default=None, max_length=30)
    email: str | None = Field(default=None, max_length=255)
    organization_name: str | None = Field(default=None, max_length=200)
    city: str | None = Field(default=None, max_length=100)
    requirement: str | None = Field(default=None, max_length=200)
    exact_requirement: str | None = Field(default=None, max_length=5000)
    source: str = Field(default="Omnichannel", max_length=50)
    status: str = Field(default="open", max_length=30)
    notes: str | None = Field(default=None, max_length=5000)
    assigned_to_id: int | None = None
    registered_at: datetime | None = None


class LeadCreateRequest(LeadBaseFields):
    pass


class LeadUpdateRequest(LeadBaseFields):
    pass


class LeadResponse(BaseModel):
    id: int
    company_id: int
    contact_id: int | None
    name: str
    phone: str | None
    email: str | None
    organization_name: str | None
    city: str | None
    requirement: str | None
    exact_requirement: str | None
    source: str
    status: str
    csv_status: str | None
    notes: str | None
    assigned_to_id: int | None
    assigned_to_name: str | None = None
    created_by_id: int | None
    created_by_name: str | None = None
    registered_at: datetime | None
    created_at: datetime | None
    updated_at: datetime | None


class LeadListResponse(BaseModel):
    items: list[LeadResponse]
    total: int
    page: int
    limit: int


class LeadStatsResponse(BaseModel):
    total: int
    open: int
    hot: int
    follow_up: int
    cold: int
    lost: int
    qualified: int
    converted: int


class LeadDuplicateMatch(BaseModel):
    id: int
    name: str
    phone: str | None
    organization_name: str | None = None


class LeadDuplicateCheckResponse(BaseModel):
    phone: str
    has_duplicates: bool
    leads: list[LeadDuplicateMatch]
    contacts: list[LeadDuplicateMatch]


class LeadConvertResponse(BaseModel):
    lead: LeadResponse
    contact_id: int
    message: str


class DealBaseFields(BaseModel):
    title: str = Field(min_length=2, max_length=200)
    stage: str = Field(default="new", max_length=30)
    expected_value: float | None = Field(default=None, ge=0)
    currency: str = Field(default="INR", max_length=3)
    expected_close_date: datetime | None = None
    notes: str | None = Field(default=None, max_length=5000)
    lost_reason: str | None = Field(default=None, max_length=255)
    lead_id: int | None = None
    contact_id: int | None = None
    product_id: int | None = None
    assigned_to_id: int | None = None


class DealCreateRequest(DealBaseFields):
    pass


class DealUpdateRequest(DealBaseFields):
    pass


class DealStageUpdateRequest(BaseModel):
    stage: str = Field(min_length=2, max_length=30)
    lost_reason: str | None = Field(default=None, max_length=255)


class DealResponse(BaseModel):
    id: int
    company_id: int
    title: str
    stage: str
    expected_value: float | None
    currency: str
    expected_close_date: datetime | None
    notes: str | None
    lost_reason: str | None
    closed_at: datetime | None
    lead_id: int | None
    lead_name: str | None = None
    contact_id: int | None
    contact_name: str | None = None
    product_id: int | None
    product_name: str | None = None
    assigned_to_id: int | None
    assigned_to_name: str | None = None
    created_by_id: int | None
    created_by_name: str | None = None
    created_at: datetime | None
    updated_at: datetime | None


class DealListResponse(BaseModel):
    items: list[DealResponse]
    total: int
    page: int
    limit: int


class DealStatsResponse(BaseModel):
    total: int
    new: int
    contacted: int
    meeting: int
    proposal: int
    won: int
    lost: int
    pipeline_value: float
    won_value: float


class DealPipelineColumn(BaseModel):
    stage: str
    label: str
    count: int
    total_value: float
    deals: list[DealResponse]


class DealPipelineResponse(BaseModel):
    columns: list[DealPipelineColumn]
    closed: list[DealResponse]


# --- Quotations ---


class QuotationLineItemFields(BaseModel):
    product_id: int | None = None
    sort_order: int = 0
    section: str | None = Field(default=None, max_length=100)
    item_name: str = Field(min_length=1, max_length=255)
    description: str | None = Field(default=None, max_length=5000)
    quantity: float = Field(default=1, ge=0)
    unit: str = Field(default="Service", max_length=30)
    unit_price: float = Field(default=0, ge=0)
    discount_percent: float = Field(default=0, ge=0, le=100)
    discount_amount: float = Field(default=0, ge=0)
    tax_rate: float = Field(default=18, ge=0, le=100)


class QuotationLineItemResponse(QuotationLineItemFields):
    id: int
    line_subtotal: float
    line_total: float
    product_name: str | None = None


class QuotationBaseFields(BaseModel):
    title: str = Field(min_length=2, max_length=200)
    currency: str = Field(default="INR", max_length=3)
    quote_date: datetime | None = None
    valid_until: datetime | None = None
    deal_id: int | None = None
    lead_id: int | None = None
    contact_id: int | None = None
    assigned_to_id: int | None = None
    client_name: str | None = Field(default=None, max_length=120)
    client_email: str | None = Field(default=None, max_length=255)
    client_org: str | None = Field(default=None, max_length=200)
    attention_to: str | None = Field(default=None, max_length=120)
    billing_address: str | None = Field(default=None, max_length=5000)
    shipping_address: str | None = Field(default=None, max_length=5000)
    header_discount_amount: float = Field(default=0, ge=0)
    header_discount_percent: float = Field(default=0, ge=0, le=100)
    scope_notes: str | None = Field(default=None, max_length=5000)
    deliverables: str | None = Field(default=None, max_length=5000)
    timeline_notes: str | None = Field(default=None, max_length=5000)
    payment_terms: str | None = Field(default=None, max_length=5000)
    validity_clause: str | None = Field(default=None, max_length=5000)
    cancellation_clause: str | None = Field(default=None, max_length=5000)
    legal_footer: str | None = Field(default=None, max_length=5000)
    internal_notes: str | None = Field(default=None, max_length=5000)


class QuotationCreateRequest(QuotationBaseFields):
    line_items: list[QuotationLineItemFields] = Field(default_factory=list)


class QuotationUpdateRequest(QuotationCreateRequest):
    pass


class QuotationResponse(BaseModel):
    id: int
    company_id: int
    quote_number: str
    title: str
    status: str
    version: int
    currency: str
    quote_date: datetime | None
    valid_until: datetime | None
    deal_id: int | None
    deal_title: str | None = None
    lead_id: int | None
    lead_name: str | None = None
    contact_id: int | None
    contact_name: str | None = None
    assigned_to_id: int | None
    assigned_to_name: str | None = None
    created_by_id: int | None
    created_by_name: str | None = None
    approved_by_id: int | None
    approved_by_name: str | None = None
    parent_quote_id: int | None
    root_quote_id: int | None
    client_name: str | None
    client_email: str | None
    client_org: str | None
    attention_to: str | None
    billing_address: str | None
    shipping_address: str | None
    subtotal: float
    line_discount_total: float
    header_discount_amount: float
    header_discount_percent: float
    total_tax: float
    grand_total: float
    scope_notes: str | None
    deliverables: str | None
    timeline_notes: str | None
    payment_terms: str | None
    validity_clause: str | None
    cancellation_clause: str | None
    legal_footer: str | None
    internal_notes: str | None
    approval_comments: str | None
    requires_approval: bool
    share_token: str | None = None
    share_url: str | None = None
    sent_at: datetime | None
    viewed_at: datetime | None
    accepted_at: datetime | None
    rejected_at: datetime | None
    approved_at: datetime | None
    cancelled_at: datetime | None
    client_rejection_reason: str | None
    line_items: list[QuotationLineItemResponse] = Field(default_factory=list)
    created_at: datetime | None
    updated_at: datetime | None


class QuotationListResponse(BaseModel):
    items: list[QuotationResponse]
    total: int
    page: int
    limit: int


class QuotationStatsResponse(BaseModel):
    total: int
    draft: int
    pending_approval: int
    approved: int
    sent: int
    viewed: int
    negotiation: int
    accepted: int
    rejected: int
    expired: int
    cancelled: int
    total_value: float
    accepted_value: float
    expiring_soon: int


class QuotationStatusOption(BaseModel):
    value: str
    label: str


class QuotationApprovalRequest(BaseModel):
    comments: str | None = Field(default=None, max_length=2000)


class QuotationRejectRequest(BaseModel):
    comments: str | None = Field(default=None, max_length=2000)


class QuotationSendRequest(BaseModel):
    recipient_email: str | None = Field(default=None, max_length=255)
    message: str | None = Field(default=None, max_length=2000)


class QuotationClientActionRequest(BaseModel):
    reason: str | None = Field(default=None, max_length=2000)
    message: str | None = Field(default=None, max_length=2000)


class QuotationVersionSummary(BaseModel):
    id: int
    quote_number: str
    version: int
    status: str
    grand_total: float
    created_at: datetime | None
    updated_at: datetime | None


class QuotationCompanyBranding(BaseModel):
    display_name: str
    legal_name: str
    email: str | None
    phone: str | None
    website: str | None
    address_line1: str | None
    address_line2: str | None
    city: str | None
    state: str | None
    pincode: str | None
    country: str
    gstin: str | None
    pan: str | None
    logo_filename: str | None


class QuotationPublicResponse(BaseModel):
    quote: QuotationResponse
    company: QuotationCompanyBranding
    is_expired: bool
    can_accept: bool


# --- Sales Orders ---


class SalesOrderMilestoneFields(BaseModel):
    sort_order: int = 0
    title: str = Field(min_length=1, max_length=200)
    description: str | None = Field(default=None, max_length=2000)
    status: str = Field(default="pending", max_length=20)
    due_date: datetime | None = None
    owner_id: int | None = None


class SalesOrderMilestoneResponse(SalesOrderMilestoneFields):
    id: int
    completed_at: datetime | None = None
    owner_name: str | None = None


class SalesOrderLineItemFields(BaseModel):
    product_id: int | None = None
    quotation_line_item_id: int | None = None
    sort_order: int = 0
    section: str | None = Field(default=None, max_length=100)
    item_name: str = Field(min_length=1, max_length=255)
    description: str | None = Field(default=None, max_length=5000)
    quantity: float = Field(default=1, ge=0)
    unit: str = Field(default="Service", max_length=30)
    unit_price: float = Field(default=0, ge=0)
    discount_percent: float = Field(default=0, ge=0, le=100)
    discount_amount: float = Field(default=0, ge=0)
    tax_rate: float = Field(default=18, ge=0, le=100)


class SalesOrderLineItemResponse(SalesOrderLineItemFields):
    id: int
    line_subtotal: float
    line_total: float
    fulfilled_quantity: float
    fulfillment_status: str
    product_name: str | None = None


class SalesOrderBaseFields(BaseModel):
    title: str = Field(min_length=2, max_length=200)
    order_type: str = Field(default="mixed", max_length=30)
    currency: str = Field(default="INR", max_length=3)
    order_date: datetime | None = None
    due_date: datetime | None = None
    internal_target_date: datetime | None = None
    quotation_id: int | None = None
    deal_id: int | None = None
    lead_id: int | None = None
    contact_id: int | None = None
    assigned_to_id: int | None = None
    client_name: str | None = Field(default=None, max_length=120)
    client_email: str | None = Field(default=None, max_length=255)
    client_phone: str | None = Field(default=None, max_length=30)
    client_org: str | None = Field(default=None, max_length=200)
    attention_to: str | None = Field(default=None, max_length=120)
    billing_address: str | None = Field(default=None, max_length=5000)
    delivery_address: str | None = Field(default=None, max_length=5000)
    header_discount_amount: float = Field(default=0, ge=0)
    header_discount_percent: float = Field(default=0, ge=0, le=100)
    billing_notes: str | None = Field(default=None, max_length=5000)
    payment_milestone_notes: str | None = Field(default=None, max_length=5000)
    delivery_instructions: str | None = Field(default=None, max_length=5000)
    internal_notes: str | None = Field(default=None, max_length=5000)


class SalesOrderCreateRequest(SalesOrderBaseFields):
    line_items: list[SalesOrderLineItemFields] = Field(default_factory=list)
    milestones: list[SalesOrderMilestoneFields] = Field(default_factory=list)


class SalesOrderUpdateRequest(SalesOrderCreateRequest):
    pass


class SalesOrderResponse(BaseModel):
    id: int
    company_id: int
    order_number: str
    title: str
    status: str
    version: int
    order_type: str
    source_type: str
    currency: str
    order_date: datetime | None
    confirmation_date: datetime | None
    due_date: datetime | None
    internal_target_date: datetime | None
    quotation_id: int | None
    quotation_number: str | None = None
    deal_id: int | None
    deal_title: str | None = None
    lead_id: int | None
    lead_name: str | None = None
    contact_id: int | None
    contact_name: str | None = None
    assigned_to_id: int | None
    assigned_to_name: str | None = None
    created_by_id: int | None
    created_by_name: str | None = None
    confirmed_by_id: int | None
    confirmed_by_name: str | None = None
    parent_order_id: int | None
    root_order_id: int | None
    client_name: str | None
    client_email: str | None
    client_phone: str | None
    client_org: str | None
    attention_to: str | None
    billing_address: str | None
    delivery_address: str | None
    subtotal: float
    line_discount_total: float
    header_discount_amount: float
    header_discount_percent: float
    total_tax: float
    grand_total: float
    billing_notes: str | None
    payment_milestone_notes: str | None
    delivery_instructions: str | None
    internal_notes: str | None
    hold_reason: str | None
    cancellation_reason: str | None
    completion_notes: str | None
    fulfillment_progress: int
    billing_status: str
    preparation_status: str
    share_token: str | None = None
    share_url: str | None = None
    sent_for_confirmation_at: datetime | None
    confirmed_at: datetime | None
    closed_at: datetime | None
    cancelled_at: datetime | None
    hold_at: datetime | None
    hold_resume_date: datetime | None
    last_status_change_at: datetime | None
    line_items: list[SalesOrderLineItemResponse] = Field(default_factory=list)
    milestones: list[SalesOrderMilestoneResponse] = Field(default_factory=list)
    created_at: datetime | None
    updated_at: datetime | None


class SalesOrderListResponse(BaseModel):
    items: list[SalesOrderResponse]
    total: int
    page: int
    limit: int


class SalesOrderStatsResponse(BaseModel):
    total: int
    draft: int
    awaiting_confirmation: int
    confirmed: int
    in_preparation: int
    in_execution: int
    partially_delivered: int
    delivered: int
    in_billing: int
    on_hold: int
    completed: int
    cancelled: int
    closed: int
    total_value: float
    confirmed_value: float
    due_soon: int
    overdue: int


class SalesOrderStatusOption(BaseModel):
    value: str
    label: str


class SalesOrderReasonRequest(BaseModel):
    reason: str = Field(min_length=1, max_length=2000)
    resume_date: datetime | None = None


class SalesOrderProgressRequest(BaseModel):
    fulfillment_progress: int = Field(ge=0, le=100)
    notes: str | None = Field(default=None, max_length=2000)


class SalesOrderSendConfirmationRequest(BaseModel):
    recipient_email: str | None = Field(default=None, max_length=255)
    message: str | None = Field(default=None, max_length=2000)


class SalesOrderClientActionRequest(BaseModel):
    reason: str | None = Field(default=None, max_length=2000)
    message: str | None = Field(default=None, max_length=2000)


class SalesOrderVersionSummary(BaseModel):
    id: int
    order_number: str
    version: int
    status: str
    grand_total: float
    created_at: datetime | None
    updated_at: datetime | None


class SalesOrderPublicResponse(BaseModel):
    order: SalesOrderResponse
    company: QuotationCompanyBranding
    can_confirm: bool


# --- Invoices ---


class InvoiceLineItemFields(BaseModel):
    product_id: int | None = None
    sales_order_line_item_id: int | None = None
    sort_order: int = 0
    section: str | None = Field(default=None, max_length=100)
    item_name: str = Field(min_length=1, max_length=255)
    description: str | None = Field(default=None, max_length=5000)
    quantity: float = Field(default=1, ge=0)
    unit: str = Field(default="Service", max_length=30)
    unit_price: float = Field(default=0, ge=0)
    discount_percent: float = Field(default=0, ge=0, le=100)
    discount_amount: float = Field(default=0, ge=0)
    tax_rate: float = Field(default=18, ge=0, le=100)


class InvoiceLineItemResponse(InvoiceLineItemFields):
    id: int
    line_subtotal: float
    line_total: float
    product_name: str | None = None


class InvoicePaymentFields(BaseModel):
    amount: float = Field(gt=0)
    payment_date: datetime
    payment_method: str = Field(default="bank_transfer", max_length=30)
    reference: str | None = Field(default=None, max_length=100)
    note: str | None = Field(default=None, max_length=2000)


class InvoicePaymentResponse(InvoicePaymentFields):
    id: int
    recorded_by_id: int | None
    recorded_by_name: str | None = None
    created_at: datetime | None


class InvoiceBaseFields(BaseModel):
    title: str = Field(min_length=2, max_length=200)
    invoice_type: str = Field(default="standard", max_length=30)
    currency: str = Field(default="INR", max_length=3)
    issue_date: datetime | None = None
    due_date: datetime | None = None
    sales_order_id: int | None = None
    quotation_id: int | None = None
    deal_id: int | None = None
    contact_id: int | None = None
    assigned_to_id: int | None = None
    client_name: str | None = Field(default=None, max_length=120)
    client_email: str | None = Field(default=None, max_length=255)
    client_phone: str | None = Field(default=None, max_length=30)
    client_org: str | None = Field(default=None, max_length=200)
    client_gstin: str | None = Field(default=None, max_length=15)
    attention_to: str | None = Field(default=None, max_length=120)
    billing_address: str | None = Field(default=None, max_length=5000)
    header_discount_amount: float = Field(default=0, ge=0)
    header_discount_percent: float = Field(default=0, ge=0, le=100)
    round_off: float = Field(default=0)
    payment_terms: str | None = Field(default=None, max_length=5000)
    bank_instructions: str | None = Field(default=None, max_length=5000)
    billing_notes: str | None = Field(default=None, max_length=5000)
    internal_notes: str | None = Field(default=None, max_length=5000)


class InvoiceCreateRequest(InvoiceBaseFields):
    line_items: list[InvoiceLineItemFields] = Field(default_factory=list)


class InvoiceUpdateRequest(InvoiceCreateRequest):
    pass


class InvoiceResponse(BaseModel):
    id: int
    company_id: int
    invoice_number: str | None
    title: str
    status: str
    version: int
    invoice_type: str
    source_type: str
    currency: str
    issue_date: datetime | None
    due_date: datetime | None
    sales_order_id: int | None
    sales_order_number: str | None = None
    quotation_id: int | None
    quotation_number: str | None = None
    deal_id: int | None
    deal_title: str | None = None
    contact_id: int | None
    contact_name: str | None = None
    assigned_to_id: int | None
    assigned_to_name: str | None = None
    created_by_id: int | None
    created_by_name: str | None = None
    reviewed_by_id: int | None
    reviewed_by_name: str | None = None
    issued_by_id: int | None
    issued_by_name: str | None = None
    parent_invoice_id: int | None
    root_invoice_id: int | None
    client_name: str | None
    client_email: str | None
    client_phone: str | None
    client_org: str | None
    client_gstin: str | None
    attention_to: str | None
    billing_address: str | None
    subtotal: float
    line_discount_total: float
    header_discount_amount: float
    header_discount_percent: float
    total_tax: float
    round_off: float
    grand_total: float
    amount_paid: float
    outstanding_amount: float
    write_off_amount: float
    payment_terms: str | None
    bank_instructions: str | None
    billing_notes: str | None
    internal_notes: str | None
    review_comments: str | None
    cancellation_reason: str | None
    adjustment_reason: str | None
    requires_review: bool
    share_token: str | None = None
    share_url: str | None = None
    reviewed_at: datetime | None
    approved_at: datetime | None
    issued_at: datetime | None
    sent_at: datetime | None
    viewed_at: datetime | None
    closed_at: datetime | None
    cancelled_at: datetime | None
    last_status_change_at: datetime | None
    last_payment_at: datetime | None
    line_items: list[InvoiceLineItemResponse] = Field(default_factory=list)
    payments: list[InvoicePaymentResponse] = Field(default_factory=list)
    created_at: datetime | None
    updated_at: datetime | None


class InvoiceListResponse(BaseModel):
    items: list[InvoiceResponse]
    total: int
    page: int
    limit: int


class InvoiceStatsResponse(BaseModel):
    total: int
    draft: int
    awaiting_review: int
    issued: int
    sent: int
    partially_paid: int
    paid: int
    overdue: int
    total_billed: float
    total_collected: float
    total_outstanding: float


class InvoiceStatusOption(BaseModel):
    value: str
    label: str


class InvoiceReviewRequest(BaseModel):
    comments: str | None = Field(default=None, max_length=2000)


class InvoiceReasonRequest(BaseModel):
    reason: str = Field(min_length=1, max_length=2000)


class InvoiceSendRequest(BaseModel):
    recipient_email: str | None = Field(default=None, max_length=255)
    message: str | None = Field(default=None, max_length=2000)


class InvoicePublicResponse(BaseModel):
    invoice: InvoiceResponse
    company: QuotationCompanyBranding
    is_overdue: bool


# Client Notes


class ClientNoteCreateRequest(BaseModel):
    contact_id: int | None = None
    lead_id: int | None = None
    deal_id: int | None = None
    quotation_id: int | None = None
    sales_order_id: int | None = None
    invoice_id: int | None = None
    note_type: str = "call"
    title: str = Field(min_length=1, max_length=200)
    body: str = Field(min_length=1, max_length=10000)
    visibility_scope: str = "team"
    tags: str | None = Field(default=None, max_length=500)
    structured_data: str | None = Field(default=None, max_length=5000)
    is_pinned: bool = False
    is_sensitive: bool = False
    follow_up_required: bool = False
    follow_up_due_date: datetime | None = None
    follow_up_priority: str = "normal"
    assigned_to_id: int | None = None


class ClientNoteUpdateRequest(BaseModel):
    note_type: str | None = None
    title: str | None = Field(default=None, min_length=1, max_length=200)
    body: str | None = Field(default=None, min_length=1, max_length=10000)
    visibility_scope: str | None = None
    tags: str | None = Field(default=None, max_length=500)
    structured_data: str | None = Field(default=None, max_length=5000)
    is_pinned: bool | None = None
    is_sensitive: bool | None = None
    is_resolved: bool | None = None
    follow_up_required: bool | None = None
    follow_up_due_date: datetime | None = None
    follow_up_priority: str | None = None
    assigned_to_id: int | None = None


class ClientNoteRevisionResponse(BaseModel):
    id: int
    editor_id: int
    editor_name: str | None = None
    note_type: str
    title: str
    body: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ClientNoteResponse(BaseModel):
    id: int
    contact_id: int | None = None
    contact_name: str | None = None
    lead_id: int | None = None
    deal_id: int | None = None
    deal_title: str | None = None
    quotation_id: int | None = None
    quotation_number: str | None = None
    sales_order_id: int | None = None
    sales_order_number: str | None = None
    invoice_id: int | None = None
    invoice_number: str | None = None
    author_id: int
    author_name: str | None = None
    assigned_to_id: int | None = None
    assigned_to_name: str | None = None
    last_edited_by_id: int | None = None
    last_edited_by_name: str | None = None
    note_type: str
    title: str
    body: str
    visibility_scope: str
    tags: str | None = None
    structured_data: str | None = None
    is_pinned: bool
    pin_order: int
    is_sensitive: bool
    is_resolved: bool
    follow_up_required: bool
    follow_up_due_date: datetime | None = None
    follow_up_priority: str
    follow_up_completed_at: datetime | None = None
    follow_up_overdue: bool = False
    revision_count: int
    created_at: datetime
    updated_at: datetime
    revisions: list[ClientNoteRevisionResponse] = []

    model_config = ConfigDict(from_attributes=True)


class ClientNoteListResponse(BaseModel):
    items: list[ClientNoteResponse]
    total: int
    page: int
    limit: int


class ClientNoteStatsResponse(BaseModel):
    total: int
    pinned: int
    follow_up_pending: int
    follow_up_overdue: int
    recent_7_days: int


class ClientNoteTypeOption(BaseModel):
    value: str
    label: str


# Sales Reports


class SalesReportPeriodOption(BaseModel):
    value: str
    label: str


class SalesReportKpiCard(BaseModel):
    key: str
    label: str
    value: float | int | str
    unit: str | None = None
    delta_percent: float | None = None
    delta_label: str | None = None


class SalesReportTrendPoint(BaseModel):
    label: str
    value: float


class SalesReportRankRow(BaseModel):
    id: int | str | None = None
    name: str
    count: int = 0
    value: float = 0
    rate: float | None = None
    link: str | None = None
    badge: str | None = None


class SalesReportConversionFunnel(BaseModel):
    stage: str
    label: str
    count: int
    value: float
    rate_from_previous: float | None = None


class SalesReportPendingDeal(BaseModel):
    id: int
    title: str
    stage: str
    stage_label: str
    expected_value: float
    currency: str
    owner_name: str | None
    expected_close_date: datetime | None
    updated_at: datetime | None
    days_stale: int
    is_overdue: bool
    is_stale: bool
    badge: str | None = None


class SalesReportPipelineStage(BaseModel):
    stage: str
    label: str
    count: int
    value: float
    avg_age_days: float


class SalesReportOverviewResponse(BaseModel):
    period_label: str
    date_from: datetime
    date_to: datetime
    kpis: list[SalesReportKpiCard]
    revenue_trend: list[SalesReportTrendPoint]
    top_sources: list[SalesReportRankRow]
    top_performers: list[SalesReportRankRow]
    top_pending_deals: list[SalesReportPendingDeal]


class SalesReportConversionResponse(BaseModel):
    period_label: str
    funnel: list[SalesReportConversionFunnel]
    lead_to_deal_rate: float
    deal_to_win_rate: float
    quote_to_order_rate: float
    order_to_invoice_rate: float
    by_source: list[SalesReportRankRow]
    by_owner: list[SalesReportRankRow]
    previous_lead_to_deal_rate: float | None = None
    previous_deal_to_win_rate: float | None = None


class SalesReportRevenueResponse(BaseModel):
    period_label: str
    booked_revenue: float
    collected_revenue: float
    outstanding_revenue: float
    pipeline_forecast: float
    avg_deal_size: float
    trend: list[SalesReportTrendPoint]
    by_owner: list[SalesReportRankRow]
    by_customer: list[SalesReportRankRow]
    by_source: list[SalesReportRankRow]
    previous_booked_revenue: float | None = None


class SalesReportLeadSourceResponse(BaseModel):
    period_label: str
    sources: list[SalesReportRankRow]
    conversion_chart: list[SalesReportTrendPoint]


class SalesReportExecutiveResponse(BaseModel):
    period_label: str
    executives: list[SalesReportRankRow]
    detail: list[dict]


class SalesReportPendingDealsResponse(BaseModel):
    period_label: str
    total_count: int
    total_value: float
    overdue_count: int
    stale_count: int
    aging_buckets: list[SalesReportTrendPoint]
    deals: list[SalesReportPendingDeal]


class SalesReportPipelineHealthResponse(BaseModel):
    period_label: str
    stages: list[SalesReportPipelineStage]
    total_pipeline_value: float
    concentration_top_deal_percent: float
    health_score: int
    health_label: str

