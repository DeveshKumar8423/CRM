"""Level 2 lead sources, statuses, and CSV import mapping."""

LEAD_SOURCES = [
    "Omnichannel",
    "Website",
    "WhatsApp",
    "Google Ads",
    "Referral",
    "Manual",
    "Other",
]

LEAD_STATUSES = ["open", "hot", "follow_up", "cold", "lost", "qualified", "converted"]

ASSIGN_LEAD_ROLES = {"Admin", "Manager"}

CSV_STATUS_TO_LEAD_STATUS: dict[str, str] = {
    "fresh": "open",
    "prospect": "open",
    "interested": "hot",
    "take its": "hot",
    "didn't receive the call": "follow_up",
    "2nd director": "follow_up",
    "cold": "cold",
    "not interested": "lost",
    "advance received": "qualified",
    "grant": "qualified",
}

DEFAULT_LEAD_SOURCE = "Omnichannel"
DEFAULT_LEAD_STATUS = "open"


def map_csv_status(csv_status: str | None) -> str:
    if not csv_status:
        return DEFAULT_LEAD_STATUS
    key = csv_status.strip().lower()
    return CSV_STATUS_TO_LEAD_STATUS.get(key, DEFAULT_LEAD_STATUS)


def normalize_phone(value) -> str | None:
    if value is None:
        return None
    text = str(value).strip().replace(" ", "").replace("-", "")
    if text.endswith(".0"):
        text = text[:-2]
    digits = "".join(ch for ch in text if ch.isdigit())
    if not digits:
        return None
    if len(digits) == 10:
        return digits
    if len(digits) == 12 and digits.startswith("91"):
        return digits
    return digits[:30]
