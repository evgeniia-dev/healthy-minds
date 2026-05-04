"""
Stores health statistics data
Prevents duplicates (same indicator + region + year)
Keeps track of when data was fetched
"""

import uuid # used to generate unique IDs
from datetime import datetime # used for timestamps


from sqlalchemy import DateTime, Integer, Numeric, String, UniqueConstraint # column types and constraints
from sqlalchemy.dialects.postgresql import UUID # PostgreSQL UUID type
from sqlalchemy.orm import Mapped, mapped_column # ORM mapping tools

from app.db.session import Base # base class for all models

# database table for storing cached Finnish health data
class FinnishHealthCache(Base):
    __tablename__ = "finnish_health_cache"

    # ensure no duplicate data for same indicator, region, and year
    __table_args__ = (
        UniqueConstraint("indicator_id", "region", "year", name="uq_indicator_region_year"),
    )

    # unique ID for each record (UUID)
    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )

    # ID of the health indicator (e.g. statistic ID)
    indicator_id: Mapped[int] = mapped_column(Integer, nullable=False)

    # name of the indicator (e.g. "mental health index")
    indicator_name: Mapped[str] = mapped_column(String, nullable=False)

    # region (can be null if not region-specific)
    region: Mapped[str | None] = mapped_column(String, nullable=True)

    # year of the data
    year: Mapped[int] = mapped_column(Integer, nullable=False)

    # value of the indicator (can be null if missing)
    value: Mapped[float | None] = mapped_column(Numeric, nullable=True)

    # when this data was fetched and stored
    fetched_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=datetime.utcnow,
        nullable=False
    )