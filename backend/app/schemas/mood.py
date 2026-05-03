"""
mood schema file
"""


from pydantic import BaseModel # base class for data validation
from typing import Optional # allows fields to be optional (can be None)


# request model for creating or updating a mood entry
class MoodEntryUpsertRequest(BaseModel):
    mood_score: int # required mood rating (e.g. 1–10)

    sleep_hours: Optional[float] = None # optional sleep duration in hours

    stress_level: Optional[int] = None # optional stress rating

    exercise_minutes: Optional[int] = None # optional exercise time in minutes

    notes: Optional[str] = None # optional free-text notes from user