# Microservices Architecture

This project is organized as a microservices architecture with three independent services:

## Services Overview

### 1. **Users Microservice** (`./app`)
- **Port**: 8000
- **Database**: PostgreSQL (port 5432)
- **Cache**: Redis (port 6379)
- **Endpoints**: `/api/v1/users`
- **Models**: User management, authentication
- **Key Features**:
  - User CRUD operations
  - Email validation
  - Password hashing

### 2. **Products Microservice** (`./products`)
- **Port**: 8001
- **Database**: PostgreSQL (port 5433)
- **Cache**: Redis (port 6380)
- **Endpoints**: `/api/v1/products`
- **Models**: Product catalog management
- **Key Features**:
  - Product CRUD operations
  - SKU management
  - Stock quantity tracking
  - Redis caching for product lookups

### 3. **Orders Microservice** (`./orders`)
- **Port**: 8002
- **Database**: PostgreSQL (port 5434)
- **Cache**: Redis (port 6381)
- **Endpoints**: `/api/v1/orders`
- **Models**: Order management
- **Key Features**:
  - Order CRUD operations
  - Order status tracking (pending, processing, shipped, delivered, cancelled)
  - User and product association
  - Auto-generated order numbers

## Running the Services

### Option 1: Run All Services Together
```bash
docker-compose -f docker-compose.multi-service.yml up -d
```

This will start all three microservices with their own databases and Redis caches on separate ports.

### Option 2: Run Individual Service
```bash
cd products
docker-compose up -d
```

### Option 3: Run Locally (Development)
Each service can be run locally:
```bash
cd products
pip install -r requirements.txt
python -m uvicorn products.main:app --reload
```

## API Endpoints

### Users Service (Port 8000)
```
GET    /api/v1/users                    - List all users
GET    /api/v1/users/{user_id}          - Get user by ID
POST   /api/v1/users                    - Create new user
PUT    /api/v1/users/{user_id}          - Update user
DELETE /api/v1/users/{user_id}          - Delete user
```

### Products Service (Port 8001)
```
GET    /api/v1/products                 - List all products
GET    /api/v1/products/{product_id}    - Get product by ID
POST   /api/v1/products                 - Create new product
PUT    /api/v1/products/{product_id}    - Update product
DELETE /api/v1/products/{product_id}    - Delete product
```

### Orders Service (Port 8002)
```
GET    /api/v1/orders                   - List all orders
GET    /api/v1/orders/{order_id}        - Get order by ID
GET    /api/v1/orders/user/{user_id}    - Get orders by user
POST   /api/v1/orders                   - Create new order
PUT    /api/v1/orders/{order_id}        - Update order
DELETE /api/v1/orders/{order_id}        - Delete order
```

## Database Schema

### Users Table
- `id` (Integer, PK)
- `email` (String, unique)
- `full_name` (String)
- `hashed_password` (String)
- `is_active` (Boolean)
- `created_at` (DateTime)

### Products Table
- `id` (Integer, PK)
- `name` (String, unique)
- `description` (Text)
- `price` (Float)
- `stock_quantity` (Integer)
- `sku` (String, unique)
- `created_at` (DateTime)
- `updated_at` (DateTime)

### Orders Table
- `id` (Integer, PK)
- `user_id` (Integer, FK)
- `product_id` (Integer, FK)
- `quantity` (Integer)
- `total_price` (Float)
- `status` (Enum: pending, processing, shipped, delivered, cancelled)
- `order_number` (String, unique)
- `created_at` (DateTime)
- `updated_at` (DateTime)

## Caching Strategy

Each microservice uses Redis for:
- Product lookups: `product:{id}`
- Order lookups: `order:{id}`
- 1-hour TTL (3600 seconds)
- Cache invalidation on updates/deletes

## Testing

Each service includes test structure:
```
tests/
├── test_unit/          - Unit tests for CRUD operations
├── test_integration/   - Database integration tests
└── test_e2e/          - End-to-end API tests
```

Run tests:
```bash
pip install -r requirements-test.txt
pytest
```

## Port Mapping

| Service        | API Port | DB Port | Redis Port |
|----------------|---------|---------|-----------|
| Users          | 8000    | 5432    | 6379      |
| Products       | 8001    | 5433    | 6380      |
| Orders         | 8002    | 5434    | 6381      |

## Environment Variables

Each service uses:
- `DATABASE_URL`: PostgreSQL connection string
- `REDIS_URL`: Redis connection string

## Future Enhancements

- [ ] API Gateway for unified interface
- [ ] Kubernetes deployment manifests
- [ ] Service mesh (Istio) integration
- [ ] Message queue (RabbitMQ/Kafka) for async operations
- [ ] Service-to-service authentication
- [ ] Distributed tracing (Jaeger)
- [ ] Metrics collection (Prometheus)
