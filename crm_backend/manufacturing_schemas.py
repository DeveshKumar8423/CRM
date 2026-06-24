"""Manufacturing / MRP API schemas."""

from __future__ import annotations

from datetime import date, datetime
from typing import Any

from pydantic import BaseModel, Field


class ManufacturingSettingsResponse(BaseModel):
    is_enabled: bool
    work_order_prefix: str
    auto_reserve_materials_on_release: bool
    require_qc_before_receipt: bool
    default_scrap_pct: float
    allow_negative_issue: bool
    default_checklist_json: list[dict[str, Any]]


class ManufacturingSettingsUpdateRequest(BaseModel):
    is_enabled: bool | None = None
    work_order_prefix: str | None = Field(default=None, max_length=10)
    auto_reserve_materials_on_release: bool | None = None
    require_qc_before_receipt: bool | None = None
    default_scrap_pct: float | None = None
    allow_negative_issue: bool | None = None
    default_checklist_json: list[dict[str, Any]] | None = None


class BomLineInput(BaseModel):
    component_product_id: int
    quantity: float = Field(gt=0)
    scrap_pct: float = Field(default=0, ge=0)
    sort_order: int = 0
    notes: str | None = None


class BomLineResponse(BaseModel):
    id: int
    component_product_id: int
    component_product_name: str
    quantity: float
    scrap_pct: float
    sort_order: int
    notes: str | None
    on_hand: float = 0
    unit_cost: float = 0


class BomListItem(BaseModel):
    id: int
    product_id: int
    product_name: str
    name: str
    version: str
    status: str
    output_qty: float
    output_uom: str
    line_count: int
    estimated_batch_cost: float = 0


class BomListResponse(BaseModel):
    items: list[BomListItem]
    total: int


class BomResponse(BaseModel):
    id: int
    product_id: int
    product_name: str
    name: str
    version: str
    status: str
    output_qty: float
    output_uom: str
    notes: str | None
    lines: list[BomLineResponse]
    estimated_batch_cost: float = 0
    created_at: datetime | None
    updated_at: datetime | None


class BomCreateRequest(BaseModel):
    product_id: int
    name: str
    version: str = "1.0"
    output_qty: float = Field(default=1, gt=0)
    output_uom: str = "Unit"
    notes: str | None = None
    lines: list[BomLineInput] = Field(default_factory=list)


class BomUpdateRequest(BaseModel):
    name: str | None = None
    version: str | None = None
    output_qty: float | None = Field(default=None, gt=0)
    output_uom: str | None = None
    notes: str | None = None
    lines: list[BomLineInput] | None = None


class BomExplodeLine(BaseModel):
    component_product_id: int
    component_product_name: str
    required_qty: float
    on_hand: float
    shortage: float
    unit: str


class BomExplodeResponse(BaseModel):
    bom_id: int
    product_name: str
    batch_qty: float
    lines: list[BomExplodeLine]


class MaterialPlanLine(BaseModel):
    id: int
    component_product_id: int
    component_product_name: str
    required_qty: float
    issued_qty: float
    shortage: float
    unit: str


class WorkOrderListItem(BaseModel):
    id: int
    work_order_number: str
    product_id: int
    product_name: str
    status: str
    planned_qty: float
    completed_qty: float
    planned_start: date | None
    planned_end: date | None
    priority: str
    sales_order_number: str | None = None
    assigned_to_name: str | None = None


class WorkOrderListResponse(BaseModel):
    items: list[WorkOrderListItem]
    total: int


class MaterialIssueLine(BaseModel):
    id: int
    component_product_id: int
    component_product_name: str
    quantity: float
    issued_at: datetime
    issued_by_name: str


class ReceiptLine(BaseModel):
    id: int
    quantity: float
    received_at: datetime
    received_by_name: str


class QualityInspectionSummary(BaseModel):
    id: int
    inspection_number: str
    status: str
    inspected_at: datetime | None
    inspected_by_name: str | None


class WorkOrderResponse(BaseModel):
    id: int
    work_order_number: str
    product_id: int
    product_name: str
    bom_id: int | None
    bom_name: str | None
    sales_order_id: int | None
    sales_order_number: str | None
    sales_order_line_id: int | None
    project_id: int | None
    status: str
    planned_qty: float
    completed_qty: float
    scrap_qty: float
    planned_start: date | None
    planned_end: date | None
    actual_start: datetime | None
    actual_end: datetime | None
    assigned_to_id: int | None
    assigned_to_name: str | None
    priority: str
    notes: str | None
    material_plans: list[MaterialPlanLine]
    material_issues: list[MaterialIssueLine]
    receipts: list[ReceiptLine]
    quality_inspections: list[QualityInspectionSummary]
    created_at: datetime | None


class WorkOrderCreateRequest(BaseModel):
    product_id: int
    planned_qty: float = Field(gt=0)
    bom_id: int | None = None
    sales_order_id: int | None = None
    sales_order_line_id: int | None = None
    project_id: int | None = None
    planned_start: date | None = None
    planned_end: date | None = None
    assigned_to_id: int | None = None
    priority: str = "normal"
    notes: str | None = None
    status: str = "draft"


class WorkOrderFromSalesOrderRequest(BaseModel):
    sales_order_line_id: int
    planned_qty: float | None = Field(default=None, gt=0)
    planned_start: date | None = None
    planned_end: date | None = None
    assigned_to_id: int | None = None
    priority: str = "normal"
    notes: str | None = None


class WorkOrderStatusRequest(BaseModel):
    status: str
    notes: str | None = None


class MaterialIssueRequest(BaseModel):
    lines: list[dict[str, Any]] | None = None
    issue_all: bool = False


class FinishedGoodsReceiptRequest(BaseModel):
    quantity: float = Field(gt=0)
    scrap_qty: float = Field(default=0, ge=0)


class ManufacturingDashboardResponse(BaseModel):
    open_work_orders: int
    overdue_work_orders: int
    shortages_count: int
    fg_produced_7d: float
    recent_work_orders: list[WorkOrderListItem]
    critical_shortages: list[dict[str, Any]]


class QualityInspectionListItem(BaseModel):
    id: int
    inspection_number: str
    work_order_id: int
    work_order_number: str
    product_name: str
    status: str
    inspected_at: datetime | None
    inspected_by_name: str | None


class QualityInspectionListResponse(BaseModel):
    items: list[QualityInspectionListItem]
    total: int


class QualityInspectionResponse(BaseModel):
    id: int
    inspection_number: str
    work_order_id: int
    work_order_number: str
    product_name: str
    status: str
    checklist_json: list[dict[str, Any]]
    notes: str | None
    inspected_by_id: int | None
    inspected_by_name: str | None
    inspected_at: datetime | None


class QualityInspectionSubmitRequest(BaseModel):
    status: str
    checklist_json: list[dict[str, Any]]
    notes: str | None = None
