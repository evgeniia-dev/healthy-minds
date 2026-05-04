"""
Stores user accounts
Handles login info (email + password hash)
Tracks role (patient / professional / etc.)
Keeps timestamps for creation & updates
"""


import uuid # for generating unique IDs
from datetime import datetime # for timestamps

from sqlalchemy import String, DateTime, Boolean # column types
from sqlalchemy.dialects.postgresql import UUID # PostgreSQL UUID type
from sqlalchemy.orm import Mapped, mapped_column # ORM tools

from app.db.session import Base # base model class


# table for storing user accounts
class User(Base):
    __tablename__ = "users"

    # unique ID for each user
    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )

    # user email (must be unique)
    email: Mapped[str] = mapped_column(
        String,
        unique=True,
        nullable=False,
        index=True
    )

    # hashed password (not plain text)
    password_hash: Mapped[str] = mapped_column(String, nullable=False)

    # full name (optional)
    full_name: Mapped[str | None] = mapped_column(String, nullable=True)

    # user role (e.g. patient, professional, admin)
    role: Mapped[str] = mapped_column(
        String,
        nullable=False,
        index=True
    )

    # profile picture URL (optional)
    avatar_url: Mapped[str | None] = mapped_column(String, nullable=True)

    # whether the user account is active
    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False
    )

    # when the user was created
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=datetime.utcnow,
        nullable=False
    )

    # when the user was last updated
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False
    )