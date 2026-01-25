# User Microservice

Single FastAPI microservice that manages users with PostgreSQL.

---

## Prerequisites ✅

- Docker & Docker Compose (for quick Docker-based runs)
- Python 3.12 (for local development)
- Copy `.env.example` to `.env` and update database credentials as needed

## Quickstart (Docker) 🚀

Start the service using Docker Compose:

```bash
# build and start the app
docker-compose up --build
```

Create a user (example):

```bash
curl -sS -X POST "http://localhost:8000/api/v1/users/" \
  -H "Content-Type: application/json" \
  -d '{"email": "foo@ex.com", "name": "foo", "password": "securePassword123"}'
```

## Quickstart (Local Development) 🔧

Run locally using a virtual environment:

```bash
python -m venv .venv
.venv\Scripts\activate   # Windows
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## Running tests ✅

Install test dependencies and run pytest:

```bash
pip install -r requirements-test.txt
pytest -q
```

Run specific suites:

- Unit tests: `pytest tests/test_unit -q`
- Integration tests: `pytest tests/test_integration -q`
- E2E tests: `pytest tests/test_e2e -q`

Note: Integration and E2E tests may require a running test database container.

---

## Architecture & Tech Stack 🔧

- **Framework:** FastAPI (Python 3.12)
- **Database:** PostgreSQL (async via SQLAlchemy + async driver)
- **Pattern:** DB-per-service (microservices architecture)

## Deployment & CI/CD 📦

- The `Dockerfile` runs `uvicorn app.main:app`.
- Use Kubernetes manifests (Deployment + Service) to expose port 8000 in production.
- CI/CD: Add workflow to run tests and build images (GitHub Actions recommended).

---

## Contributing

Contributions welcome — please open a PR with tests and follow existing style.

---
