# Microservices Deployment Guide

## Quick Start (Local Development)

### Prerequisites

- Docker & Docker Compose
- Node.js 18+ (for frontend development)
- Python 3.12 (for backend development)
- Git

### Step 1: Start All Services

```bash
# From project root
docker-compose -f docker-compose.multi-service.yml up -d --build

# Monitor logs
docker-compose -f docker-compose.multi-service.yml logs -f
```

### Step 2: Wait for Keycloak to Be Ready

```bash
# Check Keycloak health
curl http://localhost:8080/health/ready

# Or check logs
docker logs keycloak
```

Keycloak typically takes 30-60 seconds to start.

### Step 3: Configure Keycloak

See [KEYCLOAK_SSO_GUIDE.md](./KEYCLOAK_SSO_GUIDE.md)

1. Access Keycloak admin console: http://localhost:8080/admin
2. Create realm `microservices`
3. Create client `microservices-app`
4. Create test user `john.doe`

### Step 4: Access Applications

- **Frontend**: http://localhost:3000
- **API Docs - Users**: http://localhost:8000/docs
- **API Docs - Products**: http://localhost:8001/docs
- **API Docs - Orders**: http://localhost:8002/docs
- **Keycloak Admin**: http://localhost:8080/admin

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        Docker Network                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────┐         ┌──────────────┐   ┌──────────────┐  │
│  │   Frontend   │         │ Keycloak     │   │  PostgreSQL  │  │
│  │  (Node)      │         │ (Java)       │   │  (Keycloak)  │  │
│  │  Port 3000   │         │  Port 8080   │   │  Port 5435   │  │
│  └──────┬───────┘         └──────┬───────┘   └──────────────┘  │
│         │                        │                               │
│         │ HTTP Requests          │ Token Validation             │
│         │ (with JWT)             │                               │
│         └────────────────────────┼───────────────────────────┐  │
│                                  │                           │  │
│  ┌──────────────┐   ┌──────────────────┐   ┌──────────────┐  │
│  │   Users      │   │   Products       │   │   Orders     │  │
│  │   Service    │   │   Service        │   │   Service    │  │
│  │  Port 8000   │   │  Port 8001       │   │  Port 8002   │  │
│  └──────┬───────┘   └──────┬───────────┘   └──────┬───────┘  │
│         │                  │                      │            │
│  ┌──────▼────┐   ┌─────────▼──────┐   ┌──────────▼──────┐    │
│  │PostgreSQL │   │  PostgreSQL    │   │  PostgreSQL     │    │
│  │ Port 5432 │   │  Port 5433     │   │  Port 5434      │    │
│  └──────┬────┘   └────────┬───────┘   └────────┬────────┘    │
│         │                 │                     │             │
│  ┌──────▼───┐  ┌──────────▼───┐   ┌────────────▼──┐        │
│  │ Redis    │  │  Redis       │   │  Redis        │        │
│  │Port 6379 │  │ Port 6380    │   │ Port 6381     │        │
│  └──────────┘  └──────────────┘   └───────────────┘        │
│                                                               │
└─────────────────────────────────────────────────────────────────┘
```

## Service Details

### Frontend (React + Vite)

- **Image**: Built from `/frontend/Dockerfile`
- **Port**: 3000
- **Environment Variables**:
  - `VITE_KEYCLOAK_URL`: http://keycloak:8080
  - `VITE_KEYCLOAK_REALM`: microservices
  - `VITE_KEYCLOAK_CLIENT_ID`: microservices-app
  - `VITE_API_BASE_URL`: http://localhost

**Health Check**: `http://localhost:3000`

### Users Service (FastAPI)

- **Image**: Built from `/app/Dockerfile`
- **Port**: 8000
- **Environment Variables**:
  - `DATABASE_URL`: postgresql://user:password@users_postgres:5432/users_db
  - `REDIS_HOST`: users_redis
  - `KEYCLOAK_URL`: http://keycloak:8080
  - `KEYCLOAK_REALM`: microservices
  - `KEYCLOAK_CLIENT_ID`: microservices-app

