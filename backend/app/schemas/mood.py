from pydantic import BaseModel
from typing import Optional


class MoodEntryUpsertRequest(BaseModel):
    mood_score: int
    sleep_hours: Optional[float] = None
    stress_level: Optional[int] = None
    exercise_minutes: Optional[int] = None
    notes: Optional[str] = None