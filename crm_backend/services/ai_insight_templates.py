"""Template narratives for AI Reports (Phase 1)."""

from __future__ import annotations


def fmt_inr(amount: float) -> str:
    val = float(amount or 0)
    if abs(val) >= 10000000:
        return f"₹{val / 10000000:.2f}Cr"
    if abs(val) >= 100000:
        return f"₹{val / 100000:.1f}L"
    if abs(val) >= 1000:
        return f"₹{val / 1000:.1f}K"
    return f"₹{val:,.0f}"


def _pct_change(current: float, prior: float) -> str:
    if prior == 0:
        return "new activity" if current > 0 else "no change"
    change = ((current - prior) / prior) * 100
    if abs(change) < 1:
        return "unchanged vs prior period"
    direction = "up" if change > 0 else "down"
    return f"{direction} {abs(change):.0f}% vs prior period"


def render_sales(metrics: dict) -> dict:
    m = metrics
    headline = f"Sales pipeline at {fmt_inr(m.get('pipeline_value', 0))} with {m.get('open_deals', 0)} open deals"
    narrative = (
        f"Sales added {m.get('new_leads', 0)} leads this period ({_pct_change(m.get('new_leads', 0), m.get('prior_new_leads', 0))}). "
        f"Open pipeline value is {fmt_inr(m.get('pipeline_value', 0))} across {m.get('open_deals', 0)} deals. "
        f"Won revenue in period: {fmt_inr(m.get('won_revenue', 0))}. "
        f"{m.get('pending_quotes', 0)} quotations await follow-up."
    )
    bullets = [
        {
            "text": f"{m.get('new_leads', 0)} new leads in period",
            "metric_key": "new_leads",
            "metric_value": str(m.get("new_leads", 0)),
            "link_path": "/leads",
        },
        {
            "text": f"Pipeline {fmt_inr(m.get('pipeline_value', 0))} ({m.get('open_deals', 0)} deals)",
            "metric_key": "pipeline_value",
            "metric_value": fmt_inr(m.get("pipeline_value", 0)),
            "link_path": "/deals",
        },
        {
            "text": f"{m.get('stale_deals', 0)} deals idle over 30 days",
            "metric_key": "stale_deals",
            "metric_value": str(m.get("stale_deals", 0)),
            "link_path": "/deals",
        },
    ]
    watch: list[dict] = []
    if m.get("stale_deals", 0) >= 3:
        watch.append({
            "severity": "medium",
            "text": f"{m['stale_deals']} stale deals need follow-up",
            "link_path": "/deals",
        })
    if m.get("pending_quotes", 0) >= 5:
        watch.append({
            "severity": "low",
            "text": f"{m['pending_quotes']} pending quotations",
            "link_path": "/quotations",
        })
    return {"headline": headline, "narrative": narrative, "bullets": bullets, "watch_items": watch}


def render_finance(metrics: dict) -> dict:
    m = metrics
    headline = f"Finance: {fmt_inr(m.get('invoiced', 0))} invoiced, {fmt_inr(m.get('collected', 0))} collected"
    narrative = (
        f"Finance issued {fmt_inr(m.get('invoiced', 0))} in invoices and collected {fmt_inr(m.get('collected', 0))} "
        f"({_pct_change(m.get('collected', 0), m.get('prior_collected', 0))}). "
        f"{fmt_inr(m.get('outstanding', 0))} remains outstanding across {m.get('overdue_count', 0)} overdue invoices. "
        f"Expenses in period: {fmt_inr(m.get('expenses', 0))}."
    )
    bullets = [
        {
            "text": f"Invoiced {fmt_inr(m.get('invoiced', 0))}",
            "metric_key": "invoiced",
            "metric_value": fmt_inr(m.get("invoiced", 0)),
            "link_path": "/invoices",
        },
        {
            "text": f"Collected {fmt_inr(m.get('collected', 0))}",
            "metric_key": "collected",
            "metric_value": fmt_inr(m.get("collected", 0)),
            "link_path": "/payments",
        },
        {
            "text": f"Outstanding {fmt_inr(m.get('outstanding', 0))}",
            "metric_key": "outstanding",
            "metric_value": fmt_inr(m.get("outstanding", 0)),
            "link_path": "/customer-ledger",
        },
    ]
    watch: list[dict] = []
    if m.get("overdue_count", 0) > 0:
        sev = "high" if m.get("overdue_count", 0) >= 5 else "medium"
        watch.append({
            "severity": sev,
            "text": f"{m['overdue_count']} overdue invoices — {fmt_inr(m.get('overdue_amount', 0))}",
            "link_path": "/invoices",
        })
    return {"headline": headline, "narrative": narrative, "bullets": bullets, "watch_items": watch}


def render_inventory(metrics: dict) -> dict:
    m = metrics
    headline = f"Inventory: {m.get('low_stock_count', 0)} SKUs below reorder level"
    narrative = (
        f"Inventory tracks {m.get('tracked_skus', 0)} SKUs with stock value {fmt_inr(m.get('stock_value', 0))}. "
        f"{m.get('low_stock_count', 0)} items are below reorder level. "
        f"Stock movements in period: {m.get('movements_in', 0)} in, {m.get('movements_out', 0)} out."
    )
    bullets = [
        {
            "text": f"{m.get('low_stock_count', 0)} low-stock SKUs",
            "metric_key": "low_stock_count",
            "metric_value": str(m.get("low_stock_count", 0)),
            "link_path": "/inventory",
        },
        {
            "text": f"Stock value {fmt_inr(m.get('stock_value', 0))}",
            "metric_key": "stock_value",
            "metric_value": fmt_inr(m.get("stock_value", 0)),
            "link_path": "/inventory",
        },
    ]
    watch: list[dict] = []
    if m.get("low_stock_count", 0) > 0:
        watch.append({
            "severity": "high" if m.get("low_stock_count", 0) >= 5 else "medium",
            "text": f"{m['low_stock_count']} SKUs below reorder level",
            "link_path": "/inventory",
        })
    return {"headline": headline, "narrative": narrative, "bullets": bullets, "watch_items": watch}


