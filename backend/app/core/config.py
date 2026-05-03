"""
This is the config file which loads environment variables and sets up configuration values
Loads settings from venv
Provides defaults if missing
Keeps sensitive data (like DB URL, secret keys) out of the code
"""


import os # used to access environment variables
from dotenv import load_dotenv # loads variables from venv file

load_dotenv() # load venv file into the app

# Database connection string
DATABASE_URL = os.getenv("DATABASE_URL", "")

# Secret key for security (JWT tokens)
SECRET_KEY = os.getenv("SECRET_KEY", "")

# Encryption algorithm (default: HS256)
ALGORITHM = os.getenv("ALGORITHM", "HS256")

# Token expiration time in minutes (default: 60)
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))

# Frontend URL (used for CORS or redirects)
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:8090")