import pytest
from fastapi.testclient import TestClient
from app.db.session import SessionLocal
from app.models import User
from app.main import app

# setup test user
test_email = "test.user@example.com"
test_pwd = "testuser123"
test_name = "test user 1"
update_test_name = "Master Shifu"

# teardown test inputs committed to production database
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


def test_valid_login(client):
  response = client.post(
    "auth/login",
    json= {
      "email": test_email,
      "password": test_pwd
    }
  )
  assert response.status_code == 200
  json = response.json()
  token = json["access_token"]
  assert token is not None
  assert json["token_type"] == "bearer"
  assert json["user"]["email"] == test_email
  assert json["user"]["role"] == "professional"
  return token

def test_get_valid_user_info(client):
  token = test_valid_login(client)
  response = client.get(
    "auth/me",
    headers={ "Authorization":f"Bearer {token}" }
  )
  assert response.status_code == 200
  json = response.json()
  assert json["email"] == test_email
  assert json["full_name"] == test_name

def test_update_valid_user_info(client):
  token = test_valid_login(client)
  response = client.patch(
    "auth/me",
    headers={ "Authorization":f"Bearer {token}"},
    json={"full_name": update_test_name}
  )
  assert response.status_code == 200
  json = response.json()
  assert json["email"] == test_email
  assert json["full_name"] == update_test_name
