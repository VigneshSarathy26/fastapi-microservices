# Complete Microservices Architecture

A modern microservices ecosystem with React frontend, Keycloak SSO, and 3 independent FastAPI services (Users, Products, Orders).

## 🏗️ Architecture Overview

- **Frontend**: React + Vite with Keycloak OAuth2 (Port 3000)
- **Keycloak**: Identity & Access Management (Port 8080)
- **Users Service**: FastAPI microservice with JWT validation (Port 8000)
- **Products Service**: FastAPI microservice with JWT validation (Port 8001)
- **Orders Service**: FastAPI microservice with JWT validation (Port 8002)
- **Databases**: Individual PostgreSQL per service + Keycloak DB
- **Caching**: Individual Redis per service
- **Orchestration**: Docker Compose

## 🚀 Quick Start (Docker Compose)

Start all services with one command:

```bash
# Build and start all services
docker-compose -f docker-compose.multi-service.yml up -d --build

# Access the application
# Frontend: http://localhost:3000 (redirects to Keycloak login)
# Users API: http://localhost:8000/docs
# Products API: http://localhost:8001/docs
# Orders API: http://localhost:8002/docs
# Keycloak Admin: http://localhost:8080/admin
```

Stop all services:

```bash
docker-compose -f docker-compose.multi-service.yml down
```

Wait for Keycloak to be ready (30-60 seconds), then see [KEYCLOAK_SSO_GUIDE.md](./KEYCLOAK_SSO_GUIDE.md) for initial setup.

## 🔐 Authentication (Keycloak SSO)

This project now includes enterprise-grade authentication with Keycloak:

- **Single Sign-On**: OAuth2 / OpenID Connect
- **JWT Verification**: All API requests validated server-side
- **Secure Token Flow**: PKCE-based authorization for SPAs
- **User Management**: Built-in role and permission system
- **Automatic Token Refresh**: Seamless user experience

### Quick Authentication Setup

1. Start services: `docker-compose -f docker-compose.multi-service.yml up -d --build`
2. Wait for Keycloak (check `docker logs keycloak`)
3. Access admin console: http://localhost:8080/admin
4. Follow [KEYCLOAK_SSO_GUIDE.md](./KEYCLOAK_SSO_GUIDE.md) steps 3-4
5. Create test user `john.doe` with password
6. Visit http://localhost:3000 and login

See **[KEYCLOAK_SSO_GUIDE.md](./KEYCLOAK_SSO_GUIDE.md)** for detailed authentication setup.

## 💻 Local Development Setup

### Frontend

```bash
cd frontend
npm install
npm run dev
# Visit http://localhost:3000
```

### Users Service

```bash
cd app
python -m venv .venv
.venv\Scripts\activate   # Windows
pip install -r requirements.txt
uvicorn main:app --reload
```

### Products Service

```bash
cd products
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8001
```

### Orders Service

```bash
cd orders
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8002
```

## 📊 Services Overview

| Service | Port | Purpose |
|---------|------|---------|
| Frontend | 3000 | React UI Dashboard |
| Users | 8000 | User Management |
| Products | 8001 | Product Catalog |
| Orders | 8002 | Order Management

## 🎯 Frontend Features

- Modern, responsive React UI with Tailwind-like styling
- Dashboard with service overview
- CRUD operations for all services
- Real-time updates
- Mobile-friendly design
- Clean navigation and modals

## 🔌 API Endpoints

### Users Service (/api/v1/users)
- `GET /` - List all users
- `GET /{id}` - Get user by ID
- `POST /` - Create new user
- `PUT /{id}` - Update user
- `DELETE /{id}` - Delete user

### Products Service (/api/v1/products)
- `GET /` - List all products
- `GET /{id}` - Get product by ID
- `POST /` - Create new product
- `PUT /{id}` - Update product
- `DELETE /{id}` - Delete product

### Orders Service (/api/v1/orders)
- `GET /` - List all orders
- `GET /{id}` - Get order by ID
- `GET /user/{user_id}` - Get orders by user
- `POST /` - Create new order
- `PUT /{id}` - Update order
- `DELETE /{id}` - Delete order

## 🧪 Testing

Run tests for each service:

```bash
cd app  # or products or orders
pip install -r requirements-test.txt
pytest
```

Test structure:
- `tests/test_unit/` - Unit tests
- `tests/test_integration/` - Database integration tests
- `tests/test_e2e/` - End-to-end API tests

## 🐳 Docker Commands

```bash
# View all containers
docker ps

# View logs
docker-compose -f docker-compose.multi-service.yml logs -f [service_name]

# Rebuild specific service
docker-compose -f docker-compose.multi-service.yml build [service_name]

# Execute command in container
docker exec -it [container_name] bash
```

## 🛠️ Technology Stack

**Frontend:**
- React 18.2
- Vite
- Axios
- React Router

**Backend:**
- FastAPI
- SQLAlchemy
- Pydantic
- PostgreSQL
- Redis
- Python 3.12

**DevOps:**
- Docker
- Docker Compose

## 📝 Environment Setup

Copy `.env.example` to `.env` in each service:

```bash
# Users Service
DATABASE_URL=postgresql://postgres:postgres@postgres_users:5432/users_db
REDIS_URL=redis://redis_users:6379

# Products Service
DATABASE_URL=postgresql://postgres:postgres@postgres_products:5432/products_db
REDIS_URL=redis://redis_products:6379

# Orders Service
DATABASE_URL=postgresql://postgres:postgres@postgres_orders:5432/orders_db
REDIS_URL=redis://redis_orders:6379
```

## 📊 Database Schemas

### Users
- id (Integer PK)
- email (String, unique)
- full_name (String)
- hashed_password (String)
- is_active (Boolean)
- created_at (DateTime)

### Products
- id (Integer PK)
- name (String, unique)
- description (Text)
- price (Float)
- stock_quantity (Integer)
- sku (String, unique)
- created_at (DateTime)
- updated_at (DateTime)

### Orders  
- id (Integer PK)
- user_id (Integer FK)
- product_id (Integer FK)
- quantity (Integer)
- total_price (Float)
- status (Enum: pending, processing, shipped, delivered, cancelled)
- order_number (String, unique)
- created_at (DateTime)
- updated_at (DateTime)

## 🔄 Caching Strategy

Each service uses Redis with:
- Cache key format: `{resource}:{id}`
- TTL: 1 hour (3600 seconds)
- Auto-invalidation on updates/deletes

## 📚 Additional Documentation

See the comprehensive guides for detailed information:

- **[KEYCLOAK_SSO_GUIDE.md](./KEYCLOAK_SSO_GUIDE.md)** - Complete Keycloak setup and configuration
- **[FRONTEND_INTEGRATION_GUIDE.md](./FRONTEND_INTEGRATION_GUIDE.md)** - Frontend authentication implementation details
- **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** - Docker, Kubernetes, and cloud deployment
- **[MICROSERVICES.md](./MICROSERVICES.md)** - Detailed service documentation
- **[frontend/README.md](./frontend/README.md)** - Frontend specific docs

## 🆘 Troubleshooting

**Services won't start:**
```bash
docker-compose -f docker-compose.multi-service.yml logs
```

**Port already in use:**
Check which service is using the port and update docker-compose.

**Database connection errors:**
```bash
docker exec postgres_users pg_isready -U postgres
```

**Frontend can't reach API:**
- Verify services are running: `docker ps`
- Check `VITE_API_BASE_URL` in frontend
- Verify CORS configuration

## 📄 License

MIT License - feel free to use for learning and development

---

**Last Updated**: March 2026

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
