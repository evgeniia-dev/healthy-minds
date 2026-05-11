## Overview
The system is built to authorize users by using Role-Based Access Control. Hence, the functionalities are specific to the role of the user - Healthcare Professional or Patient.


## Healthcare Professional Interaction with the System
```mermaid
sequenceDiagram
	autonumber
	actor User
  participant ProfessionalUI
	participant AuthService
	participant PatientsService
	participant PatientDetailService

	User->>ProfessionalUI: Open / authenticate
	AuthService-->>ProfessionalUI: access token(JWT) / user profile / role
  AuthService-->>ProfessionalUI: Render professional dashboard

  User->>ProfessionalUI: View dashboards and patient lists
  ProfessionalUI->>PatientsService: Load patients and summary data (ProfessionalDashboard.tsx, Patients.tsx)
  PatientsService-->>ProfessionalUI: Patient list / dashboard payload

  User->>ProfessionalUI: Open patient details
  ProfessionalUI->>PatientDetailService: Fetch patient detail (PatientDetail.tsx)
  PatientDetailService-->>ProfessionalUI: Patient record / timeline data

  User->>ProfessionalUI: View population analytics
  ProfessionalUI->>PatientsService: Request aggregated population data (PopulationData.tsx)
  PatientsService-->>ProfessionalUI: Aggregated metrics

  User->>ProfessionalUI: Update account settings
  ProfessionalUI-->>AuthService: Settings update request
	AuthService-->>ProfessionalUI: Settings confirmation
```


## Patient Interaction with the System

```mermaid
sequenceDiagram
	autonumber
	actor User
	participant PatientUI
  participant AuthService
	participant MoodMonitorService
	participant PatientDetailService

	User->>PatientUI: Open / authenticate
  AuthService-->>PatientUI: access token (JWT) / user profile / role
 	AuthService-->>PatientUI: Render patient dashboard

	User->>PatientUI: Access personal dashboard
	PatientUI->>MoodMonitorService: Fetch mood check-in history (Checkin.tsx)
	MoodMonitorService-->>PatientUI: Check-in records / mood data

	PatientUI->>PatientDetailService: Fetch personal health data (PatientDetail.tsx)
	PatientDetailService-->>PatientUI: Personal health record / timeline

	User->>PatientUI: Submit mood check-in
	PatientUI->>MoodMonitorService: Create new check-in entry
	MoodMonitorService-->>PatientUI: Check-in confirmation

	User->>PatientUI: View mood trends
	PatientUI->>MoodMonitorService: Request trend analysis (Trends.tsx)
	MoodMonitorService-->>PatientUI: Trend metrics / historical data

	User->>PatientUI: View personal health timeline
	PatientUI->>PatientDetailService: Fetch timeline events
	PatientDetailService-->>PatientUI: Timeline entries / health events

	User->>PatientUI: Update account settings
  PatientUI-->>AuthService: Settings update request
	AuthService-->>PatientUI: Settings confirmation
```