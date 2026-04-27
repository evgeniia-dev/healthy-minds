## Overview
Healthy Minds is a mental health monitoring platform that allows patients to track daily wellbeing indicators and enables healthcare professionals to monitor trends and record treatment notes. The system visualizes behavioral patterns such as mood, sleep, stress, and exercise, and compares them with Finnish population-level health indicators.

The platform is designed as a proof-of-concept health technology system demonstrating how behavioral data and public health statistics can support mental wellbeing monitoring.

## Live Demo 

- Frontend: https://healthy-minds-1.onrender.com

- Backend API: https://healthy-minds-au98.onrender.com/docs


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
- Frontend - React, Vite, TypeScript, Tailwind
- Backend - FastAPI, SQLAlchemy
- Database - PostgreSQL
- Charts - Recharts
- Hosting - Render


## Future Improvements
-	email verification
-	password reset flow
-	patient invitation system
-	improved risk prediction model
-	advanced analytics
-	mobile UI improvements
-	better visualization of behavioral correlations

---

# DISCLAIMER

*Healthy Minds is a prototype research project created for educational purposes.* 

---