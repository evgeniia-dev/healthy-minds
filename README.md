## Overview
Healthy Minds is a mental health monitoring platform that allows patients to track daily wellbeing indicators and enables healthcare professionals to monitor trends and record treatment notes. The system visualizes behavioral patterns such as mood, sleep, stress, and exercise, and compares them with Finnish population-level health indicators.

The platform is designed as a proof-of-concept health technology system demonstrating how behavioral data and public health statistics can support mental wellbeing monitoring.

- [System Architecture](/docs/ARCHITECTURE.md)

## Project Links

- Live Demo: [Healthy Minds](https://prakgov.github.io/healthy-minds/)
- API Documentation: [Swagger UI](https://healthy-minds-backend.onrender.com/docs) | [ReDoc](https://healthy-minds-backend.onrender.com/redoc)
- Team behind Healthy Minds: [Evgeniia, Musa, Luisa, Aziz, Edwin and Myself](https://www.linkedin.com/feed/update/urn:li:activity:7470731738856513536/)

## Features

- Patient
	-	Daily wellbeing check-in
	-	Mood tracking calendar
	-	Behavioral trend charts
	-	Correlation matrix between lifestyle factors
	-	Risk indicator based on behavioral signals
	-	Population comparison using Finnish public health data

- Healthcare Professional
	-	Professional dashboard
	-	Patient management
	-	Treatment note recording
	-	Mood and behavioral trend visualization
	-	Population-level mental health indicators for contextual comparison

## Population Data

- The platform integrates public indicators from:

- Sotkanet Statistics and Indicator Bank
Finnish Institute for Health and Welfare (THL)

- Indicators currently used:
	-	Severe mental strain (%)
	-	Anxiety or insomnia (%)
	-	Psychiatric outpatient visits per 1000

- These indicators are used only as contextual population references, not for diagnosis.


## Tech Stack

* **Frontend:**
	* React
	* Vite
	* TypeScript
	* Tailwind CSS
	* Recharts

* **Backend:**
	* FastAPI
	* SQLAlchemy	
	* Pydantic
	* JWT Authentication

* **Database**
	* PostgreSQL

* **Hosting**
	* Render

## Authentication:

The system uses JWT-based authentication. Protected API routes require a valid Bearer token issued during login.

**User roles:**
* patient
* professional

**Role-based access control ensures:**
* patients cannot access professional dashboards
* professionals cannot access patients outside their assigned list


## Database Structure
- Main database entities:
	* users
	* mood_entries
	* treatment_notes
	* patient_professional_links
	* finnish_health_cache

- [Enhanced Entity Relationship diagram](/docs/ENTITY_RELATIONSHIP.md)

## Local Development Setup:

1. Clone the repository and open the project root.

2. Configure environment variables:
	- Frontend: no `.env` file is needed locally (the API URL defaults to http://127.0.0.1:8000). Set `VITE_API_URL` in `frontend/.env` only to point at a different backend.
	- Backend: copy `backend/.env.example` to `backend/.env`

3. Start the backend (FastAPI):

	```bash
	cd backend
	python -m venv .venv
	```

- Activate the virtual environment:
	- Windows (PowerShell): `.venv\Scripts\Activate.ps1`
	- macOS/Linux: `source .venv/bin/activate`

	```bash
	pip install -r requirements.txt
	uvicorn app.main:app --reload
	```
- Local development URLs:
	- Backend API: http://127.0.0.1:8000
	- Swagger UI: http://127.0.0.1:8000/docs

4. Start the frontend (Vite + React):

	```bash
	cd frontend
	npm install
	npm run dev
	```

	- Frontend app: http://localhost:8090

5. (Optional) Run tests:

	```bash
	# Backend tests
	cd backend
	pytest

	# Frontend tests
	cd frontend
	npm test
	```


---

# DISCLAIMER

*Healthy Minds is a prototype research project created for educational purposes.* 

---
