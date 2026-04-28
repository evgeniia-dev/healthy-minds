import pytest
from fastapi.testclient import TestClient
from app.db.session import SessionLocal
from app.models import User
from app.main import app


test_email = "test.user@example.com"
test_pwd = "testuser123"
test_name = "test user 1"

#client = TestClient(app)

# teardown test inputs committed to production database
@pytest.fixture
def client():
  with TestClient(app) as test_client:
    yield test_client
    db = SessionLocal()
    try:
      db.query(User).filter(User.email.in_([test_email])).delete(synchronize_session=False)
      db.commit()
    finally:
      db.close()


# test auth endpoint signup/professional for new user and exisiting user registration
def test_exisiting_professional_signup(client):
  response = client.post(
    "auth/signup/professional",
    json={
      "email":"senja.mulari@gmail.com", 
      "password":"123456", 
      "full_name":"senja mulari"
    }
  )
  assert response.status_code == 400
  assert response.json() == {
    "detail": "Email is already registered"
  }


def test_new_professional_signup(client):
  response = client.post(
    "auth/signup/professional",
    json={
      "email":test_email, 
      "password":test_pwd, 
      "full_name":test_name
    }
  )
  assert response.status_code == 200
  json = response.json()
  assert json["access_token"] is not None
  assert json["token_type"] == "bearer"
  assert json["user"]["email"] == test_email
  assert json["user"]["full_name"] == test_name
  assert "password" not in json


