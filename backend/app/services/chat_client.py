"""Chatbot backend — two modes:

1. Gemini (if GEMINI_API_KEY is set): sends a system-prompted call to
   the Gemini REST API with a compact portfolio context.
2. FAQ fallback: keyword-based matcher over the portfolio JSON. Always
   available; used when the API key is missing or the remote call fails.
"""

from __future__ import annotations

import logging
from typing import Iterable

import httpx

from ..config import settings
from ..models import ChatTurn
from .portfolio_loader import load_portfolio

log = logging.getLogger(__name__)

GEMINI_ENDPOINT = (
    "https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"
)


def _system_prompt() -> str:
    data = load_portfolio()
    p = data["profile"]
    projects = data.get("projects", [])
    skills = data.get("skills", [])
    proj_lines = "\n".join(
        f"- {pr['title']}: {pr['subtitle']} | stack={', '.join(pr.get('stack', []))}"
        for pr in projects
    )
    skill_lines = ", ".join(f"{s['name']} ({s['proficiency']}/5)" for s in skills)
    return f"""You are {p['name']} (a.k.a. {p.get('alias', '')}), a {p['role']}.
You are chatting with a visitor to your pixel-art dungeon portfolio. Reply in
first person as yourself. Be friendly, concise (2-4 sentences), human — not
robotic. Use occasional emoji sparingly (⬥ ⚔ ✦). Avoid bullet lists unless the
user explicitly asks. Never invent facts. If asked something not covered below,
say so briefly and offer to connect (email {p['email']}).

CONTEXT:
- Role: {p['role']}
- Business: {p.get('business', '')}
- Location: {p.get('location', '')}
- Languages: {', '.join(p.get('languages', []))}
- Bio: {p['bio']}
- Tagline: {p.get('tagline', '')}
- What I do:
  - {chr(10).join('  - ' + x for x in p.get('what_i_do', []))}
- Projects:
{proj_lines}
- Skills: {skill_lines}
"""


async def reply(message: str, history: Iterable[ChatTurn]) -> tuple[str, str]:
    """Returns (reply_text, source). Source is 'gemini' or 'faq'."""
    if settings.gemini_api_key:
        try:
            text = await _call_gemini(message, list(history))
            if text:
                return text.strip(), "gemini"
        except Exception:
            log.exception("Gemini call failed — falling back to FAQ")
    return _faq_reply(message), "faq"


async def _call_gemini(message: str, history: list[ChatTurn]) -> str:
    url = GEMINI_ENDPOINT.format(model=settings.gemini_model)
    # Gemini v1beta expects role='user' or role='model'; convert assistant.
    contents: list[dict] = []
    for h in history[-10:]:
        contents.append(
            {
                "role": "model" if h.role == "assistant" else "user",
                "parts": [{"text": h.content}],
            }
        )
    contents.append({"role": "user", "parts": [{"text": message}]})

    payload = {
        "system_instruction": {"parts": [{"text": _system_prompt()}]},
        "contents": contents,
        "generationConfig": {
            "temperature": 0.7,
            "topP": 0.9,
            "maxOutputTokens": 320,
        },
    }

    headers = {
        "Content-Type": "application/json",
        "x-goog-api-key": settings.gemini_api_key or "",
    }

    async with httpx.AsyncClient(timeout=12.0) as client:
        resp = await client.post(url, json=payload, headers=headers)

    if resp.status_code >= 400:
        raise RuntimeError(f"Gemini {resp.status_code}: {resp.text[:300]}")

    data = resp.json()
    candidates = data.get("candidates", [])
    if not candidates:
        return ""
    parts = candidates[0].get("content", {}).get("parts", [])
    return "".join(part.get("text", "") for part in parts)


_FAQ_RULES: list[tuple[tuple[str, ...], str]] = [
    (
        ("hire", "available", "hiring", "work with", "freelance", "contract"),
        "I'm open to freelance and contract work — full-stack AI builds, "
        "automation, and content-heavy ops. Drop me a note at "
        "varakornm0403@gmail.com or use the Crystal Ball on the throne floor.",
    ),
    (
        ("who are you", "about you", "tell me about", "your background"),
        "I'm Varakorn (a.k.a. Kazumi) — Full Stack AI Engineer based in Shah "
        "Alam. I ship BPA, AI agents, and custom web tools through my "
        "sole-proprietorship Orion Automation. Also run content at HYGR "
        "(38M+ views across socials).",
    ),
    (
        ("project", "built", "portfolio", "what have you", "shipped"),
        "Shipped Tendervise AI (tender-doc agent), Abang Mystery (branching "
        "AI narrative), Health Monitor (real-time IoT dashboard), and HYGR's "
        "content automation pipeline. All visible on The Forge and The Echo "
        "Chamber floors.",
    ),
    (
        ("skill", "stack", "tech", "language", "tool"),
        "Primary stack: Python · FastAPI · React · Langchain · AI agents. "
        "Comfortable across backend, AI integration, and ops automation. "
        "Walk into The Forge to see the rune glyphs.",
    ),
    (
        ("contact", "reach", "email"),
        "Easiest route: varakornm0403@gmail.com — or walk to The Throne Room "
        "and tap the Crystal Ball. Reply within a day or two usually.",
    ),
    (
        ("hygr", "viral", "38m", "content"),
        "HYGR was the Natural Deodorant campaign that crossed 38M+ views. "
        "I ran content, pacing, and built the automation pipeline behind it.",
    ),
    (
        ("location", "where", "based"),
        "Shah Alam, Selangor, Malaysia. Speaks English, Malay, Chinese, and "
        "spoken Thai.",
    ),
    (
        ("ai", "agent", "langchain", "llm"),
        "Most of my recent work is AI agents + RAG — Langchain, OpenAI, "
        "embeddings, tool-calling. Tendervise AI is the clearest example on "
        "The Forge floor.",
    ),
]


def _faq_reply(message: str) -> str:
    m = message.lower()
    for keys, answer in _FAQ_RULES:
        if any(k in m for k in keys):
            return answer
    return (
        "Good question — I don't have a pre-written answer for that one. "
        "Shoot me a note at varakornm0403@gmail.com and I'll get back to you. "
        "Or tap around the dungeon — the pedestals cover a lot of ground."
    )
