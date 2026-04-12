Healthy Minds is a mental health monitoring platform that allows patients to track daily wellbeing indicators and enables healthcare professionals to monitor trends and record treatment notes. The system visualizes behavioral patterns such as mood, sleep, stress, and exercise, and compares them with Finnish population-level health indicators.

The platform is designed as a proof-of-concept health technology system demonstrating how behavioral data and public health statistics can support mental wellbeing monitoring.

System Overview

The system consists of three main components:

Frontend
	•	React + Vite
	•	TypeScript
	•	Data visualization (charts, calendar, correlation matrix)

Backend
	•	FastAPI (Python)
	•	REST API
	•	JWT authentication

Database
	•	PostgreSQL
	•	Relational schema for users, mood entries, patient–professional links, and treatment notes

The platform integrates Finnish public health data through the Sotkanet open data API to provide contextual population-level indicators.

Current Functionality

Authentication
	•	Professional signup
	•	Professional login
	•	Patient accounts created by professionals
	•	JWT-based authentication

Patient Features
	•	Daily mental health check-in
	•	Mood tracking (1–10 scale)
	•	Sleep tracking
	•	Stress level tracking
	•	Exercise tracking
	•	Optional notes

Patient Dashboard
	•	Mood calendar visualization
	•	Trend charts for mood, sleep, stress, and exercise
	•	Correlation matrix between behavioral factors
	•	Risk indicator comparing personal trends with population data

Professional Features
	•	Professional dashboard
	•	Patient list
	•	Patient detail view
	•	Access to patient mood history
	•	Treatment note system

Data Integration
	•	Finnish population health indicators from Sotkanet
	•	Used to provide contextual mental health insights

⸻

What Is Still Incomplete

These features are planned but not yet implemented:

Authentication Improvements
	•	Email confirmation during signup
	•	Password reset
	•	Email invitations for patients

Platform Features
	•	Real-time alerts for risk patterns
	•	Automatic patient risk scoring
	•	Improved professional dashboard statistics
	•	Treatment note visibility for patients (optional design decision)

Data / Analytics Improvements
	•	More advanced correlation analysis
	•	Risk prediction model using population-level data
	•	Additional behavioral indicators

Deployment (Planned)

To make the system publicly accessible the following deployment architecture is planned:

Frontend
	•	GitHub Pages or Vercel

Backend
	•	Render / Railway FastAPI service

Database
	•	Managed PostgreSQL (Render, Supabase, or Neon)

Project Purpose

This project was developed as a software engineering course project demonstrating:
	•	Full-stack system architecture
	•	REST API design
	•	Database modeling
	•	Health data visualization
	•	Integration of public health datasets

The goal is to explore how behavioral self-tracking combined with population health data can support mental wellbeing monitoring.
