from datetime import datetime, timezone

from pydantic import BaseModel, Field


class ErrorResponse(BaseModel):
    request_id: int
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    error_code: str
    detail: str
    path: str | None
    method: str | None