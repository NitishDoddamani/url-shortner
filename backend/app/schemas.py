from pydantic import BaseModel, HttpUrl
from typing import Optional
from datetime import datetime

class ShortenRequest(BaseModel):
    original_url: str
    custom_alias: Optional[str] = None
    expiry_days:  Optional[int] = 30

class ShortenResponse(BaseModel):
    short_code:   str
    short_url:    str
    original_url: str
    expires_at:   Optional[datetime]
    created_at:   datetime

class AnalyticsResponse(BaseModel):
    short_code:   str
    original_url: str
    click_count:  int
    created_at:   datetime
    expires_at:   Optional[datetime]
    last_clicked: Optional[datetime]
    short_url:    str