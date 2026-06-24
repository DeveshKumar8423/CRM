"""Rental Management API schemas."""

from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, Field


class RentalSettingsResponse(BaseModel):
    is_enabled: bool
    contract_prefix: str
    default_rate_basis: str
    default_deposit_percent: float
    late_fee_per_day: float
    grace_hours_after_due: int
    auto_invoice_mode: str
    require_deposit_before_delivery: bool
    notify_roles_json: list[str]
    allow_overbook: bool


class RentalSettingsUpdateRequest(BaseModel):
    is_enabled: bool | None = None
    contract_prefix: str | None = None
    default_rate_basis: str | None = None
    default_deposit_percent: float | None = None
    late_fee_per_day: float | None = None
    grace_hours_after_due: int | None = None
    auto_invoice_mode: str | None = None
    require_deposit_before_delivery: bool | None = None
    notify_roles_json: list[str] | None = None
    allow_overbook: bool | None = None


class RentalAssetResponse(BaseModel):
    id: int
    asset_code: str
    name: str
    description: str | None
    category: str
    product_id: int | None
    quantity_available: int
    rate_daily: float | None
    rate_weekly: float | None
    rate_monthly: float | None
    gst_rate: float
    deposit_amount: float | None
    status: str
    location_notes: str | None
    sort_order: int


class RentalAssetCreateRequest(BaseModel):
    asset_code: str = Field(min_length=1, max_length=40)
    name: str = Field(min_length=1, max_length=200)
    description: str | None = None
    category: str = "other"
    product_id: int | None = None
    quantity_available: int = Field(ge=1, default=1)
    rate_daily: float | None = None
    rate_weekly: float | None = None
    rate_monthly: float | None = None
    gst_rate: float = 18
    deposit_amount: float | None = None
    location_notes: str | None = None
    sort_order: int = 0


class RentalAssetUpdateRequest(BaseModel):
    name: str | None = None
    description: str | None = None
    category: str | None = None
    product_id: int | None = None
    quantity_available: int | None = None
    rate_daily: float | None = None
    rate_weekly: float | None = None
    rate_monthly: float | None = None
    gst_rate: float | None = None
    deposit_amount: float | None = None
    status: str | None = None
    location_notes: str | None = None
    sort_order: int | None = None


class ContractLineInput(BaseModel):
    rental_asset_id: int
    quantity: int = Field(ge=1, default=1)
    rate_basis: str | None = None


class ContractLineResponse(BaseModel):
    id: int
    rental_asset_id: int
    asset_name: str | None
    asset_code: str | None
    quantity: int
    rate_basis: str
    unit_rate: float
    line_days: int
    line_subtotal: float
    gst_rate: float
    line_total: float
    return_condition: str | None
    damage_notes: str | None
    damage_charge: float | None = None


class ContractListItem(BaseModel):
    id: int
    contract_number: str
    contact_id: int
    contact_name: str | None
    status: str
    rate_basis: str
    rental_start: datetime
    rental_end: datetime
    grand_total: float
    deposit_required: float
    deposit_received: float
    deposit_settled: bool


class ContractListResponse(BaseModel):
    items: list[ContractListItem]
    total: int


class ContractCreateRequest(BaseModel):
    contact_id: int
    rate_basis: str | None = None
    rental_start: datetime
    rental_end: datetime
    delivery_address: str | None = None
    delivery_contact_name: str | None = None
    delivery_contact_phone: str | None = None
    notes: str | None = None
    lines: list[ContractLineInput]


class ContractCancelRequest(BaseModel):
    cancellation_reason: str | None = None


class ContractDispatchRequest(BaseModel):
    delivery_scheduled_at: datetime | None = None


class ContractScheduleReturnRequest(BaseModel):
    return_scheduled_at: datetime


class ContractLineReturnInput(BaseModel):
    line_id: int
    return_condition: str
    damage_notes: str | None = None
    damage_charge: float | None = None


class ContractReturnRequest(BaseModel):
    actual_return_at: datetime | None = None
    lines: list[ContractLineReturnInput]


class ContractCloseRequest(BaseModel):
    refund_amount: float | None = None
  # if None, auto-refund remaining deposit after deductions


class DepositRecordRequest(BaseModel):
    type: str
    amount: float = Field(gt=0)
    payment_method: str = "cash"
    reference: str | None = None
    notes: str | None = None


class DepositRecordResponse(BaseModel):
    id: int
    type: str
    amount: float
    payment_method: str
    reference: str | None
    notes: str | None
    recorded_at: datetime | None


class RentalInvoiceLink(BaseModel):
    id: int
    invoice_id: int
    invoice_number: str | None
    invoice_status: str | None
    invoice_type: str
    grand_total: float | None
    generated_at: datetime | None


class ContractResponse(BaseModel):
    id: int
    contract_number: str
    contact_id: int
    contact_name: str | None
    status: str
    rate_basis: str
    rental_start: datetime
    rental_end: datetime
    actual_return_at: datetime | None
    delivery_address: str | None
    delivery_contact_name: str | None
    delivery_contact_phone: str | None
    delivery_scheduled_at: datetime | None
    delivery_completed_at: datetime | None
    return_scheduled_at: datetime | None
    return_completed_at: datetime | None
    subtotal: float
    deposit_required: float
    deposit_received: float
    deposit_refunded: float
    deposit_deducted: float
    deposit_held: float
    late_fee_total: float
    damage_charge_total: float
    grand_total: float
    notes: str | None
    cancellation_reason: str | None
    lines: list[ContractLineResponse]
    deposits: list[DepositRecordResponse]
    invoices: list[RentalInvoiceLink]
    availability_conflicts: list[str] = []


class CalendarEvent(BaseModel):
    contract_id: int
    contract_number: str
    rental_asset_id: int
    asset_name: str
    asset_code: str
    contact_name: str | None
    quantity: int
    rental_start: datetime
    rental_end: datetime
    status: str


class CalendarResponse(BaseModel):
    events: list[CalendarEvent]
    week_start: datetime
    week_end: datetime


class AvailabilityCheckResponse(BaseModel):
    available: bool
    conflicts: list[str]


class RentalDashboardResponse(BaseModel):
    active_contracts: int
    units_on_rent: int
    returns_due_7d: int
    overdue_returns: int
    deposits_held: float
    revenue_mtd: float
    utilization_pct: float
    deliveries_today: list[ContractListItem]
    returns_due: list[ContractListItem]
    overdue: list[ContractListItem]
    awaiting_deposit: list[ContractListItem]
    recently_closed: list[ContractListItem]
