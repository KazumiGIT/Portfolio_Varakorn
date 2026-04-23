from pydantic import BaseModel, Field


from typing import Literal


class Social(BaseModel):
    id: str
    label: str
    href: str
    glyph: str = "⬥"
    accent: str = "#f4f0bc"
    kind: Literal["link", "vcard", "donation"] = "link"
    group: Literal["primary", "others"] = "others"
    disabled: bool = False


class Profile(BaseModel):
    name: str
    alias: str | None = None
    role: str
    business: str | None = None
    email: str
    location: str | None = None
    languages: list[str] = Field(default_factory=list)
    bio: str
    tagline: str | None = None
    what_i_do: list[str] = Field(default_factory=list)
    socials: list[Social] = Field(default_factory=list)
