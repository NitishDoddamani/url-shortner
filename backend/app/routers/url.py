from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from datetime import datetime, timedelta, timezone
import random
import string

from app.database import get_db
from app.models import URL
from app.schemas import ShortenRequest, ShortenResponse
from app.redis_client import redis_client
from app.config import settings

router = APIRouter()

def generate_short_code(length=6):
    chars = string.ascii_letters + string.digits
    return ''.join(random.choices(chars, k=length))

@router.post("/shorten", response_model=ShortenResponse)
def shorten_url(request: ShortenRequest, db: Session = Depends(get_db)):

    # Handle custom alias
    if request.custom_alias:
        existing = db.query(URL).filter(URL.short_code == request.custom_alias).first()
        if existing:
            raise HTTPException(status_code=400, detail="Custom alias already taken!")
        short_code = request.custom_alias
        is_custom = True
    else:
        # Auto generate unique code
        while True:
            short_code = generate_short_code()
            if not db.query(URL).filter(URL.short_code == short_code).first():
                break
        is_custom = False

    # Calculate expiry
    expires_at = None
    if request.expiry_days:
        expires_at = datetime.now(timezone.utc) + timedelta(days=request.expiry_days)

    # Save to PostgreSQL
    url_entry = URL(
        short_code=short_code,
        original_url=request.original_url,
        custom_alias=is_custom,
        expires_at=expires_at
    )
    db.add(url_entry)
    db.commit()
    db.refresh(url_entry)

    # Cache in Redis
    redis_client.setex(short_code, settings.REDIS_CACHE_TTL, request.original_url)

    return ShortenResponse(
        short_code=short_code,
        short_url=f"{settings.BASE_URL}/{short_code}",
        original_url=request.original_url,
        expires_at=expires_at,
        created_at=url_entry.created_at
    )

@router.get("/{short_code}")
def redirect_url(short_code: str, db: Session = Depends(get_db)):

    # Check Redis first (O(1) lookup)
    cached_url = redis_client.get(short_code)

    if cached_url:
        # Update click count async in DB
        url_entry = db.query(URL).filter(URL.short_code == short_code).first()
        if url_entry:
            # Check expiry
            if url_entry.expires_at and url_entry.expires_at < datetime.now(timezone.utc):
                redis_client.delete(short_code)
                raise HTTPException(status_code=410, detail="This URL has expired!")
            url_entry.click_count += 1
            url_entry.last_clicked = datetime.now(timezone.utc)
            db.commit()
        return RedirectResponse(url=cached_url, status_code=307)

    # Cache miss — check PostgreSQL
    url_entry = db.query(URL).filter(URL.short_code == short_code).first()
    if not url_entry:
        raise HTTPException(status_code=404, detail="Short URL not found!")

    # Check expiry
    if url_entry.expires_at and url_entry.expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=410, detail="This URL has expired!")

    # Update click stats
    url_entry.click_count += 1
    url_entry.last_clicked = datetime.now(timezone.utc)
    db.commit()

    # Store in Redis for next time
    redis_client.setex(short_code, settings.REDIS_CACHE_TTL, url_entry.original_url)

    return RedirectResponse(url=url_entry.original_url, status_code=307)