"""Workflow Builder API schemas."""

from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, Field


class WorkflowSettingsResponse(BaseModel):
    is_enabled: bool
    max_active_workflows: int
    default_run_as_role: str
    rate_limit_per_hour: int
    notify_on_failure: bool


class WorkflowSettingsUpdateRequest(BaseModel):
    is_enabled: bool | None = None
    max_active_workflows: int | None = None
    default_run_as_role: str | None = None
    rate_limit_per_hour: int | None = None
    notify_on_failure: bool | None = None


class WorkflowCreateRequest(BaseModel):
    name: str = Field(min_length=1, max_length=200)
    description: str | None = None
    module: str
    trigger_type: str
    trigger_config_json: dict = Field(default_factory=dict)
    conditions_json: list[dict] = Field(default_factory=list)
    actions_json: list[dict] = Field(default_factory=list)
    priority: int = 100
    stop_on_match: bool = False


class WorkflowUpdateRequest(BaseModel):
    name: str | None = None
    description: str | None = None
    module: str | None = None
    trigger_type: str | None = None
    trigger_config_json: dict | None = None
    conditions_json: list[dict] | None = None
    actions_json: list[dict] | None = None
    priority: int | None = None
    stop_on_match: bool | None = None


class WorkflowListItem(BaseModel):
    id: int
    workflow_code: str
    name: str
    module: str
    trigger_type: str
    is_active: bool
    priority: int
    run_count: int
    last_run_at: datetime | None
    created_at: datetime | None


class WorkflowResponse(BaseModel):
    id: int
    workflow_code: str
    name: str
    description: str | None
    module: str
    trigger_type: str
    trigger_config_json: dict
    conditions_json: list[dict]
    actions_json: list[dict]
    priority: int
    stop_on_match: bool
    is_active: bool
    run_count: int
    last_run_at: datetime | None
    created_at: datetime | None
    updated_at: datetime | None


class WorkflowListResponse(BaseModel):
    items: list[WorkflowListItem]
    total: int


class WorkflowDashboardResponse(BaseModel):
    is_enabled: bool
    active_count: int
    runs_today: int
    failures_today: int
    recent_runs: list["WorkflowRunListItem"]


class WorkflowRunListItem(BaseModel):
    id: int
    run_number: str
    workflow_id: int
    workflow_name: str | None = None
    trigger_type: str
    record_type: str
    record_id: int
    status: str
    is_dry_run: bool
    triggered_at: datetime | None
    completed_at: datetime | None


class WorkflowRunListResponse(BaseModel):
    items: list[WorkflowRunListItem]
    total: int


class WorkflowRunResponse(BaseModel):
    id: int
    run_number: str
    workflow_id: int
    workflow_name: str | None
    trigger_type: str
    record_type: str
    record_id: int
    status: str
    conditions_result_json: list[dict]
    actions_result_json: list[dict]
    error_message: str | None
    is_dry_run: bool
    triggered_at: datetime | None
    completed_at: datetime | None


class WorkflowTestRequest(BaseModel):
    record_type: str
    record_id: int


class CatalogItem(BaseModel):
    key: str
    label: str
    module: str | None = None
    record_type: str | None = None
    config_fields: list[str] | None = None
    fields: list[str] | None = None


class WorkflowTemplateResponse(BaseModel):
    key: str
    name: str
    description: str | None
    module: str
    trigger_type: str
    trigger_config_json: dict
    conditions_json: list[dict]
    actions_json: list[dict]
    priority: int
    stop_on_match: bool
