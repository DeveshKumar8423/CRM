"""Quality Control API schemas."""

from __future__ import annotations

from datetime import date, datetime
from typing import Any

from pydantic import BaseModel, Field


class QualitySettingsResponse(BaseModel):
    is_enabled: bool
    inspection_number_prefix: str
    capa_number_prefix: str
    default_incoming_required: bool
    block_on_fail_default: bool
    alert_repeat_fail_threshold: int
    alert_overdue_hours: int
    notify_roles_json: list[str]


class QualitySettingsUpdateRequest(BaseModel):
    is_enabled: bool | None = None
    inspection_number_prefix: str | None = Field(default=None, max_length=10)
    capa_number_prefix: str | None = Field(default=None, max_length=10)
    default_incoming_required: bool | None = None
    block_on_fail_default: bool | None = None
    alert_repeat_fail_threshold: int | None = None
    alert_overdue_hours: int | None = None
    notify_roles_json: list[str] | None = None


class InspectionPointResponse(BaseModel):
    id: int
    code: str
    name: str
    point_type: str
    trigger: str
    is_active: bool
    block_on_fail: bool
    default_template_id: int | None
    sort_order: int


class InspectionPointUpdateRequest(BaseModel):
    name: str | None = None
    is_active: bool | None = None
    block_on_fail: bool | None = None
    default_template_id: int | None = None
    sort_order: int | None = None


class TemplateItemInput(BaseModel):
    key: str
    label: str
    required: bool = True
    input_type: str = "pass_fail"
    spec: dict[str, Any] | None = None


class TemplateListItem(BaseModel):
    id: int
    name: str
    product_id: int | None
    product_name: str | None
    inspection_point_id: int | None
    inspection_point_name: str | None
    version: str
    status: str
    item_count: int


class TemplateListResponse(BaseModel):
    items: list[TemplateListItem]
    total: int


class TemplateResponse(BaseModel):
    id: int
    name: str
    product_id: int | None
    product_name: str | None
    inspection_point_id: int | None
    inspection_point_name: str | None
    version: str
    status: str
    items_json: list[dict[str, Any]]
    created_at: datetime | None


class TemplateCreateRequest(BaseModel):
    name: str
    product_id: int | None = None
    inspection_point_id: int | None = None
    version: str = "1.0"
    items_json: list[dict[str, Any]] = Field(default_factory=list)


class TemplateUpdateRequest(BaseModel):
    name: str | None = None
    product_id: int | None = None
    inspection_point_id: int | None = None
    version: str | None = None
    items_json: list[dict[str, Any]] | None = None


class InspectionListItem(BaseModel):
    id: int
    inspection_number: str
    inspection_point_code: str | None
    inspection_point_name: str | None
    product_id: int | None
    product_name: str | None
    reference_type: str | None
    reference_label: str | None
    status: str
    inspected_at: datetime | None
    inspected_by_name: str | None
    created_at: datetime | None


class InspectionListResponse(BaseModel):
    items: list[InspectionListItem]
    total: int


class InspectionResponse(BaseModel):
    id: int
    inspection_number: str
    inspection_point_id: int | None
    inspection_point_code: str | None
    inspection_point_name: str | None
    template_id: int | None
    status: str
    checklist_json: list[dict[str, Any]]
    overall_notes: str | None
    reference_type: str | None
    reference_id: int | None
    reference_label: str | None
    product_id: int | None
    product_name: str | None
    work_order_id: int | None
    inspected_by_id: int | None
    inspected_by_name: str | None
    inspected_at: datetime | None
    waived_by_id: int | None
    waived_by_name: str | None
    waiver_reason: str | None
    created_at: datetime | None


class InspectionCreateRequest(BaseModel):
    inspection_point_id: int
    product_id: int | None = None
    template_id: int | None = None
    reference_type: str = "manual"
    reference_id: int | None = None
    overall_notes: str | None = None


class InspectionSubmitRequest(BaseModel):
    checklist_json: list[dict[str, Any]]
    overall_notes: str | None = None
    status: str | None = None


class InspectionWaiveRequest(BaseModel):
    waiver_reason: str


class AlertListItem(BaseModel):
    id: int
    alert_type: str
    severity: str
    title: str
    message: str
    status: str
    inspection_id: int | None
    capa_id: int | None
    product_name: str | None
    created_at: datetime | None


class AlertListResponse(BaseModel):
    items: list[AlertListItem]
    total: int


class CapaListItem(BaseModel):
    id: int
    capa_number: str
    title: str
    status: str
    action_type: str
    inspection_number: str | None
    product_name: str | None
    assigned_to_name: str | None
    due_date: date | None
    is_overdue: bool = False


class CapaListResponse(BaseModel):
    items: list[CapaListItem]
    total: int


class CapaResponse(BaseModel):
    id: int
    capa_number: str
    inspection_id: int
    inspection_number: str | None
    title: str
    description: str
    action_type: str
    status: str
    assigned_to_id: int | None
    assigned_to_name: str | None
    due_date: date | None
    root_cause: str | None
    corrective_steps: str
    verification_notes: str | None
    closed_by_name: str | None
    closed_at: datetime | None
    created_at: datetime | None


class CapaCreateRequest(BaseModel):
    inspection_id: int
    title: str
    description: str
    action_type: str = "rework"
    assigned_to_id: int | None = None
    due_date: date | None = None
    corrective_steps: str = ""


class CapaUpdateRequest(BaseModel):
    title: str | None = None
    description: str | None = None
    action_type: str | None = None
    status: str | None = None
    assigned_to_id: int | None = None
    due_date: date | None = None
    root_cause: str | None = None
    corrective_steps: str | None = None
    verification_notes: str | None = None


class QualityDashboardResponse(BaseModel):
    pending_inspections: int
    failed_inspections_7d: int
    pass_rate_30d: float
    open_alerts: int
    open_capas: int
    overdue_capas: int
    pending_queue: list[InspectionListItem]
    recent_failures: list[InspectionListItem]
    open_alerts_list: list[AlertListItem]
    open_capas_list: list[CapaListItem]
