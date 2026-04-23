import logging

import httpx

from ..config import settings

log = logging.getLogger(__name__)

RESEND_URL = "https://api.resend.com/emails"


class ResendError(RuntimeError):
    pass


async def send_contact_email(name: str, email: str, message: str) -> str:
    """Send a contact form email via Resend. Returns the Resend message id.

    Falls back to a no-op log if RESEND_API_KEY is not configured, so local dev
    works without a real key. Raises ResendError on API failures when configured.
    """
    if not settings.resend_api_key:
        log.warning("RESEND_API_KEY not set — contact email logged only, not sent.")
        log.info("Contact from %s <%s>: %s", name, email, message)
        return "dev-noop"

    payload = {
        "from": settings.resend_from_email,
        "to": [settings.contact_to_email],
        "reply_to": email,
        "subject": f"[Portfolio] New message from {name}",
        "html": _html_template(name, email, message),
        "text": _text_template(name, email, message),
    }

    headers = {
        "Authorization": f"Bearer {settings.resend_api_key}",
        "Content-Type": "application/json",
    }

    async with httpx.AsyncClient(timeout=10.0) as client:
        resp = await client.post(RESEND_URL, json=payload, headers=headers)

    if resp.status_code >= 400:
        raise ResendError(f"Resend returned {resp.status_code}: {resp.text}")

    data = resp.json()
    return str(data.get("id", "unknown"))


def _html_template(name: str, email: str, message: str) -> str:
    esc_name = _escape(name)
    esc_email = _escape(email)
    esc_body = _escape(message).replace("\n", "<br/>")
    return f"""
    <div style="font-family: 'Courier New', monospace; background:#1a1c2c; color:#f4f0bc; padding:24px;">
      <h2 style="color:#ffcd75; margin:0 0 16px 0;">⚔ New message from the dungeon</h2>
      <p><strong>From:</strong> {esc_name}<br/>
         <strong>Email:</strong> {esc_email}</p>
      <hr style="border:1px solid #566c86;"/>
      <p>{esc_body}</p>
    </div>
    """


def _text_template(name: str, email: str, message: str) -> str:
    return f"New message from dungeon portfolio\n\nFrom: {name} <{email}>\n\n{message}\n"


def _escape(text: str) -> str:
    return (
        text.replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
        .replace('"', "&quot;")
    )
