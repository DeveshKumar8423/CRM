"""AI Reports API schemas."""

from __future__ import annotations

from datetime import date, datetime

from pydantic import BaseModel, Field


class AiReportSettingsResponse(BaseModel):
    is_enabled: bool
    default_period: str
    default_domains_json: list[str]
    include_executive_brief: bool
    anomaly_thresholds_json: dict
    notify_roles_json: list[str]
    generation_mode: str


class AiReportSettingsUpdateRequest(BaseModel):
    is_enabled: bool | None = None
    default_period: str | None = None
    default_domains_json: list[str] | None = None
    include_executive_brief: bool | None = None
    anomaly_thresholds_json: dict | None = None
    notify_roles_json: list[str] | None = None
    generation_mode: str | None = None


class InsightBullet(BaseModel):
    text: str
    metric_key: str | None = None
    metric_value: str | None = None
    link_path: str | None = None


class WatchItem(BaseModel):
    severity: str
    text: str
    link_path: str | None = None


class InsightSectionResponse(BaseModel):
    id: int
    domain: str
    headline: str
    narrative: str
    bullets: list[InsightBullet]
    watch_items: list[WatchItem]
    metrics_json: dict
    sort_order: int


class InsightRunListItem(BaseModel):
    id: int
    run_number: str
    period_start: date
    period_end: date
    domains_json: list[str]
    status: str
    executive_headline: str | None
    created_at: datetime | None
    completed_at: datetime | None


class InsightRunListResponse(BaseModel):
    items: list[InsightRunListItem]
    total: int


class InsightRunResponse(BaseModel):
    id: int
    run_number: str
    period_start: date
    period_end: date
    domains_json: list[str]
    status: str
    executive_headline: str | None
    executive_summary: str | None
    error_message: str | None
    created_at: datetime | None
    completed_at: datetime | None
    sections: list[InsightSectionResponse]
    watch_items: list[WatchItem]


class AiReportsDashboardResponse(BaseModel):
    latest_run: InsightRunListItem | None
    recent_runs: list[InsightRunListItem]
    watch_items: list[WatchItem]


class GenerateInsightRequest(BaseModel):
    period: str | None = None
    period_start: date | None = None
    period_end: date | None = None
    domains: list[str] | None = None
    include_executive_brief: bool = True


class PermittedDomainsResponse(BaseModel):
    domains: list[str]
