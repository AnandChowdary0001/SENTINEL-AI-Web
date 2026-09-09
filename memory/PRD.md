# Product Requirements Document (PRD) - Sentinel AI CCTV Surveillance Platform

## 1. Project Purpose & Architecture
Sentinel AI is a commercial-grade, multi-camera AI CCTV surveillance and operations dashboard. It provides real-time monitoring across dynamically configured N cameras, live optical face recognition & person detection telemetry, dynamic watchlist target tracking, automated security alert dispatch with severity escalation, role-based camera permission enforcement, and ingestion APIs designed for external Python AI detection engines (YOLOv8, FaceNet, DeepFace).

### Future CCTV Ingestion Pipeline
```
CCTV / IP Cameras
       ↓
RTSP / Video Streams
       ↓
Python AI Detection Engine (YOLO / OpenCV / DeepFace)
       ↓
Face / Person Detection & Recognition
       ↓
Watchlist Matching (Active Target Comparison)
       ↓
REST Ingestion API (POST /api/ai/ingest/detection) + WebSocket Telemetry
       ↓
Sentinel AI Control Room Web Dashboard
```

---

## 2. Implemented Features (June 2026)

### 2.1 Dynamic N-Camera Grid & Diagnostics
- Multi-camera live matrix (single spotlight, 2x2, 3x3, 4x4 matrix).
- Live HUD telemetry: Timecode (sub-second accuracy), REC indicator, FPS, resolution, zone badges, and active bounding reticles.
- RTSP stream diagnostics: Latency test, packet loss calculation, and connection ping.
- Dynamically add, edit, toggle online/offline status, and delete cameras.

### 2.2 Dynamic Watchlist vs. Reference Database Separation
- **Active Watchlist:** Explicitly enabled targets with risk classification (CRITICAL, HIGH, MEDIUM, LOW), image reference, and real-time optical alert generation.
- **Reference Face Database:** Enrolled identities (employees, contractors, security personnel) that do not trigger alerts unless explicitly assigned to an active watchlist.

### 2.3 Alert Center & Incident Management
- Real-time alert dispatch on watchlist match, unauthorized zone intrusion, and loitering.
- Severity levels (CRITICAL, HIGH, MEDIUM, LOW) with synthesized audio siren feedback via Web Audio API.
- Review workflow: Acknowledge, resolve incident, add investigation findings, or mark false positives.

### 2.4 Role-Based Access Control (RBAC) & Strict Camera Authorization
- 3 Roles: Administrator (full access), Security Operator (live monitoring & alert review), and Viewer (authorized cameras only).
- Strict backend enforcement: Non-authorized cameras are filtered from listings and return HTTP 403 upon direct access.
- Audit Trail: Immutable logging of logins, permission changes, watchlist modifications, and alert reviews.

### 2.5 Reports & Intelligence Analytics
- 24-Hour detection volume area charts and hourly traffic bar charts.
- Alert distribution by severity pie chart and camera activity rankings.
- One-click CSV export and print-ready report layout.

### 2.6 External Python AI Ingestion API
- Endpoint: `POST /api/ai/ingest/detection` secured via `X-AI-Engine-Key` header and JWT session verification.
- Real-time WebSocket broadcasting over `/api/ws/telemetry`.
- Interactive in-app AI Simulator tool allowing operators and QA to test AI detection events on the live grid.

---

## 3. Seeded Demo Accounts & Credentials
- **Administrator:** `admin@sentinel.security` / `Admin@123456`
- **Security Operator:** `operator@sentinel.security` / `Operator@123456`
- **Viewer:** `viewer@sentinel.security` / `Viewer@123456`
- **AI Engine Key:** `sentinel_ai_engine_key_live_2026`

---

## 4. Prioritized Backlog (P0 / P1 / P2)
- **P0:** HLS / WebRTC live video transcode relay for raw RTSP hardware streams.
- **P1:** PTZ (Pan-Tilt-Zoom) joystick & preset position controls via ONVIF protocol.
- **P2:** Geo-spatial 2D/3D facility floorplan map with interactive camera markers and perimeter breach vectors.
