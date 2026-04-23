from typing import Literal

from pydantic import BaseModel, Field

InteractableKind = Literal[
    "chest",
    "chest_contact",
    "enemy",
    "portal_entrance",
    "portal_locked",
    # Legacy kinds kept for back-compat in case old data is loaded.
    "pedestal",
    "altar",
    "statue",
    "fountain",
    "anvil",
    "rune",
    "door",
    "throne",
    "crystal_ball",
    "messenger_bird",
    "screen",
    "stairs",
    "portal",
]


class Interactable(BaseModel):
    id: str
    kind: InteractableKind
    x: int = Field(ge=0, description="tile x in 16px grid")
    y: int = Field(ge=0, description="tile y in 16px grid")
    w: int = Field(default=1, ge=1)
    h: int = Field(default=1, ge=1)
    label: str
    title: str
    body: str
    accent: str | None = None
    meta: dict[str, str | int | float | bool] = Field(default_factory=dict)


class Floor(BaseModel):
    id: int
    slug: str
    name: str
    theme: str
    palette: list[str] = Field(description="hex colors, first is wall, second is floor, etc.")
    ambient: str
    width: int = Field(ge=10, description="tile columns")
    height: int = Field(ge=8, description="tile rows")
    spawn: tuple[int, int]
    exits: list[dict[str, int | str]] = Field(default_factory=list)
    interactables: list[Interactable]
    soft_gate_required: list[str] = Field(default_factory=list)
