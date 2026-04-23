from fastapi import APIRouter, HTTPException

from ..models import Floor
from ..services.portfolio_loader import load_portfolio

router = APIRouter(prefix="/api/floors", tags=["floors"])


@router.get("", response_model=list[Floor])
async def list_floors() -> list[Floor]:
    data = load_portfolio()
    return [Floor.model_validate(f) for f in data["floors"]]


@router.get("/{floor_id}", response_model=Floor)
async def get_floor(floor_id: int) -> Floor:
    data = load_portfolio()
    for f in data["floors"]:
        if f["id"] == floor_id:
            return Floor.model_validate(f)
    raise HTTPException(status_code=404, detail=f"Floor {floor_id} not found")
