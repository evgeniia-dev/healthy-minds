from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.models.patient_link import PatientProfessionalLink
from app.models.mood_entry import MoodEntry
from app.models.treatment_note import TreatmentNote

router = APIRouter(prefix="/patients", tags=["patient-detail"])


def ensure_professional_has_access(
    professional: User,
    patient_id: str,
    db: Session,
):
    if professional.role != "professional":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only professionals can access patient details",
        )

    link = (
        db.query(PatientProfessionalLink)
        .filter(
            PatientProfessionalLink.professional_id == professional.id,
            PatientProfessionalLink.patient_id == patient_id,
        )
        .first()
    )

    if not link:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have access to this patient",
        )


@router.get("/{patient_id}")
def get_patient_detail(
    patient_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    ensure_professional_has_access(current_user, patient_id, db)

    patient = db.query(User).filter(User.id == patient_id).first()

    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found",
        )

    return {
        "id": str(patient.id),
        "email": patient.email,
        "full_name": patient.full_name,
        "avatar_url": patient.avatar_url,
        "role": patient.role,
    }


@router.get("/{patient_id}/mood-entries")
def get_patient_mood_entries(
    patient_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    ensure_professional_has_access(current_user, patient_id, db)

    entries = (
        db.query(MoodEntry)
        .filter(MoodEntry.user_id == patient_id)
        .order_by(MoodEntry.entry_date.asc())
        .all()
    )

    return [
        {
            "id": str(entry.id),
            "user_id": str(entry.user_id),
            "entry_date": entry.entry_date.isoformat(),
            "mood_score": entry.mood_score,
            "sleep_hours": float(entry.sleep_hours) if entry.sleep_hours is not None else None,
            "stress_level": entry.stress_level,
            "exercise_minutes": entry.exercise_minutes,
            "notes": entry.notes,
        }
        for entry in entries
    ]


@router.get("/{patient_id}/treatment-notes")
def get_patient_treatment_notes(
    patient_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    ensure_professional_has_access(current_user, patient_id, db)

    notes = (
        db.query(TreatmentNote)
        .filter(TreatmentNote.patient_id == patient_id)
        .order_by(TreatmentNote.created_at.desc())
        .all()
    )

    return [
        {
            "id": str(note.id),
            "patient_id": str(note.patient_id),
            "professional_id": str(note.professional_id),
            "note_type": note.note_type,
            "content": note.content,
            "created_at": note.created_at.isoformat(),
            "updated_at": note.updated_at.isoformat(),
        }
        for note in notes
    ]


@router.post("/{patient_id}/treatment-notes")
def create_treatment_note(
    patient_id: str,
    payload: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    ensure_professional_has_access(current_user, patient_id, db)

    note_type = payload.get("note_type")
    content = payload.get("content")

    if note_type not in {"session", "medication", "intervention"}:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid note type",
        )

    if not content or not str(content).strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Note content is required",
        )

    note = TreatmentNote(
        patient_id=patient_id,
        professional_id=current_user.id,
        note_type=note_type,
        content=str(content).strip(),
    )

    db.add(note)
    db.commit()
    db.refresh(note)

    return {
        "id": str(note.id),
        "patient_id": str(note.patient_id),
        "professional_id": str(note.professional_id),
        "note_type": note.note_type,
        "content": note.content,
        "created_at": note.created_at.isoformat(),
        "updated_at": note.updated_at.isoformat(),
    }