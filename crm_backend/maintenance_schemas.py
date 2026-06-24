"""Maintenance / CMMS API schemas."""

from __future__ import annotations

from datetime import date, datetime
from typing import Any

from pydantic import BaseModel, Field


class MaintenanceSettingsResponse(BaseModel):
    is_enabled: bool
    work_order_prefix: str
    asset_code_prefix: str
    default_pm_interval_days: int
    critical_downtime_alert_hours: int
    auto_deduct_spare_parts: bool
    allow_negative_spare_parts: bool
    notify_roles_json: list[str]


class MaintenanceSettingsUpdateRequest(BaseModel):
    is_enabled: bool | None = None
    work_order_prefix: str | None = None
    asset_code_prefix: str | None = None
    default_pm_interval_days: int | None = None
    critical_downtime_alert_hours: int | None = None
    auto_deduct_spare_parts: bool | None = None
    allow_negative_spare_parts: bool | None = None
    notify_roles_json: list[str] | None = None


class AssetCategoryResponse(BaseModel):
    id: int
    name: str
    sort_order: int


class AssetCategoryCreateRequest(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    sort_order: int = 0


class AssetCategoryUpdateRequest(BaseModel):
    name: str | None = None
    sort_order: int | None = None


class AssetListItem(BaseModel):
    id: int
    asset_code: str
    name: str
    category_id: int | None
    category_name: str | None
    status: str
    criticality: str
    location_notes: str | None
    next_pm_due_date: date | None
    last_service_date: date | None
    pm_overdue: bool


class AssetListResponse(BaseModel):
    items: list[AssetListItem]
    total: int


class AssetCreateRequest(BaseModel):
    asset_code: str | None = None
    name: str = Field(min_length=1, max_length=200)
    category_id: int | None = None
    status: str = "operational"
    criticality: str = "medium"
    location_notes: str | None = None
    manufacturer: str | None = None
    model: str | None = None
    serial_number: str | None = None
    purchase_date: date | None = None
    warranty_end: date | None = None
    vendor_contact_id: int | None = None
    pm_interval_days: int | None = None
    notes: str | None = None


class AssetUpdateRequest(BaseModel):
    name: str | None = None
    category_id: int | None = None
    status: str | None = None
    criticality: str | None = None
    location_notes: str | None = None
    manufacturer: str | None = None
    model: str | None = None
    serial_number: str | None = None
    purchase_date: date | None = None
    warranty_end: date | None = None
    vendor_contact_id: int | None = None
    pm_interval_days: int | None = None
    notes: str | None = None


class AssetResponse(BaseModel):
    id: int
    asset_code: str
    name: str
    category_id: int | None
    category_name: str | None
    status: str
    criticality: str
    location_notes: str | None
    manufacturer: str | None
    model: str | None
    serial_number: str | None
    purchase_date: date | None
    warranty_end: date | None
    vendor_contact_id: int | None
    vendor_name: str | None
    pm_interval_days: int | None
    last_service_date: date | None
    next_pm_due_date: date | None
    notes: str | None
    created_at: datetime | None


class AssetHistoryItem(BaseModel):
    work_order_id: int
    work_order_number: str
    type: str
    status: str
    completed_at: datetime | None
    downtime_minutes: int | None
    resolution_notes: str | None
    root_cause: str | None
    parts: list[dict[str, Any]]


class AssetHistoryResponse(BaseModel):
    items: list[AssetHistoryItem]


class MwoPartLine(BaseModel):
    id: int
    product_id: int
    product_name: str
    quantity: float
    unit: str | None
    issued_at: datetime | None
    issued_by_name: str | None


class MwoListItem(BaseModel):
    id: int
    work_order_number: str
    asset_id: int
    asset_code: str | None
    asset_name: str | None
    type: str
    priority: str
    status: str
    title: str
    reported_at: datetime | None
    downtime_minutes: int | None
    assigned_to_name: str | None


class MwoListResponse(BaseModel):
    items: list[MwoListItem]
    total: int


class MwoCreateRequest(BaseModel):
    asset_id: int
    type: str = "breakdown"
    priority: str = "normal"
    title: str = Field(min_length=1, max_length=200)
    description: str | None = None
    assigned_to_id: int | None = None
    vendor_contact_id: int | None = None
    status: str = "open"


class MwoStatusUpdateRequest(BaseModel):
    status: str


class MwoCompleteRequest(BaseModel):
    resolution_notes: str = Field(min_length=1)
    root_cause: str | None = None
    downtime_minutes: int | None = None


class MwoIssuePartsRequest(BaseModel):
    product_id: int
    quantity: float = Field(gt=0)


class MwoResponse(BaseModel):
    id: int
    work_order_number: str
    asset_id: int
    asset_code: str | None
    asset_name: str | None
    type: str
    priority: str
    status: str
    title: str
    description: str | None
    reported_at: datetime | None
    started_at: datetime | None
    completed_at: datetime | None
    downtime_minutes: int | None
    root_cause: str | None
    resolution_notes: str | None
    assigned_to_id: int | None
    assigned_to_name: str | None
    vendor_contact_id: int | None
    vendor_name: str | None
    parts: list[MwoPartLine]


class MaintenanceDashboardResponse(BaseModel):
    operational_assets: int
    breakdown_assets: int
    under_maintenance_assets: int
    open_work_orders: int
    overdue_pm_count: int
    downtime_hours_7d: float
    downtime_hours_30d: float
    overdue_pm: list[AssetListItem]
    open_breakdowns: list[MwoListItem]
    recent_completions: list[MwoListItem]


class PmScheduleItem(BaseModel):
    asset_id: int
    asset_code: str
    asset_name: str
    category_name: str | None
    next_pm_due_date: date | None
    last_service_date: date | None
    pm_interval_days: int | None
    days_overdue: int
    has_open_preventive_mwo: bool


class PmScheduleResponse(BaseModel):
    items: list[PmScheduleItem]


class PmGenerateRequest(BaseModel):
    asset_ids: list[int]


class PmGenerateResponse(BaseModel):
    created: list[MwoListItem]
