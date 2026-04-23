from pydantic import BaseModel, Field


class Project(BaseModel):
    id: str
    title: str
    subtitle: str
    description: str
    stack: list[str] = Field(default_factory=list)
    outcomes: list[str] = Field(default_factory=list)
    floor_id: int
    icon: str = "gem"
    link: str | None = None
