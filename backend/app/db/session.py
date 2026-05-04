"""
Session file for
Connects to the database
Creates sessions to talk to the DB
Provides a safe way to open/close DB connections
"""


from sqlalchemy import create_engine # creates connection to the database
from sqlalchemy.orm import sessionmaker, DeclarativeBase # ORM tools for models and sessions
from app.core.config import DATABASE_URL # database connection string


# base class for all database models
class Base(DeclarativeBase):
    pass

# create database engine (connection)
engine = create_engine(DATABASE_URL, pool_pre_ping=True)

# create session factory (used to interact with DB)
SessionLocal = sessionmaker(
    autocommit=False,   # changes must be committed manually
    autoflush=False,    # don't auto-send changes to DB
    bind=engine         # bind session to engine
)


# dependency function to get a DB session
def get_db():
    db = SessionLocal() # create new session
    try:
        yield db # give session to request
    finally:
        db.close() # always close session after use