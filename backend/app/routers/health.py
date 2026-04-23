from fastapi import APIRouter

from ..config import settings

router = APIRouter(prefix="/api", tags=["health"])


@router.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok", "app": settings.app_name, "version": settings.app_version}
