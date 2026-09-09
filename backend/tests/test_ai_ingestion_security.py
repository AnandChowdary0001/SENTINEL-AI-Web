import os

import requests


BASE_URL = os.environ["REACT_APP_BACKEND_URL"].rstrip("/")
AI_KEY = "sentinel_ai_engine_key_live_2026"


def test_invalid_and_missing_engine_keys_are_rejected():
    payload = {"camera_id": "CAM-01", "detection_type": "person", "confidence": 0.88}
    invalid = requests.post(
        f"{BASE_URL}/api/ai/ingest/detection",
        json=payload,
        headers={"X-AI-Engine-Key": "invalid-test-key"},
        timeout=15,
    )
    missing = requests.post(f"{BASE_URL}/api/ai/ingest/detection", json=payload, timeout=15)
    assert invalid.status_code == 401, invalid.text
    assert missing.status_code == 401, missing.text


def test_valid_engine_key_creates_event_and_alert():
    payload = {
        "camera_id": "CAM-01",
        "detection_type": "person",
        "person_name": "API_ALERT_TEST_SUBJECT",
        "watchlist_match": True,
        "risk_level": "HIGH",
        "confidence": 0.94,
    }
    response = requests.post(
        f"{BASE_URL}/api/ai/ingest/detection",
        json=payload,
        headers={"X-AI-Engine-Key": AI_KEY},
        timeout=15,
    )
    assert response.status_code == 200, response.text
    body = response.json()
    assert body["status"] == "success"
    assert body["event_id"].startswith("EVT-")
    assert body["alert_triggered"] is True
    assert body["alert_id"].startswith("ALT-")