def render_hr(metrics: dict) -> dict:
    m = metrics
    headline = f"HR: {m.get('headcount', 0)} employees, {m.get('attendance_rate', 0):.0f}% attendance"
    narrative = (
        f"HR shows {m.get('headcount', 0)} active employee profiles. "
        f"Attendance rate this period: {m.get('attendance_rate', 0):.0f}%. "
        f"{m.get('leave_pending', 0)} leave requests await approval. "
        f"Timesheet hours logged: {m.get('timesheet_hours', 0):.1f}."
    )
    bullets = [
        {
            "text": f"{m.get('headcount', 0)} employees",
            "metric_key": "headcount",
            "metric_value": str(m.get("headcount", 0)),
            "link_path": "/employees",
        },
        {
            "text": f"{m.get('attendance_rate', 0):.0f}% attendance",
            "metric_key": "attendance_rate",
            "metric_value": f"{m.get('attendance_rate', 0):.1f}",
            "link_path": "/attendance",
        },
        {
            "text": f"{m.get('leave_pending', 0)} leaves pending approval",
            "metric_key": "leave_pending",
            "metric_value": str(m.get("leave_pending", 0)),
            "link_path": "/leaves",
        },
    ]
    watch: list[dict] = []
    if m.get("leave_pending", 0) >= 3:
        watch.append({
            "severity": "medium",
            "text": f"{m['leave_pending']} leave requests pending approval",
            "link_path": "/leaves",
        })
    if m.get("attendance_rate", 100) < 85:
        watch.append({
            "severity": "medium",
            "text": f"Attendance rate below 85% ({m.get('attendance_rate', 0):.0f}%)",
            "link_path": "/attendance",
        })
    return {"headline": headline, "narrative": narrative, "bullets": bullets, "watch_items": watch}


def render_operations(metrics: dict) -> dict:
    m = metrics
    headline = "Operations watch list across production, service, and fulfillment"
    narrative = (
        f"Operations: {m.get('open_mfg_wo', 0)} manufacturing work orders open, "
        f"{m.get('open_fso', 0)} field service jobs open ({m.get('sla_breached', 0)} SLA breached). "
        f"{m.get('pm_overdue', 0)} maintenance assets past PM due. "
        f"Subscriptions: {m.get('subs_past_due', 0)} past due, {m.get('renewals_due', 0)} renewals in 7 days. "
        f"Rental utilization {m.get('rental_utilization', 0):.0f}% with {m.get('rental_overdue', 0)} overdue returns."
    )
    bullets = [
        {
            "text": f"{m.get('open_mfg_wo', 0)} open manufacturing WOs",
            "metric_key": "open_mfg_wo",
            "metric_value": str(m.get("open_mfg_wo", 0)),
            "link_path": "/manufacturing/work-orders",
        },
        {
            "text": f"{m.get('sla_breached', 0)} SLA-breached field jobs",
            "metric_key": "sla_breached",
            "metric_value": str(m.get("sla_breached", 0)),
            "link_path": "/field-service",
        },
        {
            "text": f"{m.get('quality_alerts', 0)} open quality alerts",
            "metric_key": "quality_alerts",
            "metric_value": str(m.get("quality_alerts", 0)),
            "link_path": "/quality",
        },
    ]
    watch: list[dict] = []
    if m.get("sla_breached", 0) > 0:
        watch.append({
            "severity": "critical",
            "text": f"{m['sla_breached']} field service jobs breached SLA",
            "link_path": "/field-service",
        })
    if m.get("pm_overdue", 0) > 0:
        watch.append({
            "severity": "high",
            "text": f"{m['pm_overdue']} assets past PM due date",
            "link_path": "/maintenance",
        })
    if m.get("rental_overdue", 0) > 0:
        watch.append({
            "severity": "medium",
            "text": f"{m['rental_overdue']} overdue rental returns",
            "link_path": "/rental",
        })
    if m.get("subs_past_due", 0) > 0:
        watch.append({
            "severity": "high",
            "text": f"{m['subs_past_due']} subscriptions past due",
            "link_path": "/subscriptions",
        })
    return {"headline": headline, "narrative": narrative, "bullets": bullets, "watch_items": watch}


RENDERERS = {
    "sales": render_sales,
    "finance": render_finance,
    "inventory": render_inventory,
    "hr": render_hr,
    "operations": render_operations,
}


def compose_executive(sections: list[dict], all_watch: list[dict]) -> dict:
    parts = [s["narrative"] for s in sections if s.get("narrative")]
    summary = " ".join(parts[:5]) if parts else "No domain data available for this period."

    high_watch = [w for w in all_watch if w.get("severity") in ("critical", "high")]
    if high_watch:
        headline = "Attention needed on collections, stock, or service delivery this period"
    elif all_watch:
        headline = "Business steady with a few items to review before your next meeting"
    else:
        headline = "Operations look stable across tracked domains for this period"

    return {"headline": headline, "summary": summary}
