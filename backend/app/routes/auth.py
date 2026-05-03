"""
Signup → creates new user
Login → verifies user + returns token
/me (GET) → get current user info
/me (PATCH) → update profile
"""


from fastapi import APIRouter, Depends, HTTPException, status # FastAPI tools
from pydantic import BaseModel # for request validation (schemas)
from sqlalchemy.orm import Session # database session

from app.db.session import get_db # DB connection dependency
from app.models.user import User # user model
from app.schemas.auth import ProfessionalSignupRequest, LoginRequest, UpdateMeRequest # request schemas

from app.core.security import hash_password, verify_password, create_access_token # auth helpers
from app.dependencies import get_current_user # get logged-in user


# Authentication endpoint router for user signup, login, and profile management
router = APIRouter(prefix="/auth", tags=["auth"])


"""
Endpoint for professional user signup, 
which checks for existing email, creates a new user, and returns an access token along with user details
"""
@router.post("/signup/professional")
def signup_professional(payload: ProfessionalSignupRequest, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == payload.email).first()

    if existing_user:
        # return error if email is taken
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email is already registered",
        )

    # create new user
    user = User(
        email=payload.email,
        password_hash=hash_password(payload.password),
        full_name=payload.full_name,
        role="professional",
        is_active=True,
    )

    # save user to database
    db.add(user)
    db.commit()
    db.refresh(user)

    # create JWT token
    access_token = create_access_token(str(user.id), user.role)

    # return token + user info
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": str(user.id),
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role,
        },
    }


"""
Endpoint for user login, 
which verifies credentials and returns an access token along with user details if successful
"""
@router.post("/login")
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    # find user by email
    user = db.query(User).filter(User.email == payload.email).first()

    # check if user exists and password is correct
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    # create JWT token
    access_token = create_access_token(str(user.id), user.role)

    # return token + user info
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": str(user.id),
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role,
        },
    }


"""
Endpoint to get the current authenticated user's profile information, 
which requires a valid access token and returns user details
"""
@router.get("/me")
def get_me(current_user: User = Depends(get_current_user)):
    # return user info from token
    return {
        "id": str(current_user.id),
        "email": current_user.email,
        "full_name": current_user.full_name,
        "role": current_user.role,
        "avatar_url": current_user.avatar_url,
    }


"""
Endpoint to update the current authenticated user's profile information, 
which allows updating the full name and requires a valid access token
"""
@router.patch("/me")
def update_me(
    payload: UpdateMeRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # update user's name
    current_user.full_name = payload.full_name

    # save changes
    db.commit()
    db.refresh(current_user)

    # return updated user info
    return {
        "id": str(current_user.id),
        "email": current_user.email,
        "full_name": current_user.full_name,
        "role": current_user.role,
        "avatar_url": current_user.avatar_url,
    }