from sqlalchemy import Column, String, Integer, DateTime, Boolean
from sqlalchemy.sql import func
from app.database import Base

class URL(Base):
    __tablename__ = "urls"

    id            = Column(Integer, primary_key=True, index=True)
    short_code    = Column(String, unique=True, index=True, nullable=False)
    original_url  = Column(String, nullable=False)
    custom_alias  = Column(Boolean, default=False)
    click_count   = Column(Integer, default=0)
    created_at    = Column(DateTime(timezone=True), server_default=func.now())
    expires_at    = Column(DateTime(timezone=True), nullable=True)
    last_clicked  = Column(DateTime(timezone=True), nullable=True)