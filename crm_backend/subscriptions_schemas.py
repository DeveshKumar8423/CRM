"""Subscription Management API schemas."""

from __future__ import annotations

from datetime import date, datetime
from decimal import Decimal

from pydantic import BaseModel, Field


class SubscriptionSettingsResponse(BaseModel):
    is_enabled: bool
    subscription_prefix: str
    default_reminder_days: list[int]
    auto_invoice_mode: str
    auto_invoice_on_billing_date: bool
    grace_period_days: int
    notify_roles_json: list[str]
    allow_immediate_cancel: bool


class SubscriptionSettingsUpdateRequest(BaseModel):
    is_enabled: bool | None = None
    subscription_prefix: str | None = None
    default_reminder_days: list[int] | None = None
    auto_invoice_mode: str | None = None
    auto_invoice_on_billing_date: bool | None = None
    grace_period_days: int | None = None
    notify_roles_json: list[str] | None = None
    allow_immediate_cancel: bool | None = None


class PlanResponse(BaseModel):
    id: int
    plan_code: str
    name: str
    description: str | None
    billing_interval: str
    interval_days: int | None
    price: float
    currency: str
    gst_rate: float
    product_id: int | None
    trial_days: int
    status: str
    sort_order: int


class PlanCreateRequest(BaseModel):
    plan_code: str = Field(min_length=1, max_length=40)
    name: str = Field(min_length=1, max_length=200)
    description: str | None = None
    billing_interval: str = "monthly"
    interval_days: int | None = None
    price: float = Field(gt=0)
    currency: str = "INR"
    gst_rate: float = 18
    product_id: int | None = None
    trial_days: int = 0
    sort_order: int = 0


class PlanUpdateRequest(BaseModel):
    name: str | None = None
    description: str | None = None
    billing_interval: str | None = None
    interval_days: int | None = None
    price: float | None = None
    currency: str | None = None
    gst_rate: float | None = None
    product_id: int | None = None
    trial_days: int | None = None
    status: str | None = None
    sort_order: int | None = None


class SubscriptionListItem(BaseModel):
    id: int
    subscription_number: str
    contact_id: int
    contact_name: str | None
    plan_id: int
    plan_name: str | None
    status: str
    quantity: int
    unit_price: float | None
    start_date: date
    next_billing_date: date | None
    current_period_end: date | None
    cancel_at_period_end: bool
    mrr_contribution: float


class SubscriptionListResponse(BaseModel):
    items: list[SubscriptionListItem]
    total: int


class SubscriptionCreateRequest(BaseModel):
    contact_id: int
    plan_id: int
    start_date: date | None = None
    quantity: int = 1
    unit_price: float | None = None
    notes: str | None = None


class SubscriptionCancelRequest(BaseModel):
    immediate: bool = False
    cancellation_reason: str | None = None


class SubscriptionChangePlanRequest(BaseModel):
    new_plan_id: int
    effective_date: date | None = None
    notes: str | None = None


class SubscriptionInvoiceLink(BaseModel):
    id: int
    invoice_id: int
    invoice_number: str | None
    invoice_status: str | None
    grand_total: float | None
    billing_period_start: date
    billing_period_end: date
    generated_at: datetime | None


class PlanChangeItem(BaseModel):
    id: int
    from_plan_name: str | None
    to_plan_name: str | None
    effective_date: date
    change_type: str
    notes: str | None
    created_at: datetime | None


class SubscriptionResponse(BaseModel):
    id: int
    subscription_number: str
    contact_id: int
    contact_name: str | None
    plan_id: int
    plan_name: str | None
    status: str
    quantity: int
    unit_price: float | None
    start_date: date
    trial_end_date: date | None
    current_period_start: date | None
    current_period_end: date | None
    next_billing_date: date | None
    cancel_at_period_end: bool
    cancelled_at: datetime | None
    cancellation_reason: str | None
    ended_at: datetime | None
    notes: str | None
    mrr_contribution: float
    invoices: list[SubscriptionInvoiceLink]
    plan_changes: list[PlanChangeItem]


class SubscriptionsDashboardResponse(BaseModel):
    active_subscriptions: int
    mrr: float
    renewals_due_7d: int
    renewals_due_30d: int
    past_due_count: int
    cancelled_mtd: int
    new_mtd: int
    renewals_due: list[SubscriptionListItem]
    past_due: list[SubscriptionListItem]
    recently_cancelled: list[SubscriptionListItem]


class BillingRunResult(BaseModel):
    processed: int
    invoices_created: int
    skipped: int
    invoice_ids: list[int]
