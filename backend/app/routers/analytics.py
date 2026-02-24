from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import URL
from app.schemas import AnalyticsResponse
from app.config import settings

router = APIRouter()

@router.get("/analytics/{short_code}", response_model=AnalyticsResponse)
def get_analytics(short_code: str, db: Session = Depends(get_db)):
    url_entry = db.query(URL).filter(URL.short_code == short_code).first()
    if not url_entry:
        raise HTTPException(status_code=404, detail="Short URL not found!")

    return AnalyticsResponse(
        short_code=url_entry.short_code,
        original_url=url_entry.original_url,
        click_count=url_entry.click_count,
        created_at=url_entry.created_at,
        expires_at=url_entry.expires_at,
        last_clicked=url_entry.last_clicked,
        short_url=f"{settings.BASE_URL}/{url_entry.short_code}"
    )