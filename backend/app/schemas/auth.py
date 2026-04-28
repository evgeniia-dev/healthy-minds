from pydantic import BaseModel, EmailStr

# Pydantic Data Model used to define the structure and validation of data for professional registration.
class ProfessionalSignupRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: str

# Pydantic Data Model for professional user login requests for authentication.
class LoginRequest(BaseModel):
    email: EmailStr
    password: str

# Pydantic Data Model for the response returned after successful authentication.
class AuthResponse(BaseModel):
    access_token: str
    token_type: str
    user: dict

# Pydantic Data Model to update user information
class UpdateMeRequest(BaseModel):
    full_name: str | None = None