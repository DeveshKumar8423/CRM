"""Follow-up reminder types and defaults (Level 2 Module 3)."""

REMINDER_TYPES = ["call", "email", "whatsapp", "meeting", "other"]

REMINDER_TYPE_LABELS = {
    "call": "Phone call",
    "email": "Email",
    "whatsapp": "WhatsApp",
    "meeting": "Meeting",
    "other": "Other",
}

REMINDER_STATUSES = ["pending", "completed", "cancelled"]

REMINDER_PRIORITIES = ["low", "normal", "high", "urgent"]

DEFAULT_REMINDER_PRIORITY = "normal"
