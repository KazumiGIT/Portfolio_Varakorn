from pathlib import Path

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    app_name: str = "Varakorn Dungeon Portfolio API"
    app_version: str = "2.0.0"
    cors_origins: list[str] = Field(
        default_factory=lambda: [
            "http://localhost:5173",
            "http://127.0.0.1:5173",
        ]
    )

    resend_api_key: str | None = None
    resend_from_email: str = "onboarding@resend.dev"
    contact_to_email: str = "varakornm0403@gmail.com"

    gemini_api_key: str | None = None
    gemini_model: str = "gemini-2.5-flash"

    data_dir: Path = Path(__file__).resolve().parent / "data"


settings = Settings()
