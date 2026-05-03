"""
Controls access to patient data
Only professionals with a link can view patients

Lets professionals:
View patient profile
View mood history
View treatment notes
Create treatment notes
"""


from fastapi import APIRouter, Depends, HTTPException, status # FastAPI tools
from sqlalchemy.orm import Session # database session

from app.db.session import get_db # DB dependency
from app.dependencies import get_current_user # get logged-in user

from app.models.user import User # user model
from app.models.patient_link import PatientProfessionalLink # user model
from app.models.mood_entry import MoodEntry # mood entries
from app.models.treatment_note import TreatmentNote # treatment notes


# router for patient detail endpoints (professional access only)
router = APIRouter(prefix="/patients", tags=["patient-detail"])


# helper function: checks if professional has access to a patient
def ensure_professional_has_access(
    professional: User,
    patient_id: str,
    db: Session,
):

    # only professionals allowed
    if professional.role != "professional":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only professionals can access patient details",
        )

    # check if link exists between professional and patient
    link = (
        db.query(PatientProfessionalLink)
        .filter(
            PatientProfessionalLink.professional_id == professional.id,
            PatientProfessionalLink.patient_id == patient_id,
        )
        .first()
    )

    # deny access if no link found
    if not link:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have access to this patient",
        )


# get basic patient profile info
@router.get("/{patient_id}")
def get_patient_detail(
    patient_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # check access rights
    ensure_professional_has_access(current_user, patient_id, db)

    # fetch patient from DB
    patient = db.query(User).filter(User.id == patient_id).first()

    # if not found, return error
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found",
        )

    # return patient info
    return {
        "id": str(patient.id),
        "email": patient.email,
        "full_name": patient.full_name,
        "avatar_url": patient.avatar_url,
        "role": patient.role,
    }


# get patient's mood history
@router.get("/{patient_id}/mood-entries")
def get_patient_mood_entries(
    patient_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # check access rights
    ensure_professional_has_access(current_user, patient_id, db)

    # fetch mood entries
    entries = (
        db.query(MoodEntry)
        .filter(MoodEntry.user_id == patient_id)
        .order_by(MoodEntry.entry_date.asc())
        .all()
    )

    # return formatted list
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


# get all treatment notes for a patient
@router.get("/{patient_id}/treatment-notes")
def get_patient_treatment_notes(
    patient_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # check access rights
    ensure_professional_has_access(current_user, patient_id, db)

    # fetch notes (latest first)
    notes = (
        db.query(TreatmentNote)
        .filter(TreatmentNote.patient_id == patient_id)
        .order_by(TreatmentNote.created_at.desc())
        .all()
    )

    # return formatted notes
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


# create a new treatment note
@router.post("/{patient_id}/treatment-notes")
def create_treatment_note(
    patient_id: str,
    payload: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # check access rights
    ensure_professional_has_access(current_user, patient_id, db)

    # extract data from request
    note_type = payload.get("note_type")
    content = payload.get("content")

    # validate note type
    if note_type not in {"session", "medication", "intervention"}:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid note type",
        )

    # validate content
    if not content or not str(content).strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Note content is required",
        )

    # create new note
    note = TreatmentNote(
        patient_id=patient_id,
        professional_id=current_user.id,
        note_type=note_type,
        content=str(content).strip(),
    )

    # save to database
    db.add(note)
    db.commit()
    db.refresh(note)

    # return created note
    return {
        "id": str(note.id),
        "patient_id": str(note.patient_id),
        "professional_id": str(note.professional_id),
        "note_type": note.note_type,
        "content": note.content,
        "created_at": note.created_at.isoformat(),
        "updated_at": note.updated_at.isoformat(),
    }