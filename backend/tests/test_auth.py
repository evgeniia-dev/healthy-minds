# setup test data
test_email = "test.user@example.com"
test_pwd = "testuser123"
test_name = "test user 1"
update_test_name = "Master Shifu"


# test auth endpoint signup/professional for new user and exisiting user registration
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


def test_exisiting_professional_signup(client):
  response = client.post(
    "auth/signup/professional",
    json={
      "email":test_email, 
      "password":test_pwd, 
      "full_name":test_name
    }
  )
  assert response.status_code == 400
  assert response.json() == {
    "detail": "Email is already registered"
  }


def test_current_user_info(client):
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

# get current user information
  response = client.get(
    "auth/me",
    headers={ "Authorization":f"Bearer {token}" }
  )
  assert response.status_code == 200
  json = response.json()
  assert json["email"] == test_email
  assert json["full_name"] == test_name

# update current user information
  response = client.patch(
    "auth/me",
    headers={ "Authorization":f"Bearer {token}"},
    json={"full_name": update_test_name}
  )
  assert response.status_code == 200
  json = response.json()
  assert json["email"] == test_email
  assert json["full_name"] == update_test_name
