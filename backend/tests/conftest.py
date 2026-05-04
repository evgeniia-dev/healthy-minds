import pytest
from fastapi.testclient import TestClient
from app.db.session import SessionLocal
from app.models.patient_link import PatientProfessionalLink
from app.models import User
from app.main import app

# test inputs for test_auth
test_email = "test.user@example.com"
# test inputs for test_patients
test_professional_email = "prof.test@example.com"
test_patient_emails =["patient.test@example.com", "patient2.test@example.com", "patient3.test@example.com", "patient.detail@example.com"]

# teardown test inputs committed to database
@pytest.fixture(scope="module")
def client():
  with TestClient(app) as test_client:
    yield test_client
    db = SessionLocal()
    try:
      # teardown test inputs committed to database by test_auth 
      db.query(User).filter(User.email.in_([test_email])).delete(synchronize_session=False)
      db.commit()

      # teardown test inputs committed to database by test_patients
      db.query(PatientProfessionalLink).filter(
            PatientProfessionalLink.professional_id.in_(
              db.query(User).filter(User.email.in_([test_professional_email])).with_entities(User.id))
          ).delete(synchronize_session=False)
      db.query(User).filter(User.email.in_([test_professional_email,    test_patient_emails[0], test_email])).delete(synchronize_session=False)
      db.commit()

      # teardown test inputs committed to database by test_mood
      db.query(User).filter(User.email.in_(test_patient_emails)).delete(synchronize_session=False)
      db.commit()

      # teardown test inputs committed to database by test_patient_detail
      db.query(User).filter(User.email.in_(test_patient_emails)).delete(synchronize_session=False)
      db.commit()

    finally:
      db.close()