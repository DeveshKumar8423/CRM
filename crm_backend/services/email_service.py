import os
import smtplib
from email.message import EmailMessage
from pathlib import Path
from jinja2 import Environment, FileSystemLoader, select_autoescape

# Load environment variables (already loaded via dotenv in config)
SMTP_HOST = os.getenv("SMTP_HOST")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USERNAME = os.getenv("SMTP_USERNAME")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")
SMTP_FROM = os.getenv("SMTP_FROM")

# Jinja2 environment for email templates located in the `templates` directory next to this file
BASE_DIR = Path(__file__).resolve().parent
TEMPLATE_ENV = Environment(
    loader=FileSystemLoader(BASE_DIR / "templates"),
    autoescape=select_autoescape(["html", "xml"]),
    trim_blocks=True,
    lstrip_blocks=True,
)

def render_template(template_name: str, **context) -> str:
    """Render an HTML email template with the given context.

    Args:
        template_name: Name of the template file (e.g., "reset_password.html").
        **context: Variables passed to the Jinja2 template.
    Returns:
        Rendered HTML string.
    """
    template = TEMPLATE_ENV.get_template(template_name)
    return template.render(**context)

def _get_smtp_client() -> smtplib.SMTP:
    """Create and configure an SMTP client.

    Returns:
        An active SMTP connection (already started TLS and logged in).
    """
    client = smtplib.SMTP(SMTP_HOST, SMTP_PORT)
    client.starttls()
    if SMTP_USERNAME and SMTP_PASSWORD:
        client.login(SMTP_USERNAME, SMTP_PASSWORD)
    return client

def send_email(to: str, subject: str, html_body: str, *, from_addr: str | None = None) -> None:
    """Send an HTML email.

    Args:
        to: Recipient email address.
        subject: Email subject line.
        html_body: HTML content of the email.
        from_addr: Optional sender address; defaults to SMTP_FROM.
    """
    from_addr = from_addr or SMTP_FROM
    if not from_addr:
        raise ValueError("SMTP_FROM is not set; cannot send email.")
    msg = EmailMessage()
    msg["Subject"] = subject
    msg["From"] = from_addr
    msg["To"] = to
    msg.set_content("Please view this email in an HTML‑compatible client.", subtype="plain")
    msg.add_alternative(html_body, subtype="html")
    client = _get_smtp_client()
    try:
        client.send_message(msg)
    finally:
        client.quit()
