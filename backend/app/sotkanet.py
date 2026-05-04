"""
Fetches mental health data from Sotkanet API
Processes raw data into yearly averages
Returns clean structured results for your backend
"""

import requests # used to make HTTP requests to external API
from typing import List # type hint for lists

# list of health indicators we fetch from Sotkanet API
INDICATORS = [
    {"id": 4355, "name": "Severe mental strain (%), age 20-64"},
    {"id": 4356, "name": "Anxiety or insomnia (%), age 20-64"},
    {"id": 289, "name": "Psychiatric outpatient visits per 1000"},
]

# base URL for Sotkanet API
BASE_URL = "https://sotkanet.fi/rest/1.1/json"

# HTTP headers to mimic browser request and avoid blocking
REQUEST_HEADERS = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15",
    "Accept": "application/json, text/plain, */*",
    "Referer": "https://sotkanet.fi/",
    "Origin": "https://sotkanet.fi",
}


# function for fetching raw data for a single indicator in a specific year
def fetch_indicator_year(indicator_id: int, year: int) -> list:
    url = f"{BASE_URL}?indicator={indicator_id}&years={year}&genders=total"
    response = requests.get(url, headers=REQUEST_HEADERS, timeout=30)
    response.raise_for_status()
    data = response.json()
    return data if isinstance(data, list) else []


# function for computing average value from raw API rows
def compute_national_average(rows: list) -> float | None:
    numeric_values = []

    # extract valid numeric values from rows
    for row in rows:
        raw_value = row.get("value")
        try:
            value = float(raw_value)
            numeric_values.append(value)
        except (TypeError, ValueError):
            continue

    # return None if no valid data
    if not numeric_values:
        return None

    # calculate and return average
    return sum(numeric_values) / len(numeric_values)


# function for fetching yearly averages for all indicators
def fetch_sotkanet_averages(start_year: int, end_year: int) -> List[dict]:
    results: List[dict] = []

    # loop through each indicator
    for indicator in INDICATORS:
        # loop through each year in range
        for year in range(start_year, end_year + 1):
            # fetch raw data
            rows = fetch_indicator_year(indicator["id"], year)

            # calculate average value
            average = compute_national_average(rows)

            # store formatted result
            results.append(
                {
                    "indicator_id": indicator["id"],
                    "indicator_name": indicator["name"],
                    "region": "Finland (avg)",
                    "year": year,
                    "value": average,
                }
            )
    # return all results
    return results