"""
Security file for
Hashes passwords
Verifies passwords
Creates login tokens (JWT)
Decodes tokens to get user info
"""


from datetime import datetime, timedelta, UTC # handle time and expiration
from jose import JWTError, jwt # JWT creation and decoding
from passlib.context import CryptContext # password hashing

# import config values (secret key, algorithm, token expiry time)
from app.core.config import SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES


# password hashing setup using pbkdf2_sha256 algorithm
pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")


# function for hashing a plain password (for storing in database)
def hash_password(password: str) -> str:
    return pwd_context.hash(password)

# function for checking if entered password matches stored hashed password
def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

# function for creating JWT access token with user id and role
def create_access_token(user_id: str, role: str) -> str:
    expire = datetime.now(UTC) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)

    # data to store inside token (payload)
    to_encode = {
        "sub": user_id,
        "role": role,
        "exp": expire,
    }

    # encode and return JWT token
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

# function for decoding JWT token and return payload
def decode_access_token(token: str) -> dict | None:
    try:
        # decode token using secret key
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        # return None if token is invalid or expired
        return None