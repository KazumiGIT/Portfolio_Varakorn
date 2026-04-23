from typing import Literal

from pydantic import BaseModel, Field

SkillCategory = Literal["language", "framework", "ai", "infra", "soft"]


class Skill(BaseModel):
    id: str
    name: str
    category: SkillCategory
    proficiency: int = Field(ge=1, le=5, description="1..5 stars")
    rune_glyph: str = "⚛"
    note: str | None = None
