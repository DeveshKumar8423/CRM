"""Sales pipeline stages and defaults (Level 2 Module 2)."""

DEAL_STAGES = ["new", "contacted", "meeting", "proposal", "won", "lost"]

DEAL_STAGE_LABELS: dict[str, str] = {
    "new": "New",
    "contacted": "Contacted",
    "meeting": "Meeting booked",
    "proposal": "Proposal sent",
    "won": "Won",
    "lost": "Lost",
}

PIPELINE_STAGES = ["new", "contacted", "meeting", "proposal"]
CLOSED_DEAL_STAGES = ["won", "lost"]

DEFAULT_DEAL_STAGE = "new"
ASSIGN_DEAL_ROLES = {"Admin", "Manager"}
