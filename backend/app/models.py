from pydantic import BaseModel
from typing import Optional


class SotkanetRow(BaseModel):
    indicator_id: int
    indicator_name: str
    region: str
    year: int
    value: Optional[float]