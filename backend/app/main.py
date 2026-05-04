"""
Starts the FastAPI app
Creates database tables on startup
Enables CORS for frontend access
Connects all route files

Provides:
/health → server check
/api/sotkanet → external health data
"""


from fastapi import FastAPI, Query # FastAPI core + query parameter handling
from fastapi.middleware.cors import CORSMiddleware # CORS for frontend-backend communication

from app.routes.auth import router as auth_router # authentication routes
from app.routes.patients import router as patients_router # patient management routes
from app.routes.patient_detail import router as patient_detail_router # patient detail routes
from app.routes.mood import router as mood_router # mood tracking routes

from app.db.session import Base, engine # database base + engine
from app.sotkanet import fetch_sotkanet_averages # external health data fetcher
from contextlib import asynccontextmanager # handles app startup/shutdown lifecycle


# application lifecycle manager (runs startup/shutdown logic)
@asynccontextmanager
async def lifespan(app: FastAPI):
    # startup
    Base.metadata.create_all(bind=engine)
    yield
    # shutdown (no-op)


# create FastAPI application instance
app = FastAPI(title="Healthy Minds API", lifespan=lifespan)


# configure CORS (allow frontend to call backend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# simple health check endpoint
@app.get("/health")
def health():
    return {"status": "ok"}

# endpoint for Sotkanet API health data
@app.get("/api/sotkanet")
def get_sotkanet_data(
    start_year: int = Query(default=2015, ge=2000, le=2100), # start year filter
    end_year: int = Query(default=2024, ge=2000, le=2100),   # end year filter
):
    # validate year range
    if end_year < start_year:
        return {
            "success": False,
            "error": "end_year must be greater than or equal to start_year"
        }

    # fetch data from Sotkanet
    data = fetch_sotkanet_averages(start_year, end_year)

    # return formatted response
    return {
        "success": True,
        "count": len(data),
        "data": data,
    }


# register all route modules
app.include_router(auth_router)
app.include_router(patients_router)
app.include_router(patient_detail_router)
app.include_router(mood_router)