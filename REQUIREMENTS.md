# Healthy Minds – Software Requirements Specification

> **Version:** 2.0 | **Date:** 2026-05-02 | **Owner:** Healthy Elephants
>
> This document summarises the Functional Requirements (FR), Non-Functional Requirements (NFR), and a Glossary of key technical terms for the Healthy Minds mental health monitoring platform, based on the Software Engineering I project template.

---

## Table of Contents

1. [Functional Requirements](#functional-requirements)
2. [Non-Functional Requirements](#non-functional-requirements)
3. [Glossary](#glossary)

---

## Functional Requirements

Functional requirements describe **what** the system must do — the specific behaviours, functions, and interactions it must support.

Each requirement uses MoSCoW prioritisation:

| Priority | Meaning |
|----------|---------|
| **Must** | Non-negotiable; the system will not be accepted without it |
| **Should** | Important, but not vital for initial release |
| **Could** | Nice-to-have if time and resources allow |
| **Won't** | Explicitly out of scope for the current version |

---

### FR-001 — Healthcare Professional Sign-Up & Log-In

| Field | Detail |
|-------|--------|
| **Feature / Module** | Landing page / front page connecting to service page |
| **User Role** | Healthcare Professional |
| **Requirement** | The system shall allow a healthcare professional to "Sign Up" for the first time and to "Log In" from then onward. |
| **Priority** | **Must** |
| **Stakeholder** | Website design / Team Members / Healthcare professionals |
| **Rationale** | Ensures every healthcare professional has access to the website's resources by signing up, including having access to a patient's data and adding new patients. |
| **Acceptance Criteria** | Given the main website is accessed, when a healthcare professional selects "Sign Up" and completes the registration form, then an account is created and the professional is redirected to the professional dashboard. |
| **Fit Criterion / Measure** | Manual test: create a healthcare professional account to verify the sign-up process is working. |
| **Dependencies** | Connection to the SQL database where every new user's data is stored. |
| **Status** | ✅ Implemented |
| **Version** | 1.0 |

---

### FR-002 — Patient Log-In

| Field | Detail |
|-------|--------|
| **Feature / Module** | Landing page / front page connecting to service page |
| **User Role** | Patient |
| **Requirement** | The system shall allow a patient to "Log In" from the first time onward. |
| **Priority** | **Must** |
| **Stakeholder** | Website design / Team Members / Patients |
| **Rationale** | Ensures every registered patient has access to the website's resources by logging in. |
| **Acceptance Criteria** | Given the main website is accessed, when a registered patient enters valid credentials and selects "Log In", then the patient is authenticated and redirected to the patient dashboard. |
| **Fit Criterion / Measure** | Manual test: log in as a patient to verify the website is working. |
| **Dependencies** | FR-001 |
| **Status** | ✅ Implemented |
| **Version** | 1.0 |

---

### FR-003 — Password Reset

| Field | Detail |
|-------|--------|
| **Feature / Module** | Landing page / front page connecting to service page |
| **User Role** | Healthcare Professional / Patient |
| **Requirement** | The system shall allow a user to "Reset" his/her "Password". |
| **Priority** | **Should** |
| **Stakeholder** | Website design / Team Members / Users |
| **Rationale** | Ensures every registered user can reset his/her password. |
| **Acceptance Criteria** | Given the main website is accessed, when a user selects "Forgot Password?", then the system generates new credentials and sends them via an automatic email to the corresponding user. |
| **Fit Criterion / Measure** | Manual test: click on "Forgot Password?" to verify that the system generates new credentials and sends them via an automatic email to the corresponding user. |
| **Dependencies** | FR-001 |
| **Status** | 🔜 Deferred |
| **Version** | 2.0 |

---

### FR-004 — Healthcare Professional Dashboard

| Field | Detail |
|-------|--------|
| **Feature / Module** | Healthcare Professional Dashboard |
| **User Role** | Healthcare Professional |
| **Requirement** | The system shall have a "Healthcare Professional Dashboard", which must allow a healthcare professional to add new patients and to have an overview of his/her assigned patients and their treatments. |
| **Priority** | **Must** |
| **Stakeholder** | Website design / Team Members / Healthcare Professionals |
| **Rationale** | Ensures every registered healthcare professional can view the number of "Active Patients" under his/her care and their related "Treatment Notes", as well as to have a "View of Population Data" (Finnish mental health indicators from Sotkanet) and "Alerts". |
| **Acceptance Criteria** | Given the Healthcare Professional Dashboard is accessed, when the professional selects "Patients", then a list of all assigned patients is displayed with the ability to add a new patient. |
| **Fit Criterion / Measure** | Manual test: click on "Patients" to verify the list of added patients is displayed. |
| **Dependencies** | FR-002 |
| **Status** | ✅ Implemented |
| **Version** | 1.0 |

---

### FR-005 — Patient Dashboard & Daily Check-In

| Field | Detail |
|-------|--------|
| **Feature / Module** | Patient Dashboard |
| **User Role** | Patient |
| **Requirement** | The system shall have a "Patient Dashboard", which must allow the patient to input his/her "Daily Check-In" in answer to the question "How are you feeling today?" embedded in the dashboard. |
| **Priority** | **Must** |
| **Stakeholder** | Website design / Team Members / Patients |
| **Rationale** | Ensures every registered patient can input his/her mood, stress level, sleep time, exercise time, and free notes about his/her day. |
| **Acceptance Criteria** | Given the website's dashboard is accessed, when the patient fills in the daily check-in form (mood, stress level, sleep time, exercise time, free notes) and submits, then the data is saved to the database and visualised on the dashboard. |
| **Fit Criterion / Measure** | Manual test: daily log in as patient to input mood, stress level, sleep time, exercise time, and free notes to see if the system saves the data. |
| **Dependencies** | FR-002 |
| **Status** | ✅ Implemented |
| **Version** | 1.0 |

---

### FR-006 — Email Verification for Accounts

| Field | Detail |
|-------|--------|
| **Feature / Module** | Email verification for accounts |
| **User Role** | User (both healthcare professionals and patients) |
| **Requirement** | The system shall have a verification procedure to ascertain the email input by a user is valid. |
| **Priority** | **Should** |
| **Stakeholder** | Website design / Team Members / Users |
| **Rationale** | To ensure that every user provides a valid email address, verifying that it belongs to a real person and not a bot. |
| **Acceptance Criteria** | Given that a healthcare professional signs up or a new patient is added, when registration is completed, then an automatic email is generated requesting verification of the email account before access is granted. |
| **Fit Criterion / Measure** | Manual test: log in as a new user to verify an automatic email is generated requesting verification of the email account. |
| **Dependencies** | FR-001, FR-002 |
| **Status** | 🔜 Deferred |
| **Version** | 2.0 |

---

### FR-007 — Patient Invitation System

| Field | Detail |
|-------|--------|
| **Feature / Module** | Patient invitation system |
| **User Role** | Patient |
| **Requirement** | The system shall send automatic email invitations to new patients added by registered healthcare professionals. |
| **Priority** | **Should** |
| **Stakeholder** | Website design / Team Members / Patients |
| **Rationale** | To make sure every registered patient receives the necessary information to start using the system once a healthcare professional has added him/her into the database. |
| **Acceptance Criteria** | Given that a healthcare professional has added a new patient, when the patient's details are saved, then an email invitation is automatically sent to the patient with login instructions. |
| **Fit Criterion / Measure** | Manual test: add a new patient and verify that he/she receives an invitation to log in into the system after his/her email has been verified. |
| **Dependencies** | FR-001 |
| **Status** | 🔜 Deferred |
| **Version** | 2.0 |

---

### FR-008 — Severe Distress Alert

| Field | Detail |
|-------|--------|
| **Feature / Module** | Severe Distress Alert |
| **User Role** | Patient |
| **Requirement** | The system shall send an instant automatic alert to the assigned healthcare professional if the patient's average trends suggest severe distress mood to prevent any escalation. |
| **Priority** | **Should** |
| **Stakeholder** | Website design / Team Members / Patients |
| **Rationale** | To make sure the patient receives help as soon as possible when an alert is generated by the system. |
| **Acceptance Criteria** | Given that the average trends of a patient's mental wellbeing suggest severe distress, when the threshold is crossed, then an automatic alert is generated and sent to the corresponding healthcare professional. |
| **Fit Criterion / Measure** | Manual test: input high stress data so as to trigger an alert to verify that the system will generate and send the corresponding automatic alert to the corresponding healthcare professional. |
| **Dependencies** | FR-005 |
| **Status** | 🔜 Deferred |
| **Version** | 2.0 |

---

### FR-009 — Patient Data Export (CSV / PDF)

| Field | Detail |
|-------|--------|
| **Feature / Module** | Patient Data Export (CSV/PDF) |
| **User Role** | Patient |
| **Requirement** | The system shall allow export of a patient's data. |
| **Priority** | **Could** |
| **Stakeholder** | Website design / Team Members / Patients |
| **Rationale** | To make sure the patient can provide his/her data to another healthcare provider, as needed. |
| **Acceptance Criteria** | Given the need of the patient to export his/her data for personal reasons, when the patient selects "Export Data", then a downloadable CSV or PDF file containing the patient's records is generated. |
| **Fit Criterion / Measure** | Manual test: add a "Request data to export" button on the Patient Dashboard and verify the download is generated correctly. |
| **Dependencies** | Connection to the SQL database where all patient medical data is stored. |
| **Status** | 🔜 Deferred |
| **Version** | 3.0 |

---

### FR-010 — Daily Reminder Notifications

| Field | Detail |
|-------|--------|
| **Feature / Module** | Reminder notifications for daily mood logging |
| **User Role** | Patient |
| **Requirement** | The system shall send automatic daily reminder notifications to registered patients about logging into the website to continue tracking their mental wellbeing. |
| **Priority** | **Could** |
| **Stakeholder** | Website design / Team Members / Patients |
| **Rationale** | To ensure the patient inputs his/her data into the system in a consistent way. |
| **Acceptance Criteria** | Given a new day has passed, when a registered patient has not yet submitted a daily check-in, then a reminder notification is sent to the patient's registered email. |
| **Fit Criterion / Measure** | Manual test: verify there is a reminder in a registered patient's inbox every day. |
| **Dependencies** | Connection to the SQL database where all patient medical data is stored, including an automatic date generator. |
| **Status** | 🔜 Deferred |
| **Version** | 3.0 |

---

### FR-011 — AI Insights

| Field | Detail |
|-------|--------|
| **Feature / Module** | AI Insights |
| **User Role** | Patient |
| **Requirement** | The system shall automatically detect patterns within the patient's inputs by comparison with the available average values from the General Population Data Statistics. |
| **Priority** | **Won't** (current version) |
| **Stakeholder** | Website design / Team Members / Patients |
| **Rationale** | To support healthcare professionals with automatic data analytics based on machine learning, making their job faster, easier and more efficient in the long run. |
| **Acceptance Criteria** | Given the need to summarise the patient's data and compare it to the average Population Data statistics, when sufficient data has been collected, then the system creates an automatic assessment based on up-to-date medical recommendations. |
| **Fit Criterion / Measure** | Manual test: input patient's data and general Population Data Statistics to verify that the system, supported by AI, creates an automatic assessment. |
| **Dependencies** | Connection to the SQL database where all patient medical data is stored. |
| **Status** | 🔜 Deferred |
| **Version** | N/A |

---

### FR-012 — Secure Log-Out & Session Expiry

| Field | Detail |
|-------|--------|
| **Feature / Module** | Logging out |
| **User Role** | Healthcare Professional / Patient |
| **Requirement** | The system shall allow users to securely log out and automatically expire inactive sessions. |
| **Priority** | **Must** |
| **Stakeholder** | Team Members / Users |
| **Rationale** | To ensure account security by preventing unauthorised access from inactive or shared devices. |
| **Acceptance Criteria** | Given a user is logged into the system, when the user selects "Log Out" or the session remains inactive beyond the timeout threshold, then the session is terminated and the user is redirected to the login page. |
| **Fit Criterion / Measure** | Manual test: log in and log out to verify session termination; simulate inactivity and confirm forced logout. |
| **Dependencies** | FR-001, FR-002 |
| **Status** | ✅ Implemented |
| **Version** | 1.0 |

---

### FR-013 — Role-Based Access Control (RBAC)

| Field | Detail |
|-------|--------|
| **Feature / Module** | Role Based Access Control |
| **User Role** | Healthcare Professional / Patient |
| **Requirement** | The system shall restrict access so that patients cannot access professional dashboards and professionals cannot access other professionals' patients. |
| **Priority** | **Must** |
| **Stakeholder** | Team Members / Users |
| **Rationale** | To ensure data privacy and compliance with healthcare data protection standards. |
| **Acceptance Criteria** | Given a patient is logged in, when the patient attempts to access a professional dashboard URL, then the system blocks the access and redirects the user appropriately. |
| **Fit Criterion / Measure** | Manual test: attempt unauthorised access and verify the system blocks it. |
| **Dependencies** | FR-001, FR-004 |
| **Status** | ✅ Implemented |
| **Version** | 1.0 |

---

### FR-014 — Data Validation for Inputs

| Field | Detail |
|-------|--------|
| **Feature / Module** | Data Validation for Inputs |
| **User Role** | Healthcare Professional / Patient |
| **Requirement** | The system shall validate all user inputs before saving them. |
| **Priority** | **Must** |
| **Stakeholder** | Team Members |
| **Rationale** | To prevent invalid or inconsistent data from being stored in the system. |
| **Acceptance Criteria** | Given a user inputs data into any form, when the user submits with invalid values (e.g., empty required fields, out-of-range numbers), then the system displays a validation error and prevents saving. |
| **Fit Criterion / Measure** | Manual test: input invalid values (e.g., empty fields, invalid numbers) and verify validation prevents saving. |
| **Dependencies** | FR-005 |
| **Status** | ✅ Implemented |
| **Version** | 1.0 |

---

### FR-015 — Error Handling & User Feedback

| Field | Detail |
|-------|--------|
| **Feature / Module** | Error Handling & User Feedback |
| **User Role** | Healthcare Professional / Patient |
| **Requirement** | The system shall display clear error messages when operations fail (e.g., network error, invalid login, failed save). |
| **Priority** | **Must** |
| **Stakeholder** | Team Members / Users |
| **Rationale** | To improve usability and help users understand and recover from errors. |
| **Acceptance Criteria** | Given an operation fails (e.g., login, save, data fetch), when the failure occurs, then a clear and descriptive error message is shown to the user. |
| **Fit Criterion / Measure** | Manual test: simulate errors (invalid login, API failure) and verify appropriate messages are shown. |
| **Dependencies** | FR-001, FR-005 |
| **Status** | ✅ Implemented |
| **Version** | 1.0 |

---

### FR-016 — Secure Storage of Credentials

| Field | Detail |
|-------|--------|
| **Feature / Module** | Secure Storage of Credentials |
| **User Role** | System |
| **Requirement** | The system shall securely store user credentials (e.g., hashed passwords). |
| **Priority** | **Must** |
| **Stakeholder** | Team Members |
| **Rationale** | To ensure user authentication data is protected from unauthorised access. |
| **Acceptance Criteria** | Given a user creates an account, when the credentials are stored, then passwords are saved as hashed values and are never stored in plain text. |
| **Fit Criterion / Measure** | Manual/technical verification: inspect backend logic to confirm password hashing is implemented. |
| **Dependencies** | FR-001 |
| **Status** | ✅ Implemented |
| **Version** | 1.0 |

---

### FR-017 — API Communication Between Frontend and Backend

| Field | Detail |
|-------|--------|
| **Feature / Module** | API Communication Between Frontend and Backend |
| **User Role** | System |
| **Requirement** | The system shall communicate with the backend via secure API endpoints. |
| **Priority** | **Must** |
| **Stakeholder** | Team Members |
| **Rationale** | To enable data exchange between frontend and backend components. |
| **Acceptance Criteria** | Given a frontend action requires data (e.g., login, save, fetch), when the action is triggered, then the frontend sends a request to the appropriate API endpoint and receives the correct response. |
| **Fit Criterion / Measure** | Manual test: verify data flows correctly between frontend and backend (e.g., login, patient creation, check-in). |
| **Dependencies** | All core features and functions |
| **Status** | ✅ Implemented |
| **Version** | 1.0 |

---

### FR-018 — Responsive Design

| Field | Detail |
|-------|--------|
| **Feature / Module** | Responsive Design |
| **User Role** | System |
| **Requirement** | The system shall be usable on both desktop and mobile devices. |
| **Priority** | **Should** |
| **Stakeholder** | Team Members / Users |
| **Rationale** | To ensure accessibility across different device types. |
| **Acceptance Criteria** | Given a user accesses the system on a desktop or mobile device, when the page is loaded, then the layout adapts correctly and all core functionality remains usable. |
| **Fit Criterion / Measure** | Manual test: access the system on desktop and mobile and verify usability and layout. |
| **Dependencies** | Frontend implementation |
| **Status** | ✅ Implemented |
| **Version** | 2.0 |

---

### FR-019 — Navigation and Routing

| Field | Detail |
|-------|--------|
| **Feature / Module** | Navigation and Routing |
| **User Role** | System |
| **Requirement** | The system shall provide clear navigation between dashboards, patients, and data views. |
| **Priority** | **Must** |
| **Stakeholder** | Team Members / Users |
| **Rationale** | To ensure users can efficiently move between different parts of the system. |
| **Acceptance Criteria** | Given a user is logged in, when the user selects any navigation link (e.g., Patients, Trends, Population Data), then the correct page is rendered without errors. |
| **Fit Criterion / Measure** | Manual test: navigate through all main pages and verify correct routing and page rendering. |
| **Dependencies** | FR-001, FR-004, FR-005 |
| **Status** | ✅ Implemented |
| **Version** | 1.0 |

---

## Non-Functional Requirements

Non-functional requirements describe **how well** the system performs its functions — constraints on quality attributes such as performance, security, usability, and reliability.

---

### NFR-001 — UI Response Time (Performance)

| Field | Detail |
|-------|--------|
| **Quality Attribute** | Performance |
| **Area** | Frontend / UI |
| **Requirement** | The system shall respond to normal user actions within an acceptable time. |
| **Metric** | UI Response Time |
| **Target / Threshold** | Page interactions respond within 200 ms under normal network conditions. |
| **Measurement Method** | Manual testing using browser developer tools |
| **Priority** | **Should** |
| **Stakeholder** | System |
| **Rationale** | To ensure smooth user experience. |
| **Status** | 🔄 In Progress |
| **Version** | 2.0 |

---

### NFR-002 — Availability (Uptime)

| Field | Detail |
|-------|--------|
| **Quality Attribute** | Availability |
| **Area** | Whole platform / system |
| **Requirement** | The system shall remain accessible during normal usage. |
| **Metric** | Uptime |
| **Target / Threshold** | Available during demo/testing sessions |
| **Measurement Method** | Manual availability checks |
| **Priority** | **Must** |
| **Stakeholder** | Team |
| **Rationale** | Required for project demonstration. |
| **Status** | ✅ Implemented |
| **Version** | 1.0 |

---

### NFR-003 — API Response Latency (Performance)

| Field | Detail |
|-------|--------|
| **Quality Attribute** | Performance |
| **Area** | Backend / API |
| **Requirement** | The system shall return API responses in a timely manner. |
| **Metric** | API Latency |
| **Target / Threshold** | ≤ 1 second |
| **Measurement Method** | Measure via network tab / logs |
| **Priority** | **Should** |
| **Stakeholder** | Team |
| **Rationale** | To prevent slow dashboards and login. |
| **Status** | 🔄 In Progress |
| **Version** | 2.0 |

---

### NFR-004 — Authenticated Access Only (Security)

| Field | Detail |
|-------|--------|
| **Quality Attribute** | Security |
| **Area** | Authentication |
| **Requirement** | The system shall restrict access to authenticated users only. |
| **Metric** | Unauthorised access attempts |
| **Target / Threshold** | 0 successful unauthorised accesses |
| **Measurement Method** | Manual test: access protected routes without login |
| **Priority** | **Must** |
| **Stakeholder** | Users |
| **Rationale** | To protect sensitive data. |
| **Status** | ✅ Implemented |
| **Version** | 1.0 |

---

### NFR-005 — Secure Credential Storage (Security)

| Field | Detail |
|-------|--------|
| **Quality Attribute** | Security |
| **Area** | Credentials |
| **Requirement** | The system shall store user credentials securely. |
| **Metric** | Password storage method |
| **Target / Threshold** | Passwords must be hashed |
| **Measurement Method** | Verify via backend implementation |
| **Priority** | **Must** |
| **Stakeholder** | Team |
| **Rationale** | To prevent credential leakage. |
| **Status** | ✅ Implemented |
| **Version** | 1.0 |

---

### NFR-006 — Role-Based Data Privacy (Privacy)

| Field | Detail |
|-------|--------|
| **Quality Attribute** | Privacy |
| **Area** | Patient Data |
| **Requirement** | The system shall ensure users can only access permitted data. |
| **Metric** | Access violations |
| **Target / Threshold** | 0 unauthorised data exposures |
| **Measurement Method** | Manual role-based testing |
| **Priority** | **Must** |
| **Stakeholder** | Healthcare Professionals / Patients |
| **Rationale** | To protect sensitive health data. |
| **Status** | ✅ Implemented |
| **Version** | 1.0 |

---

### NFR-007 — User Action Feedback (Usability)

| Field | Detail |
|-------|--------|
| **Quality Attribute** | Usability |
| **Area** | Frontend / UI |
| **Requirement** | The system shall provide clear feedback after user actions. |
| **Metric** | Feedback visibility |
| **Target / Threshold** | 100% of key actions show feedback |
| **Measurement Method** | Manual UI testing |
| **Priority** | **Must** |
| **Stakeholder** | Users |
| **Rationale** | To reduce confusion. |
| **Status** | ✅ Implemented |
| **Version** | 1.0 |

---

### NFR-008 — Plain Language Health Data (Usability)

| Field | Detail |
|-------|--------|
| **Quality Attribute** | Usability |
| **Area** | Patient Dashboard |
| **Requirement** | The system shall present health data in understandable language. |
| **Metric** | Text clarity |
| **Target / Threshold** | No technical jargon without explanation |
| **Measurement Method** | Manual review |
| **Priority** | **Must** |
| **Stakeholder** | Users |
| **Rationale** | To avoid misinterpretation. |
| **Status** | ✅ Implemented |
| **Version** | 1.0 |

---

### NFR-009 — Basic Accessibility (Accessibility)

| Field | Detail |
|-------|--------|
| **Quality Attribute** | Accessibility |
| **Area** | Frontend |
| **Requirement** | The system shall support basic accessibility practices. |
| **Metric** | Accessibility issues |
| **Target / Threshold** | No critical accessibility blockers |
| **Measurement Method** | Manual review |
| **Priority** | **Should** |
| **Stakeholder** | Users |
| **Rationale** | To improve inclusivity. |
| **Status** | 🔄 In Progress |
| **Version** | 2.0 |

---

### NFR-010 — Desktop & Mobile Support (Responsiveness / Portability)

| Field | Detail |
|-------|--------|
| **Quality Attribute** | Responsiveness / Portability |
| **Area** | Frontend |
| **Requirement** | The system shall function on both desktop and mobile devices. |
| **Metric** | Layout integrity |
| **Target / Threshold** | No broken layouts on mobile |
| **Measurement Method** | Manual device testing |
| **Priority** | **Must** |
| **Stakeholder** | Users |
| **Rationale** | Patients likely use phones. |
| **Status** | ✅ Implemented |
| **Version** | 1.0 |

---

### NFR-011 — Data Persistence (Reliability)

| Field | Detail |
|-------|--------|
| **Quality Attribute** | Reliability |
| **Area** | Data Handling |
| **Requirement** | The system shall persist user data correctly after submission. |
| **Metric** | Data consistency |
| **Target / Threshold** | 0 lost or duplicated entries |
| **Measurement Method** | Manual save + refresh test |
| **Priority** | **Must** |
| **Stakeholder** | Users |
| **Rationale** | To ensure trust in the system. |
| **Status** | ✅ Implemented |
| **Version** | 1.0 |

---

### NFR-012 — Coding Standards & Linting (Maintainability)

| Field | Detail |
|-------|--------|
| **Quality Attribute** | Maintainability |
| **Area** | Frontend |
| **Requirement** | The system shall follow coding standards and pass linting. |
| **Metric** | Lint errors |
| **Target / Threshold** | 0 errors (warnings acceptable) |
| **Measurement Method** | `npm run lint` |
| **Priority** | **Should** |
| **Stakeholder** | Team |
| **Rationale** | To make maintenance easy. |
| **Status** | 🔄 In Progress |
| **Version** | 2.0 |

---

### NFR-013 — Automated Testing (Testability)

| Field | Detail |
|-------|--------|
| **Quality Attribute** | Testability |
| **Area** | Frontend |
| **Requirement** | The system shall support automated testing. |
| **Metric** | Test execution |
| **Target / Threshold** | Tests run successfully |
| **Measurement Method** | `npm run test` |
| **Priority** | **Should** |
| **Stakeholder** | Team |
| **Rationale** | To enable regression testing. |
| **Status** | 🔄 In Progress |
| **Version** | 2.0 |

---

### NFR-014 — Cross-Browser Compatibility

| Field | Detail |
|-------|--------|
| **Quality Attribute** | Compatibility |
| **Area** | Browser |
| **Requirement** | The system shall work in different browsers. |
| **Metric** | Browser support |
| **Target / Threshold** | Works in Chrome, Safari, and Edge |
| **Measurement Method** | Manual testing |
| **Priority** | **Should** |
| **Stakeholder** | Users |
| **Rationale** | To enable multiple device usage. |
| **Status** | 🔄 In Progress |
| **Version** | 2.0 |

---

### NFR-015 — Deployability / Build Success

| Field | Detail |
|-------|--------|
| **Quality Attribute** | Deployability |
| **Area** | Build system |
| **Requirement** | The system shall build successfully for deployment. |
| **Metric** | Build success |
| **Target / Threshold** | 100% successful builds |
| **Measurement Method** | `npm run build` |
| **Priority** | **Must** |
| **Stakeholder** | Team |
| **Rationale** | Required for deployment. |
| **Status** | ✅ Implemented |
| **Version** | 1.0 |

---

### NFR-016 — Graceful Error Handling

| Field | Detail |
|-------|--------|
| **Quality Attribute** | Error Handling |
| **Area** | API |
| **Requirement** | The system shall handle errors without crashing. |
| **Metric** | Crash rate |
| **Target / Threshold** | 0 crashes on failed requests |
| **Measurement Method** | Manual testing (disconnect network) |
| **Priority** | **Must** |
| **Stakeholder** | Users |
| **Rationale** | To prevent broken user experience (UX). |
| **Status** | ✅ Implemented |
| **Version** | 1.0 |

---

### NFR-017 — Data Accuracy for Trends & Correlations

| Field | Detail |
|-------|--------|
| **Quality Attribute** | Data Accuracy |
| **Area** | Analytics |
| **Requirement** | The system shall correctly compute trends and correlations. |
| **Metric** | Data correctness |
| **Target / Threshold** | Matches stored input data |
| **Measurement Method** | Manual comparison |
| **Priority** | **Must** |
| **Stakeholder** | Users |
| **Rationale** | To build trust in insights. |
| **Status** | ✅ Implemented |
| **Version** | 1.0 |

---

### NFR-018 — Non-Diagnostic Disclaimer (Legal / Ethical)

| Field | Detail |
|-------|--------|
| **Quality Attribute** | Legal / Ethical |
| **Area** | UI |
| **Requirement** | The system shall include a non-diagnostic disclaimer. |
| **Metric** | Disclaimer present and visible |
| **Target / Threshold** | Visible on the dashboard |
| **Measurement Method** | Manual UI checking and testing |
| **Priority** | **Must** |
| **Stakeholder** | Team |
| **Rationale** | To reduce liability. |
| **Status** | ✅ Implemented |
| **Version** | 1.0 |

---

### NFR-019 — Legal & Regulatory Compliance

| Field | Detail |
|-------|--------|
| **Quality Attribute** | Legal / Compliance |
| **Area** | Whole platform / system |
| **Requirement** | The system should comply with all applicable/pertinent legislation, directives, and medical guidelines. |
| **Metric** | Compliance note present and visible |
| **Target / Threshold** | Visible on the dashboard |
| **Measurement Method** | Manual UI checking and testing |
| **Priority** | **Should** |
| **Stakeholder** | Team |
| **Rationale** | To reduce liability, assure law abidance, and build trust in the system. |
| **Status** | 🔜 Deferred |
| **Version** | 2.0 |

---

## Glossary

This glossary explains key technical terms and acronyms used in this document for stakeholders without prior knowledge of computer systems design.

| Term | Definition | Notes |
|------|-----------|-------|
| **Frontend** | The user interface of a website, so that users can interact with its contents (i.e., the "presentation layer" of a website). | Everything related to a website that a user will see or need to see (client-side system). |
| **Backend** | All issues related to data management, server-side logic, and core functionality of a website running "behind the scenes" to ensure smooth communication between the server and client-side web browser. | Everything that a web developer needs to develop for a website to be functional (server-side system). |
| **UI** | User Interface. The point where the interaction between a human and a machine occurs on an application/device. | Source: [Wikipedia – User interface](https://en.wikipedia.org/wiki/User_interface) |
| **API** | Application Programming Interface. A connection between computer systems/programs. Also considered as a set of standard protocols that allow smooth communication among different computer systems to exchange data and ensure good functionality. | Source: [IBM – What is an API?](https://www.ibm.com/think/topics/api) |
| **API latency** | The minimum time data spends in transit between two computers, or between a server and a client's side/web browser. Also known as "transport latency". | Note: transport latency + processing time = response time. |
| **Browser dev tools** | Browser Development Tools. These allow web developers to test, edit and debug the user interface of a website. | Modern web browsers include a built-in suite of developer tools. |
| **Uptime** | A measure of a software application's reliability, denoted as the period of time a computer works and is available without interruption. | Source: [Wikipedia – Uptime](https://en.wikipedia.org/wiki/Uptime) |
| **Network tab / logs** | A feature in a computer's browser developer tools that provides a graphical representation/statistics of network activities in real time to allow analysis for optimal network performance. | Source: [ScienceDirect – Networking tab](https://www.sciencedirect.com/topics/computer-science/networking-tab) |
| **Password hashing** | The encryption of passwords to increase security of a computer system. "Hashing" applies a one-way mathematical function to replace a string of text with another that cannot be decoded without knowing the original. | Source: [CrowdStrike – Data Hashing](https://www.crowdstrike.com/en-us/cybersecurity-101/data-protection/data-hashing/) |
| **Linting** | Computer tools used to ensure good formatting style and error-free code. | Source: [Wikipedia – Lint (software)](https://en.wikipedia.org/wiki/Lint_(software)) |
| **npm** | Node Package Manager. Also represents the world's largest software registry/library, which is free to use. | Source: [W3Schools – What is npm?](https://www.w3schools.com/whatis/whatis_npm.asp) |
| **Regression testing** | A testing strategy applied during software development that ensures a website continues working correctly after applying coding updates. | Source: [IBM – Regression testing](https://www.ibm.com/think/topics/regression-testing) |
| **UX** | User Experience. In computer systems design, it refers to the way a user interacts with a software application/device, focusing on improving the product's utility, efficiency and ease of use for the end user. | Source: [Wikipedia – User experience](https://en.wikipedia.org/wiki/User_experience) |

---

*Healthy Minds is a prototype research project created for educational purposes. The information provided by this platform is not intended as a substitute for professional medical advice, diagnosis, or treatment.*
