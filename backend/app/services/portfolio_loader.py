import json
from functools import lru_cache
from pathlib import Path
from typing import Any

from ..config import settings


class PortfolioLoadError(RuntimeError):
    pass


@lru_cache(maxsize=1)
def _load_raw() -> dict[str, Any]:
    path: Path = settings.data_dir / "portfolio.json"
    if not path.exists():
        raise PortfolioLoadError(f"portfolio.json not found at {path}")
    with path.open("r", encoding="utf-8") as fh:
        return json.load(fh)


def load_portfolio() -> dict[str, Any]:
    return _load_raw()


def reload() -> None:
    _load_raw.cache_clear()
