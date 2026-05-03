# Import registry for SQLAlchemy

# base class for all database models (SQLAlchemy)
from app.db.session import Base

# user table (accounts: patients, professionals, etc.)
from app.models.user import User

# links patients with professionals (relationship between users)
from app.models.patient_link import PatientProfessionalLink

# stores mood tracking data (user mood logs)
from app.models.mood_entry import MoodEntry

# notes written by professionals about patients
from app.models.treatment_note import TreatmentNote

# cached health-related data (likely external Finnish health info)
from app.models.finnish_health_cache import FinnishHealthCache