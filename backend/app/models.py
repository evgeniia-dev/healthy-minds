"""
Represents one record of health data
Used when receiving or returning data from the Sotkanet API
"""


from pydantic import BaseModel # Pydantic base class for data validation
from typing import Optional # allows fields to be optional (can be None)


# data model for a single row of Sotkanet health statistics
class SotkanetRow(BaseModel):
    indicator_id: int # ID of the health indicator
    indicator_name: str # name of the indicator
    region: str # geographic region
    year: int # year of the data point
    value: Optional[float] # optional numeric value of the indicator