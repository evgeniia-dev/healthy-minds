from pydantic import BaseModel, EmailStr


class CreatePatientRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: str


class PatientResponse(BaseModel):
    id: str
    email: str
    full_name: str | None
    avatar_url: str | None
    created_at: str