"""
Connects patients to professionals
Prevents duplicate connections
Auto-deletes links if a user is removed
"""


import uuid # for generating unique IDs
from datetime import datetime # for timestamps

from sqlalchemy import DateTime, ForeignKey, UniqueConstraint # constraints and relationships
from sqlalchemy.dialects.postgresql import UUID # PostgreSQL UUID type
from sqlalchemy.orm import Mapped, mapped_column # ORM tools

from app.db.session import Base # base model class

# table that links patients with professionals (many-to-many relationship)
class PatientProfessionalLink(Base):
    __tablename__ = "patient_professional_links"

    # prevent duplicate links between same patient and professional
    __table_args__ = (
        UniqueConstraint("patient_id", "professional_id", name="uq_patient_professional_link"),
    )

    # unique ID for each link
    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )

    # patient user ID (deleted if user is deleted)
    patient_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False
    )

    # professional user ID (deleted if user is deleted)
    professional_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False
    )

    # when the link was created
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=datetime.utcnow,
        nullable=False
    )