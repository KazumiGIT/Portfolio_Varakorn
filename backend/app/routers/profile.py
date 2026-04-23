from fastapi import APIRouter

from ..models import Profile
from ..services.portfolio_loader import load_portfolio

router = APIRouter(prefix="/api/profile", tags=["profile"])


@router.get("", response_model=Profile)
async def get_profile() -> Profile:
    data = load_portfolio()
    return Profile.model_validate(data["profile"])
