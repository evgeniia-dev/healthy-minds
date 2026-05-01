from datetime import date, timedelta

# setup test data
test_professional_email = "prof.test@example.com"
test_professional_pwd = "proftest123"
test_professional_name = "prof test user"

test_patient_emails =["patient.test@example.com", "patient2.test@example.com", "patient3.test@example.com"]
test_patient_pwds = ["patienttest123", "patient2test123", "patient3test123"]
test_patient_names = ["patient test user", "patient2 test user", "patient3 test user"]

test_payload = {
  "mood_score": 7, 
  "sleep_hours": 6.5, 
  "stress_level": 2, 
  "exercise_minutes": 30, 
  "notes": "Had a good day"
}

signup_patient_endpoint = "patients"
signup_professional_endpoint = "auth/signup/professional"
login_endpoint = "auth/login"
moodentry_endpoint = "mood-entries/me"


# helper functions to create test data
# workflow - create professional -> professional create patient -> patient create mood entry -> patient update mood entry -> patient get mood entries list 
def create_professional(client):
    response = client.post(
      signup_professional_endpoint,
      json={
        "email": test_professional_email,
        "password": test_professional_pwd, 
        "full_name": test_professional_name
      }
    )
    assert response.status_code == 200

def login_professional(client)-> str:
    response = client.post(
      login_endpoint,
      json={
        "email": test_professional_email,
        "password": test_professional_pwd
      }
    ) 
    assert response.status_code == 200
    return response.json()["access_token"]

def create_patient(client, email, password, full_name):
    response = client.post(
      signup_patient_endpoint,
      headers={"Authorization": f"Bearer {login_professional(client)}"},
      json={
        "email": email, 
        "password": password, 
        "full_name": full_name
      }
    )
    assert response.status_code == 200

def login_patient(client, email, password)-> str:
    response = client.post(
      login_endpoint,
      json={
        "email": email,
        "password": password
      },
    )
    assert response.status_code == 200
    return response.json()["access_token"]


############# tests start from here #############

def test_upsert_forbidden_user_raises(client):
  # register professional and attempt to create a mood entry (should be forbidden)
  create_professional(client)
  token = login_professional(client)

  payload = {"mood_score": 5}
  response = client.post(
    moodentry_endpoint, 
    headers={"Authorization": f"Bearer {token}"},
    json=payload
  )
  assert response.status_code == 403


def test_upsert_creates_new_entry(client):
  # professional create patient and patient logs in
  create_patient(client, test_patient_emails[0], test_patient_pwds[0], test_patient_names[0])
  token = login_patient(client, test_patient_emails[0], test_patient_pwds[0])

  response = client.post(
    moodentry_endpoint, 
    headers={"Authorization": f"Bearer {token}"}, 
    json=test_payload
  )
  assert response.status_code == 200
  json = response.json()
  assert json["mood_score"] == 7
  assert json["sleep_hours"] == 6.5
  assert json["stress_level"] == 2
  assert json["exercise_minutes"] == 30
  assert json["notes"] == "Had a good day"


def test_upsert_updates_existing_entry(client):
  # professional registers patient and patient logs in
  create_patient(client, test_patient_emails[1], test_patient_pwds[1], test_patient_names[1])
  token = login_patient(client, test_patient_emails[1], test_patient_pwds[1])

  test_entry = {
    "mood_score": 5, 
    "sleep_hours": 6.0
  }
  r1 = client.post(
    moodentry_endpoint, 
    headers={"Authorization": f"Bearer {token}"}, 
    json=test_entry
  )
  assert r1.status_code == 200

  update_entry = {
    "mood_score": 8, 
    "sleep_hours": 7.0, 
    "notes": "Much better"
  }
  r2 = client.post(
    moodentry_endpoint, 
    headers={"Authorization": f"Bearer {token}"}, 
    json=update_entry
  )
  assert r2.status_code == 200
  json = r2.json()
  assert json["mood_score"] == 8
  assert json["sleep_hours"] == 7.0
  assert json["stress_level"] is None
  assert json["notes"] == "Much better"


def test_get_my_mood_entries_returns_sorted_list(client):
  # professional registers patient and patient logs in
  create_patient(client, test_patient_emails[2], test_patient_pwds[2], test_patient_names[2])
  token = login_patient(client, test_patient_emails[2], test_patient_pwds[2])

  yesterday = (date.today() - timedelta(days=1)).isoformat()
  today = date.today().isoformat()

  e1 = {"mood_score": 5, "entry_date": yesterday, "created_at": yesterday}
  e2 = {"mood_score": 7, "entry_date": today, "created_at": today}

  r1 = client.post(
    moodentry_endpoint, 
    headers={"Authorization": f"Bearer {token}"}, 
    json=e1
  )
  assert r1.status_code == 200
  
  r2 = client.post(
    moodentry_endpoint, 
    headers={"Authorization": f"Bearer {token}"}, 
    json=e2
  )
  assert r2.status_code == 200

  r3 = client.get(
    moodentry_endpoint,
    headers={"Authorization": f"Bearer {token}"}
  )
  assert r3.status_code == 200
  results = r3.json()
  assert isinstance(results, list)
  assert len(results) == 2
  # dates should be ISO strings and sorted asc
  assert results[0]["entry_date"] < results[1]["entry_date"]
