import logging
import time
from collections import defaultdict, deque

from fastapi import APIRouter, HTTPException, Request

from ..models import ContactRequest, ContactResponse
from ..services.resend_client import ResendError, send_contact_email

log = logging.getLogger(__name__)
router = APIRouter(prefix="/api/contact", tags=["contact"])

# Simple in-memory rate limiter: 3 requests / 10 min / IP.
_WINDOW_S = 600
_LIMIT = 3
_hits: dict[str, deque[float]] = defaultdict(deque)


def _rate_limit(ip: str) -> None:
    now = time.time()
    bucket = _hits[ip]
    while bucket and now - bucket[0] > _WINDOW_S:
        bucket.popleft()
    if len(bucket) >= _LIMIT:
        raise HTTPException(status_code=429, detail="Too many messages. Try again later.")
    bucket.append(now)


@router.post("", response_model=ContactResponse)
async def submit_contact(payload: ContactRequest, request: Request) -> ContactResponse:
    if payload.honeypot:
        # Silent drop on bot submission — pretend success.
        return ContactResponse(ok=True, id="dropped")

    ip = request.client.host if request.client else "unknown"
    _rate_limit(ip)

    try:
        message_id = await send_contact_email(payload.name, payload.email, payload.message)
    except ResendError as exc:
        log.exception("Resend error")
        raise HTTPException(status_code=502, detail=f"Mail provider error: {exc}") from exc

    return ContactResponse(ok=True, id=message_id, detail="Message sent.")
