import uuid
from datetime import datetime
from sqlalchemy import DateTime, Integer, Numeric, String, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column
from app.db.session import Base


class FinnishHealthCache(Base):
    __tablename__ = "finnish_health_cache"
    __table_args__ = (
        UniqueConstraint("indicator_id", "region", "year", name="uq_indicator_region_year"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    indicator_id: Mapped[int] = mapped_column(Integer, nullable=False)
    indicator_name: Mapped[str] = mapped_column(String, nullable=False)
    region: Mapped[str | None] = mapped_column(String, nullable=True)
    year: Mapped[int] = mapped_column(Integer, nullable=False)
    value: Mapped[float | None] = mapped_column(Numeric, nullable=True)
    fetched_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)