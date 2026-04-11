import requests
from typing import List

INDICATORS = [
    {"id": 4355, "name": "Severe mental strain (%), age 20-64"},
    {"id": 4356, "name": "Anxiety or insomnia (%), age 20-64"},
    {"id": 289, "name": "Psychiatric outpatient visits per 1000"},
]

BASE_URL = "https://sotkanet.fi/rest/1.1/json"

REQUEST_HEADERS = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15",
    "Accept": "application/json, text/plain, */*",
    "Referer": "https://sotkanet.fi/",
    "Origin": "https://sotkanet.fi",
}


def fetch_indicator_year(indicator_id: int, year: int) -> list:
    url = f"{BASE_URL}?indicator={indicator_id}&years={year}&genders=total"
    response = requests.get(url, headers=REQUEST_HEADERS, timeout=30)
    response.raise_for_status()
    data = response.json()
    return data if isinstance(data, list) else []


def compute_national_average(rows: list) -> float | None:
    numeric_values = []

    for row in rows:
        raw_value = row.get("value")
        try:
            value = float(raw_value)
            numeric_values.append(value)
        except (TypeError, ValueError):
            continue

    if not numeric_values:
        return None

    return sum(numeric_values) / len(numeric_values)


def fetch_sotkanet_averages(start_year: int, end_year: int) -> List[dict]:
    results: List[dict] = []

    for indicator in INDICATORS:
        for year in range(start_year, end_year + 1):
            rows = fetch_indicator_year(indicator["id"], year)
            average = compute_national_average(rows)

            results.append(
                {
                    "indicator_id": indicator["id"],
                    "indicator_name": indicator["name"],
                    "region": "Finland (avg)",
                    "year": year,
                    "value": average,
                }
            )

    return results