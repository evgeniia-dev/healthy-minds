"""
POST /me → create or update todays mood entry
GET /me → get all your mood history
Only patients can submit entries
Prevents multiple entries per day (updates instead)
"""


from datetime import date # for getting today's date
from fastapi import APIRouter, Depends, HTTPException, status # FastAPI tools

from sqlalchemy.orm import Session # database session
from app.db.session import get_db # DB dependency
from app.dependencies import get_current_user # get logged-in user

from app.models.user import User # user model
from app.models.mood_entry import MoodEntry # mood entry model
from app.schemas.mood import MoodEntryUpsertRequest # request schema


# router for mood entry endpoints
router = APIRouter(prefix="/mood-entries", tags=["mood-entries"])

# Registered patients by professionals can submit mood-entries through this endpoint using MoodEntryUpsertRequest. If an entry for the current date already exists, it will be updated instead of creating a new one. Professionals cannot submit mood-entries on behalf of patients assigned to them.
# create or update today's mood entry (only for patients)
@router.post("/me")
def upsert_my_mood_entry(
    payload: MoodEntryUpsertRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # only patients are allowed
    if current_user.role != "patient":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only patients can submit check-ins",
        )

    # get today's date
    today = date.today()

    # check if user already has an entry today
    existing_entry = (
        db.query(MoodEntry)
        .filter(MoodEntry.user_id == current_user.id, MoodEntry.entry_date == today)
        .first()
    )

    if existing_entry:
        # update existing entry
        existing_entry.mood_score = payload.mood_score
        existing_entry.sleep_hours = payload.sleep_hours
        existing_entry.stress_level = payload.stress_level
        existing_entry.exercise_minutes = payload.exercise_minutes
        existing_entry.notes = payload.notes

        db.commit()
        db.refresh(existing_entry)

        # return updated entry
        return {
            "id": str(existing_entry.id),
            "user_id": str(existing_entry.user_id),
            "entry_date": existing_entry.entry_date.isoformat(),
            "mood_score": existing_entry.mood_score,
            "sleep_hours": float(existing_entry.sleep_hours) if existing_entry.sleep_hours is not None else None,
            "stress_level": existing_entry.stress_level,
            "exercise_minutes": existing_entry.exercise_minutes,
            "notes": existing_entry.notes,
        }

    # create new entry if none exists today
    new_entry = MoodEntry(
        user_id=current_user.id,
        entry_date=today,
        mood_score=payload.mood_score,
        sleep_hours=payload.sleep_hours,
        stress_level=payload.stress_level,
        exercise_minutes=payload.exercise_minutes,
        notes=payload.notes,
    )

    db.add(new_entry)
    db.commit()
    db.refresh(new_entry)

    # return new entry
    return {
        "id": str(new_entry.id),
        "user_id": str(new_entry.user_id),
        "entry_date": new_entry.entry_date.isoformat(),
        "mood_score": new_entry.mood_score,
        "sleep_hours": float(new_entry.sleep_hours) if new_entry.sleep_hours is not None else None,
        "stress_level": new_entry.stress_level,
        "exercise_minutes": new_entry.exercise_minutes,
        "notes": new_entry.notes,
    }

# get all mood entries for current user# Registered patient can view all their mood-entries, professionals can only view mood-entries of patients assigned to them through GET /patients/{patient_id}/mood-entries endpoint in patient_detail.py. Professionals cannot view mood-entries of patients not assigned to them. 
@router.get("/me")
def get_my_mood_entries(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # fetch entries sorted by date
    entries = (
        db.query(MoodEntry)
        .filter(MoodEntry.user_id == current_user.id)
        .order_by(MoodEntry.entry_date.asc())
        .all()
    )

    # return list of entries
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