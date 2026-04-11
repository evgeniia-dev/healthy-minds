from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from app.sotkanet import fetch_sotkanet_averages

app = FastAPI(title="Healthy Minds API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:8090",
        "http://127.0.0.1:8090",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


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