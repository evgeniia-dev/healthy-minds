# setup test data
test_professional_email = "prof.test@example.com"
test_professional_pwd = "proftest123"
test_professional_name = "prof test user"

test_patient_email = "patient.test@example.com"
test_patient_pwd = "patienttest123"
test_patient_name = "patient test user"


# @pytest.fixture(scope="module")
# def client():
#   with TestClient(app) as test_client:
#     yield test_client
#     db = SessionLocal()
#     try:
#       db.query(PatientProfessionalLink).filter(
#         PatientProfessionalLink.professional_id.in_(
#           db.query(User).filter(User.email.in_([test_professional_email])).with_entities(User.id)
#         )
#       ).delete(synchronize_session=False)
#       db.query(User).filter(User.email.in_([test_professional_email, test_patient_email])).delete(synchronize_session=False)
#       db.commit()
#     finally:
#       db.close()


def test_create_patient_as_professional(client):
  # register as professional
  response = client.post(
    "auth/signup/professional",
    json={
      "email": test_professional_email,
      "password": test_professional_pwd,
      "full_name": test_professional_name
    }
  )
  assert response.status_code == 200
  
  # login as professional
  response = client.post(
    "auth/login",
    json={
      "email": test_professional_email,
      "password": test_professional_pwd
    }
  )
  assert response.status_code == 200
  token = response.json()["access_token"]

  # create patient
  response = client.post(
    "patients",
    headers={"Authorization": f"Bearer {token}"},
    json={
      "email": test_patient_email,
      "password": test_patient_pwd,
      "full_name": test_patient_name
    }
  )
  assert response.status_code == 200
  json = response.json()
  assert json["email"] == test_patient_email
  assert json["full_name"] == test_patient_name
  assert "password" not in json
  assert json["id"] is not None
  assert json["created_at"] is not None


def test_create_patient_duplicate_email(client):
  # login as professional
  response = client.post(
    "auth/login",
    json={
      "email": test_professional_email,
      "password": test_professional_pwd
    }
  )
  
  token = response.json()["access_token"]
  
  # create patient with existing email
  response = client.post(
    "patients",
    headers={"Authorization": f"Bearer {token}"},
    json={
      "email": test_patient_email,
      "password": test_patient_pwd,
      "full_name": test_patient_name
    }
  )
  
  assert response.status_code == 400
  assert response.json() == {
    "detail": "Email is already registered"
  }


def test_get_patients_as_professional(client):
  # login as professional
  response = client.post(
    "auth/login",
    json={
      "email": test_professional_email,
      "password": test_professional_pwd
    }
  )
  
  token = response.json()["access_token"]
  
  # get patients list
  response = client.get(
    "patients",
    headers={"Authorization": f"Bearer {token}"}
  )
  
  assert response.status_code == 200
  json = response.json()
  assert isinstance(json, list)
  assert len(json) > 0
  
  patient = json[0]
  assert patient["email"] == test_patient_email
  assert patient["full_name"] == test_patient_name
  assert patient["id"] is not None
  assert patient["created_at"] is not None


def test_get_patients_as_patient_forbidden(client):
  # login as patient
  response = client.post(
    "auth/login",
    json={
      "email": test_patient_email,
      "password": test_patient_pwd
    }
  )
  
  token = response.json()["access_token"]
  
  # get patients list as patient
  response = client.get(
    "patients",
    headers={"Authorization": f"Bearer {token}"}
  )
  
  assert response.status_code == 403
  assert response.json() == {
    "detail": "Only professionals can view patients"
  }


def test_create_patient_as_patient_forbidden(client):
  # login as patient
  response = client.post(
    "auth/login",
    json={
      "email": test_patient_email,
      "password": test_patient_pwd
    }
  )
  
  token = response.json()["access_token"]
  
  # create patient as patient
  response = client.post(
    "patients",
    headers={"Authorization": f"Bearer {token}"},
    json={
      "email": "another.patient@example.com",
      "password": "anotherpatient123",
      "full_name": "another patient"
    }
  )
  
  assert response.status_code == 403
  assert response.json() == {
    "detail": "Only professionals can create patients"
  }
