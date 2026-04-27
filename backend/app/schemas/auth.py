from pydantic import BaseModel, EmailStr

# Pydantic Data Model used to define the structure and validation of data for authentication-related operations.
class ProfessionalSignupRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: str

# Pydantic Data Model for user login requests, which includes email and password fields for authentication.
class LoginRequest(BaseModel):
    email: EmailStr
    password: str

# Pydantic Data Model for the response returned after successful authentication, which includes the access token, token type, and user details.
class AuthResponse(BaseModel):
    access_token: str
    token_type: str
    user: dict