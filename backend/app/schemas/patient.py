from pydantic import BaseModel, EmailStr

# Pydantic Data Model used to define the structure and validation of data for patient registration by registered professional
class CreatePatientRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: str

# Pydantic Data Model used to define structure of response returned after successful patient creation.
class PatientResponse(BaseModel):
    id: str
    email: str
    full_name: str | None
    avatar_url: str | None
    created_at: str