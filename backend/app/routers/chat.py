import logging
import time
from collections import defaultdict, deque

from fastapi import APIRouter, HTTPException, Request

from ..models import ChatRequest, ChatResponse
from ..services.chat_client import reply as chat_reply

log = logging.getLogger(__name__)
router = APIRouter(prefix="/api/chat", tags=["chat"])

# 20 messages / 5 min / IP.
_WINDOW_S = 300
_LIMIT = 20
_hits: dict[str, deque[float]] = defaultdict(deque)


def _rate_limit(ip: str) -> None:
    now = time.time()
    bucket = _hits[ip]
    while bucket and now - bucket[0] > _WINDOW_S:
        bucket.popleft()
    if len(bucket) >= _LIMIT:
        raise HTTPException(status_code=429, detail="Slow down a little.")
    bucket.append(now)


@router.post("", response_model=ChatResponse)
async def post_chat(payload: ChatRequest, request: Request) -> ChatResponse:
    ip = request.client.host if request.client else "unknown"
    _rate_limit(ip)
    text, source = await chat_reply(payload.message, payload.history)
    return ChatResponse(reply=text, source=source)
