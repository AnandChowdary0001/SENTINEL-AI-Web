import os
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "http://localhost:8001").rstrip("/")
CREDS = {
    "admin": ("admin@sentinel.security", "Admin@123456"),
    "operator": ("operator@sentinel.security", "Operator@123456"),
    "viewer": ("viewer@sentinel.security", "Viewer@123456"),
}


def login(role):
    session = requests.Session()
    response = session.post(f"{BASE_URL}/api/auth/login", json={"email": CREDS[role][0], "password": CREDS[role][1]}, timeout=15)
    assert response.status_code == 200, response.text
    body = response.json()
    assert body["role"] == role if role != "admin" else body["role"] == "admin"
    assert body.get("token")
    assert "access_token" in session.cookies
    return session, body


def test_all_seeded_roles_and_auth_me():
    for role in CREDS:
        session, body = login(role)
        me = session.get(f"{BASE_URL}/api/auth/me", timeout=15)
        assert me.status_code == 200
        assert me.json()["email"] == CREDS[role][0]


def test_viewer_camera_rbac():
    session, _ = login("viewer")
    cameras = session.get(f"{BASE_URL}/api/cameras", timeout=15)
    assert cameras.status_code == 200
    assert {c["camera_id"] for c in cameras.json()} == {"CAM-01", "CAM-02"}
    restricted = session.get(f"{BASE_URL}/api/cameras/CAM-03", timeout=15)
    assert restricted.status_code == 403


def test_core_dashboard_data_endpoints():
    session, _ = login("admin")
    for endpoint in ["/api/system/status", "/api/reports/summary", "/api/alerts", "/api/detections", "/api/watchlist", "/api/reference-faces", "/api/audit-logs", "/api/settings"]:
        response = session.get(BASE_URL + endpoint, timeout=15)
        assert response.status_code == 200, f"{endpoint}: {response.text}"
        assert isinstance(response.json(), (dict, list))


def test_ai_ingestion_requires_engine_key():
    payload = {"camera_id": "CAM-01", "detection_type": "person", "confidence": 0.91}
    bad = requests.post(f"{BASE_URL}/api/ai/ingest/detection", json=payload, headers={"X-AI-Engine-Key": "wrong-key"}, timeout=15)
    assert bad.status_code in (401, 403), bad.text


def test_ai_ingestion_valid_key_creates_event():
    payload = {"camera_id": "CAM-01", "detection_type": "person", "person_name": "API_TEST_SUBJECT", "confidence": 0.91}
    response = requests.post(f"{BASE_URL}/api/ai/ingest/detection", json=payload, headers={"X-AI-Engine-Key": "sentinel_ai_engine_key_live_2026"}, timeout=15)
    assert response.status_code == 200, response.text
    body = response.json()
    assert body["status"] == "success" and body["event_id"].startswith("EVT-")


def test_operator_and_viewer_write_rbac():
    viewer, _ = login("viewer")
    denied = viewer.put(f"{BASE_URL}/api/settings", json={"site_name": "not allowed"}, timeout=15)
    assert denied.status_code == 403
    operator, _ = login("operator")
    allowed = operator.post(f"{BASE_URL}/api/cameras/CAM-01/test-connection", timeout=15)
    assert allowed.status_code == 200
    assert allowed.json()["camera_id"] == "CAM-01"