from fastapi import APIRouter

from ..models import Skill
from ..services.portfolio_loader import load_portfolio

router = APIRouter(prefix="/api/skills", tags=["skills"])


@router.get("", response_model=list[Skill])
async def list_skills() -> list[Skill]:
    data = load_portfolio()
    return [Skill.model_validate(s) for s in data["skills"]]
