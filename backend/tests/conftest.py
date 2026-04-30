import pytest
from fastapi.testclient import TestClient
from app.db.session import SessionLocal
from app.models import User
from app.main import app


# teardown test inputs committed to database by test_auth
test_email = "test.user@example.com"

@pytest.fixture(scope="module")
def client():
  with TestClient(app) as test_client:
    yield test_client
    db = SessionLocal()
    try:
      db.query(User).filter(User.email.in_([test_email])).delete(synchronize_session=False)
      db.commit()
    finally:
      db.close()