**Health Check**: `GET http://localhost:8000/`
**API Docs**: `http://localhost:8000/docs`

### Products Service (FastAPI)

- **Image**: Built from `/products/Dockerfile`
- **Port**: 8001
- **Similar setup to Users Service**

### Orders Service (FastAPI)

- **Image**: Built from `/orders/Dockerfile`
- **Port**: 8002
- **Similar setup to Users Service**

### Keycloak (Identity & Access Management)

- **Image**: keycloak/keycloak:latest
- **Port**: 8080
- **Environment Variables**:
  - `KEYCLOAK_ADMIN`: admin
  - `KEYCLOAK_ADMIN_PASSWORD`: admin
  - `KC_DB`: postgres
  - `KC_DB_URL`: jdbc:postgresql://keycloak_postgres:5432/keycloak
  - `KC_DB_USERNAME`: keycloak
  - `KC_DB_PASSWORD`: keycloak

**Admin Console**: `http://localhost:8080/admin`

### Databases & Caches

Each service has:

- **PostgreSQL**: Relational database
- **Redis**: Caching & session storage

## Common Docker Commands

### View Status

```bash
# List running containers
docker-compose -f docker-compose.multi-service.yml ps

# View logs for all services
docker-compose -f docker-compose.multi-service.yml logs

# View logs for specific service
docker-compose -f docker-compose.multi-service.yml logs keycloak
```

### Stop & Remove

```bash
# Stop all services (keeps data)
docker-compose -f docker-compose.multi-service.yml stop

# Remove all services (deletes containers)
docker-compose -f docker-compose.multi-service.yml down

# Remove all data (⚠️ DELETES DATABASES)
docker-compose -f docker-compose.multi-service.yml down -v
```

### Restart Services

```bash
# Restart all services
docker-compose -f docker-compose.multi-service.yml restart

# Rebuild and restart
docker-compose -f docker-compose.multi-service.yml up -d --build

# Restart specific service
docker-compose -f docker-compose.multi-service.yml restart users
```

### Access Container Shell

```bash
# Access container terminal
docker-compose -f docker-compose.multi-service.yml exec users bash

# Run Python command in service
docker-compose -f docker-compose.multi-service.yml exec users python -m pytest
```

## Database Migrations

### PostgreSQL Connection

```bash
# Connect to users database
docker-compose exec users_postgres psql -U user -d users_db

# Common PostgreSQL commands:
# \dt            - List all tables
# \d users       - Describe users table
# SELECT * FROM users;  - Query data
# \q             - Exit
```

## API Testing

### Using cURL

```bash
# Get JWT token
TOKEN=$(curl -s -X POST http://localhost:8080/realms/microservices/protocol/openid-connect/token \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -d 'client_id=microservices-app&username=john.doe&password=password&grant_type=password' \
  | jq -r '.access_token')

# Create user
curl -X POST http://localhost:8000/api/v1/users \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "jane.doe",
    "email": "jane@example.com",
    "full_name": "Jane Doe",
    "password": "secret123"
  }'

# Get all users
curl -H "Authorization: Bearer $TOKEN" http://localhost:8000/api/v1/users
```

### Using Postman

1. Open Postman
2. Create new request
3. Set Authorization: Bearer Token
4. Paste JWT token from above
5. Make requests to:
   - `http://localhost:8000/api/v1/users`
   - `http://localhost:8001/api/v1/products`
   - `http://localhost:8002/api/v1/orders`

### Using Swagger UI

1. Navigate to `http://localhost:8000/docs` (Users API)
2. Click "Authorize" button
3. Paste JWT token
4. Try API endpoints directly in UI

## Production Deployment

### Azure Container Instances

```bash
# Tag images
docker tag microservices-frontend:latest <registry>.azurecr.io/microservices-frontend:latest
docker tag microservices-app:latest <registry>.azurecr.io/microservices-app:latest
docker tag microservices-products:latest <registry>.azurecr.io/microservices-products:latest
docker tag microservices-orders:latest <registry>.azurecr.io/microservices-orders:latest

# Push to registry
docker push <registry>.azurecr.io/microservices-frontend:latest
docker push <registry>.azurecr.io/microservices-app:latest
docker push <registry>.azurecr.io/microservices-products:latest
docker push <registry>.azurecr.io/microservices-orders:latest

# Deploy using docker-compose
docker-compose -f docker-compose.prod.yml up -d
```

