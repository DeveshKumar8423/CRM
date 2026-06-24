"""Field Service API schemas."""

from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, Field


class FieldServiceSettingsResponse(BaseModel):
    is_enabled: bool
    order_prefix: str
    default_sla_hours: int
    auto_deduct_parts: bool
    allow_negative_parts: bool
    notify_roles_json: list[str]
    service_types_json: list[str]


class FieldServiceSettingsUpdateRequest(BaseModel):
    is_enabled: bool | None = None
    order_prefix: str | None = None
    default_sla_hours: int | None = None
    auto_deduct_parts: bool | None = None
    allow_negative_parts: bool | None = None
    notify_roles_json: list[str] | None = None
    service_types_json: list[str] | None = None


class FsoListItem(BaseModel):
    id: int
    order_number: str
    contact_id: int
    contact_name: str | None
    type: str
    priority: str
    status: str
    title: str
    site_address: str | None
    scheduled_start: datetime | None
    scheduled_end: datetime | None
    assigned_to_id: int | None
    assigned_to_name: str | None
    sla_due_at: datetime | None
    sla_breached: bool


class FsoListResponse(BaseModel):
    items: list[FsoListItem]
    total: int


class FsoCreateRequest(BaseModel):
    contact_id: int
    type: str = "repair"
    priority: str = "normal"
    title: str = Field(min_length=1, max_length=200)
    description: str | None = None
    site_address: str | None = None
    site_contact_name: str | None = None
    site_contact_phone: str | None = None
    site_notes: str | None = None


class FsoUpdateRequest(BaseModel):
    title: str | None = None
    description: str | None = None
    type: str | None = None
    priority: str | None = None
    site_address: str | None = None
    site_contact_name: str | None = None
    site_contact_phone: str | None = None
    site_notes: str | None = None


class FsoAssignRequest(BaseModel):
    assigned_to_id: int
    scheduled_start: datetime
    scheduled_end: datetime | None = None


class FsoStatusUpdateRequest(BaseModel):
    status: str


class FsoCompleteRequest(BaseModel):
    resolution_notes: str = Field(min_length=1)
    root_cause: str | None = None


class FsoIssuePartsRequest(BaseModel):
    product_id: int
    quantity: float = Field(gt=0)


class FsoPartLine(BaseModel):
    id: int
    product_id: int
    product_name: str
    quantity: float
    unit: str | None
    issued_at: datetime | None
    issued_by_name: str | None


class FsoResponse(BaseModel):
    id: int
    order_number: str
    contact_id: int
    contact_name: str | None
    type: str
    priority: str
    status: str
    title: str
    description: str | None
    site_address: str | None
    site_contact_name: str | None
    site_contact_phone: str | None
    site_notes: str | None
    scheduled_start: datetime | None
    scheduled_end: datetime | None
    dispatched_at: datetime | None
    arrived_at: datetime | None
    completed_at: datetime | None
    resolution_notes: str | None
    root_cause: str | None
    assigned_to_id: int | None
    assigned_to_name: str | None
    sla_due_at: datetime | None
    sla_breached: bool
    parts: list[FsoPartLine]


class FieldServiceDashboardResponse(BaseModel):
    open_orders: int
    unassigned: int
    todays_visits: int
    sla_breached: int
    completions_7d: int
    completions_30d: int
    unassigned_queue: list[FsoListItem]
    todays_schedule: list[FsoListItem]
    sla_breached_list: list[FsoListItem]
    recent_completions: list[FsoListItem]


class ScheduleResponse(BaseModel):
    items: list[FsoListItem]
    total: int
