from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from app.routes.auth import router as auth_router
from app.routes.patients import router as patients_router
from app.routes.patient_detail import router as patient_detail_router
from app.routes.mood import router as mood_router
from app.db.session import Base, engine
from app.sotkanet import fetch_sotkanet_averages

app = FastAPI(title="Healthy Minds API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup():
    Base.metadata.create_all(bind=engine)

@app.get("/health")
def health():
    return {"status": "ok"}

@app.get("/api/sotkanet")
def get_sotkanet_data(
    start_year: int = Query(default=2015, ge=2000, le=2100),
    end_year: int = Query(default=2024, ge=2000, le=2100),
):
    if end_year < start_year:
        return {"error": "end_year must be greater than or equal to start_year"}

    data = fetch_sotkanet_averages(start_year, end_year)
    return {
        "success": True,
        "count": len(data),
        "data": data,
    }

app.include_router(auth_router)
app.include_router(patients_router)
app.include_router(patient_detail_router)
app.include_router(mood_router)