### Kubernetes

See helm-chart/ for Kubernetes deployment configuration.

```bash
# Deploy to AKS
helm install microservices ./helm-chart \
  --namespace production \
  --values helm-chart/values-prod.yaml

# Verify deployment
kubectl get pods -n production
kubectl logs -n production deployment/frontend
```

### Environment Variables for Production

Create `.env.production`:

```bash
# Frontend
VITE_KEYCLOAK_URL=https://keycloak.yourdomain.com
VITE_KEYCLOAK_REALM=microservices
VITE_KEYCLOAK_CLIENT_ID=microservices-app
VITE_API_BASE_URL=https://api.yourdomain.com

# Database (use cloud instances)
DATABASE_URL=postgresql://user:pass@db.azure.postgres.database.azure.com/users_db
REDIS_HOST=redis.cache.windows.net

# Keycloak Admin
KEYCLOAK_ADMIN=admin
KEYCLOAK_ADMIN_PASSWORD=<secure-password>

# Security
JWT_SECRET=<secure-random-string>
CORS_ORIGINS=https://yourdomain.com
```

## Monitoring & Logging

### Docker Logs

```bash
# Real-time logs
docker-compose logs -f

# Last 100 lines
docker-compose logs --tail=100

# Since specific time
docker-compose logs --since 2024-01-15T10:00:00
```

### Health Checks

```bash
# Frontend
curl http://localhost:3000

# Users Service
curl http://localhost:8000/

# Products Service
curl http://localhost:8001/

# Orders Service
curl http://localhost:8002/

# Keycloak
curl http://localhost:8080/health/ready
```

### Database Statistics

```bash
# Connect to users db
docker-compose exec users_postgres psql -U user -d users_db

# Get table sizes
SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname != 'pg_catalog'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

## Troubleshooting

### Service Won't Start

```bash
# Check logs
docker-compose logs service-name

# Check resource limits
docker stats

# Verify network connectivity
docker-compose exec service-name ping database-name
```

### Database Connection Issues

```bash
# Test connection
docker-compose exec users_postgres psql -U user -d users_db -c "SELECT 1"

# Check connection string format
# postgresql://username:password@host:port/database
```

### JWT Token Errors

```bash
# Verify Keycloak is running
curl http://localhost:8080/health/ready

# Check token validity
# Decode JWT at https://jwt.io

# Verify realm configuration
curl http://localhost:8080/realms/microservices
```

### CORS Issues

Check backend CORS configuration in `main.py`:

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Add your frontend URL
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## Performance Tips

1. **Use Redis for caching**: Already configured in docker-compose
2. **Enable database query logging**: Uncomment in sqlalchemy config
3. **Use connection pooling**: FastAPI handles this with SQLAlchemy
4. **Monitor resource usage**: `docker stats`
5. **Use health checks**: Keep services healthy and restart if needed

## Cleanup

```bash
# Remove unused docker images
docker image prune

# Remove unused networks
docker network prune

# Remove unused volumes
docker volume prune

# Full cleanup (⚠️ removes all data)
docker system prune -a --volumes
```

## Documentation

- [KEYCLOAK_SSO_GUIDE.md](./KEYCLOAK_SSO_GUIDE.md) - Authentication setup
- [FRONTEND_INTEGRATION_GUIDE.md](./FRONTEND_INTEGRATION_GUIDE.md) - Frontend details
- [README.md](./README.md) - Project overview
- [docs/](./docs/) - Additional documentation

## Getting Help

- Check service logs: `docker-compose logs <service>`
- Access API docs: `http://localhost:8000/docs`
- Keycloak admin: `http://localhost:8080/admin`
- Check environment variables in docker-compose file
- Test endpoints with curl or Postman
