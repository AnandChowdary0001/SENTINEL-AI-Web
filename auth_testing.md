# Auth Testing Playbook

## Credentials
- Admin: `admin@sentinel.security` / `Admin@123456` (role: admin)
- Operator: `operator@sentinel.security` / `Operator@123456` (role: operator)
- Viewer: `viewer@sentinel.security` / `Viewer@123456` (role: viewer)

## API Testing Steps
1. Login via `POST /api/auth/login` with `{"email": "admin@sentinel.security", "password": "Admin@123456"}`.
2. Verify response includes user object and sets `access_token` and `refresh_token` cookies.
3. Access `GET /api/auth/me` with cookie or Bearer token to verify active session.
4. Verify RBAC camera restriction: Log in as `viewer@sentinel.security` and check `GET /api/cameras` only returns cameras allowed in user permissions.
5. Ingest AI detection via `POST /api/ai/ingest/detection` with `X-AI-Engine-Key: sentinel_ai_engine_key_live_2026`.
