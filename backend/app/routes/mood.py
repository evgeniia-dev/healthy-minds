from datetime import date
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.models.mood_entry import MoodEntry
from app.schemas.mood import MoodEntryUpsertRequest

router = APIRouter(prefix="/mood-entries", tags=["mood-entries"])


@router.post("/me")
def upsert_my_mood_entry(
    payload: MoodEntryUpsertRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role != "patient":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only patients can submit check-ins",
        )

    today = date.today()

    existing_entry = (
        db.query(MoodEntry)
        .filter(MoodEntry.user_id == current_user.id, MoodEntry.entry_date == today)
        .first()
    )

    if existing_entry:
        existing_entry.mood_score = payload.mood_score
        existing_entry.sleep_hours = payload.sleep_hours
        existing_entry.stress_level = payload.stress_level
        existing_entry.exercise_minutes = payload.exercise_minutes
        existing_entry.notes = payload.notes
        db.commit()
        db.refresh(existing_entry)

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


@router.get("/me")
def get_my_mood_entries(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    entries = (
        db.query(MoodEntry)
        .filter(MoodEntry.user_id == current_user.id)
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