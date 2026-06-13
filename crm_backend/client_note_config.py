from __future__ import annotations

NOTE_TYPES = [
    "call",
    "meeting",
    "email_summary",
    "message_summary",
    "requirement",
    "objection",
    "preference",
    "follow_up",
    "risk",
    "internal",
    "escalation",
    "billing",
]

NOTE_TYPE_LABELS = {
    "call": "Call Note",
    "meeting": "Meeting Note",
    "email_summary": "Email Summary",
    "message_summary": "Message Summary",
    "requirement": "Requirement",
    "objection": "Objection",
    "preference": "Preference",
    "follow_up": "Follow-Up",
    "risk": "Risk",
    "internal": "Internal",
    "escalation": "Escalation",
    "billing": "Billing / Payment",
}

VISIBILITY_SCOPES = ["team", "internal", "sensitive"]

VISIBILITY_LABELS = {
    "team": "Shareable across team",
    "internal": "Internal only",
    "sensitive": "Sensitive / restricted",
}

FOLLOW_UP_PRIORITIES = ["low", "normal", "high", "urgent"]
