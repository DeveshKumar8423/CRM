from __future__ import annotations

REPORT_PERIODS = ["today", "week", "month", "quarter", "custom"]

PERIOD_LABELS = {
    "today": "Today",
    "week": "This week",
    "month": "This month",
    "quarter": "This quarter",
    "custom": "Custom range",
}

STALE_DEAL_DAYS = 14

LEAD_SOURCES = [
    "Omnichannel",
    "Referral",
    "Website",
    "Social media",
    "Direct",
    "Partner",
    "Event",
    "Import / CSV",
]

OPEN_DEAL_STAGES = ["new", "contacted", "meeting", "proposal"]
