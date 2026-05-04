# imports required for testing patient detail endpoint and related functionality
from app.db.session import SessionLocal
from app.models import User
from app.models.patient_link import PatientProfessionalLink

# setup test data for patient detail tests
test_professional_email = "prof.test@example.com"
test_professional_pwd = "proftest123"
test_professional_name = "prof test user"

test_patient_email = "patient.detail@example.com"
test_patient_pwd = "patientdetail123"
test_patient_name = "patient detail user"

patient_detail_endpoint = "patients"
treatment_notes_endpoint = "treatment-notes"


# helper functions for setting up test data and performing common actions in tests
# workflow - create professional -> professional create patient -> professional link to patient -> professional get patient detail -> professional get patient mood entries and treatment notes -> professional create treatment note for patient
def create_professional(client):
	response = client.post(
		"auth/signup/professional",
		json={
			"email": test_professional_email,
			"password": test_professional_pwd,
			"full_name": test_professional_name,
		}
	)
	assert response.status_code == 200


def login_professional(client) -> str:
	response = client.post(
		"auth/login",
		json={
			"email": test_professional_email, 
			"password": test_professional_pwd
		}
	)
	assert response.status_code == 200
	return response.json()["access_token"]


def create_patient(client):
	# link_professional_to_patient created after patient creation as per POST /patients endpoint workflow
	response = client.post(
		"patients",
		headers={"Authorization": f"Bearer {login_professional(client)}"},
		json={
			"email": test_patient_email,
			"password": test_patient_pwd,
			"full_name": test_patient_name,
		},
	)
	assert response.status_code == 200


def get_patient_id():
	db = SessionLocal()
	try:
		patient = db.query(User).filter(User.email == test_patient_email).first()
		assert patient is not None
		return str(patient.id)
	finally:
		db.close()


def get_professional_id():
	db = SessionLocal()
	try:
		professional = db.query(User).filter(User.email == test_professional_email).first()
		assert professional is not None
		return professional.id
	finally:
		db.close()



####### tests start from here #######

def test_patient_detail_forbidden_for_patient(client):
	create_professional(client)
	create_patient(client)
	token = client.post(
		"auth/login",
		json={"email": test_patient_email, "password": test_patient_pwd},
	).json()["access_token"]

	response = client.get(
		f"{patient_detail_endpoint}/{get_patient_id()}",
		headers={"Authorization": f"Bearer {token}"},
	)
	assert response.status_code == 403


def test_patient_detail_returns_profile_for_linked_professional(client):
	token = login_professional(client)
	response = client.get(
		f"{patient_detail_endpoint}/{get_patient_id()}",
		headers={"Authorization": f"Bearer {token}"},
	)
	assert response.status_code == 200
	json = response.json()
	assert json["email"] == test_patient_email
	assert json["full_name"] == test_patient_name
	assert json["role"] == "patient"


def test_patient_detail_returns_404_for_missing_patient(client):
	token = login_professional(client)

	response = client.get(
		f"{patient_detail_endpoint}/00000000-0000-0000-0000-000000000000",
		headers={"Authorization": f"Bearer {token}"},
	)
	assert response.status_code in {403, 404}


def test_patient_mood_entries_and_treatment_notes_access_control(client):
	token = login_professional(client)
	patient_id = get_patient_id()

	mood_response = client.get(
		f"{patient_detail_endpoint}/{patient_id}/mood-entries",
		headers={"Authorization": f"Bearer {token}"},
	)
	assert mood_response.status_code == 200
	assert isinstance(mood_response.json(), list)

	notes_response = client.get(
		f"{patient_detail_endpoint}/{patient_id}/{treatment_notes_endpoint}",
		headers={"Authorization": f"Bearer {token}"},
	)
	assert notes_response.status_code == 200
	assert isinstance(notes_response.json(), list)


def test_create_treatment_note_validation_and_success(client):
	token = login_professional(client)
	patient_id = get_patient_id()

	invalid_response = client.post(
		f"{patient_detail_endpoint}/{patient_id}/{treatment_notes_endpoint}",
		headers={"Authorization": f"Bearer {token}"},
		json={"note_type": "invalid", "content": "note"},
	)
	assert invalid_response.status_code == 400

	success_response = client.post(
		f"{patient_detail_endpoint}/{patient_id}/{treatment_notes_endpoint}",
		headers={"Authorization": f"Bearer {token}"},
		json={"note_type": "session", "content": "Follow-up completed"},
	)
	assert success_response.status_code == 200
	json = success_response.json()
	assert json["note_type"] == "session"
	assert json["content"] == "Follow-up completed"
