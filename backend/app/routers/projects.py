from fastapi import APIRouter

from ..models import Project
from ..services.portfolio_loader import load_portfolio

router = APIRouter(prefix="/api/projects", tags=["projects"])


@router.get("", response_model=list[Project])
async def list_projects() -> list[Project]:
    data = load_portfolio()
    return [Project.model_validate(p) for p in data["projects"]]
