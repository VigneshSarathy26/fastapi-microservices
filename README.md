# User Microservice

Single FastAPI microservice managing users with PostgreSQL.

## Quickstart
1. Copy `.env.example` to `.env`, adjust DB.
2. `docker-compose up --build`
3. Test: `curl -X POST http://localhost:8000/users/ -d '{"name":"foo","email":"foo@ex.com"}'`
4. API Docs: http://localhost:8000/docs
5. Tests: `pip install -r requirements-test.txt && pytest`

## Testing
- Unit: `pytest tests/test_unit`
- Integration/E2E: Use fixtures + docker-compose postgres-test.

## Deployment
- Kubernetes: Create Deployment/Service from Dockerfile.
- Scale: Independent HPA per service.
- CI/CD: GitHub Actions for build/test/push [conversation_history:2].

Matches your microservices patterns (DB-per-service) [memory:1].
