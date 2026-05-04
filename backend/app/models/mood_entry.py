"""
Stores daily mood tracking
Only one entry per user per day
Tracks sleep, stress, exercise + notes
"""


import uuid # for generating unique IDs
from datetime import date, datetime, UTC # for dates and timestamps

from sqlalchemy import Date, DateTime, ForeignKey, Integer, Numeric, Text, UniqueConstraint # column types and constraints
from sqlalchemy.dialects.postgresql import UUID # PostgreSQL UUID type
from sqlalchemy.orm import Mapped, mapped_column # ORM tools

from app.db.session import Base # base model class

# table for storing user mood tracking data
class MoodEntry(Base):
    __tablename__ = "mood_entries"

    # prevent multiple entries per user per day
    __table_args__ = (
        UniqueConstraint("user_id", "entry_date", name="uq_user_entry_date"),
    )

    # unique ID for each mood entry
    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )

    # link to user (deletes entries if user is deleted)
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False
    )

    # date of the mood entry (default = today)
    entry_date: Mapped[date] = mapped_column(
        Date,
        nullable=False,
        default=date.today
    )

    # mood rating (e.g. 1–10)
    mood_score: Mapped[int] = mapped_column(Integer, nullable=False)

    # hours of sleep (optional, 1 decimal place)
    sleep_hours: Mapped[float | None] = mapped_column(Numeric(3, 1), nullable=True)

    # stress level (optional)
    stress_level: Mapped[int | None] = mapped_column(Integer, nullable=True)

    # minutes of exercise (optional)
    exercise_minutes: Mapped[int | None] = mapped_column(Integer, nullable=True)

    # optional notes from the user
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    # when the entry was created
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=datetime.now(UTC),
        nullable=False
    )

    # when the entry was last updated
    updated_at: Mapped[datetime] = mapped_column(DateTime(
        timezone=True),
        default=datetime.now(UTC),
        onupdate=datetime.now(UTC),
        nullable=False
    )