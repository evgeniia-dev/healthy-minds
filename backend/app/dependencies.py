"""
Reads Bearer token from request
Decodes JWT
Validates user ID
Loads user from database
Returns the authenticated user
"""


from fastapi import Depends, HTTPException, status # FastAPI utilities for dependencies and errors
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials # handles Bearer token auth

from sqlalchemy.orm import Session # database session
from app.db.session import get_db # DB dependency
from app.core.security import decode_access_token # JWT decoding function
from app.models.user import User # user database model

# defines Bearer token authentication scheme
security = HTTPBearer()

# dependency to get the currently authenticated user
def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
):
    # extract token from Authorization header
    token = credentials.credentials

    # decode JWT token
    payload = decode_access_token(token)

    # check if token is valid
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )

    # get user ID from token payload
    user_id = payload.get("sub")

    # validate token contains user ID
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload",
        )

    # fetch user from database
    user = db.query(User).filter(User.id == user_id).first()

    # check if user exists
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )

    # return authenticated user
    return user