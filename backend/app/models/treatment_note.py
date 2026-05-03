"""
Stores notes written by professionals
Linked to both patient + professional
Tracks type, content, and timestamps
"""


import uuid # for generating unique IDs
from datetime import datetime # for timestamps

from sqlalchemy import DateTime, ForeignKey, String, Text # column types and relationships
from sqlalchemy.dialects.postgresql import UUID # PostgreSQL UUID type
from sqlalchemy.orm import Mapped, mapped_column # ORM tools

from app.db.session import Base # base model class

# table for storing treatment notes written by professionals for patients
class TreatmentNote(Base):
    __tablename__ = "treatment_notes"

    # unique ID for each note
    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )

    # patient user ID (note belongs to this patient)
    patient_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False
    )

    # professional user ID (who wrote the note)
    professional_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False
    )

    # type/category of the note (e.g. diagnosis, progress, session)
    note_type: Mapped[str] = mapped_column(String, nullable=False)

    # actual note content
    content: Mapped[str] = mapped_column(Text, nullable=False)

    # when the note was created
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=datetime.utcnow,
        nullable=False
    )

    # when the note was last updated
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False
    )