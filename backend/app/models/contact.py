from pydantic import BaseModel, EmailStr, Field


class ContactRequest(BaseModel):
    name: str = Field(min_length=1, max_length=80)
    email: EmailStr
    message: str = Field(min_length=1, max_length=4000)
    honeypot: str | None = Field(default=None, max_length=0, description="Must stay empty.")


class ContactResponse(BaseModel):
    ok: bool
    id: str | None = None
    detail: str | None = None
