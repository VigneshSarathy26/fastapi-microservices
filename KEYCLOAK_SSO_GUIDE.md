# Keycloak SSO Integration Guide

## Overview

Keycloak is an Open Source Identity and Access Management solution. This integration provides:

- Single Sign-On (SSO) for all microservices
- JWT token-based authentication
- User management and roles
- Secure API access

## Architecture

```
┌─────────────────────────────────────────────┐
│         Frontend (React)                    │
│  - Login with Keycloak                      │
│  - Store JWT tokens                         │
│  - Send tokens with API requests            │
└────────────┬────────────────────────────────┘
             │
             │ (Authenticated Requests)
             │
┌────────────▼────────────────────────────────┐
│     Microservices (FastAPI)                 │
│  - Validate JWT tokens                      │
│  - Protect endpoints with auth              │
│  - Return user context                      │
└────────────┬────────────────────────────────┘
             │
             │ (Token Validation)
             │
┌────────────▼────────────────────────────────┐
│      Keycloak (Port 8080)                   │
│  - Issue JWT tokens                         │
│  - Validate tokens                          │
│  - Manage users/roles                       │
└─────────────────────────────────────────────┘
```

## Quick Start

### 1. Start All Services

```bash
docker-compose -f docker-compose.multi-service.yml up -d --build
```

### 2. Access Keycloak Admin Console

- **URL**: http://localhost:8080/admin
- **Username**: admin
- **Password**: admin

### 3. Create Realm and Client

#### Create Realm

1. Go to Admin Console
2. Click "Create Realm"
3. Name: `microservices`
4. Click Create

#### Create Client

1. Select Realm: `microservices`
2. Go to Clients
3. Click "Create client"
4. Client ID: `microservices-app`
5. Client Protocol: `openid-connect`
6. Configure:
   - Valid Redirect URIs: `http://localhost:3000/*`
   - Web Origins: `http://localhost:3000`
7. Click Save

#### Get Client Secret (Optional)

1. Go to Client > Credentials
2. Copy Client Secret for backend setup

### 4. Create Users

1. Go to Users
2. Click "Add user"
3. Fill in details:
   - Username: `john.doe`
   - Email: `john@example.com`
4. Set Password:
   - Go to Credentials tab
   - Click "Set Password"
   - Enter password and confirm
   - Set "Temporary" to OFF

## Frontend Integration

The React frontend uses `keycloak-js` library for OAuth2/OIDC flow:

```javascript
import Keycloak from 'keycloak-js'

const keycloak = new Keycloak({
  url: 'http://localhost:8080',
  realm: 'microservices',
  clientId: 'microservices-app'
})

// Initialize and login
keycloak.init({ onLoad: 'login-required' })
  .then(authenticated => {
    if (authenticated) {
      // Store token
      const token = keycloak.token
      // Use token for API calls
    }
  })
```

## Backend Integration

API endpoints are protected with JWT tokens:

```python
from app.auth import get_current_user
from fastapi import Depends

@app.get("/api/v1/protected")
async def protected_endpoint(user = Depends(get_current_user)):
    return {"message": f"Hello {user['preferred_username']}"}
```

## API Endpoints

### Public Endpoints (No Auth Required)
- `GET /` - Health check
- `GET /docs` - API documentation

### Protected Endpoints (Requires JWT Token)
- `GET /api/v1/users`
- `POST /api/v1/users`
- `PUT /api/v1/users/{id}`
- `DELETE /api/v1/users/{id}`

(Same applies to Products and Orders services)

## Making Authenticated Requests

### Using Frontend

```javascript
// Get current user's token
const token = keycloak.token

// Make API call with token
const response = await fetch('http://localhost:8000/api/v1/users', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
```

### Using cURL

```bash
# Get token
TOKEN=$(curl -X POST http://localhost:8080/realms/microservices/protocol/openid-connect/token \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -d 'client_id=microservices-app&username=john.doe&password=password&grant_type=password&client_secret=YOUR_SECRET' \
  | jq -r '.access_token')

# Use token in request
curl -H "Authorization: Bearer $TOKEN" http://localhost:8000/api/v1/users
```

## Token Claims

JWT tokens include:

```json
{
  "sub": "user-id",
  "preferred_username": "john.doe",
  "email": "john@example.com",
  "email_verified": true,
  "roles": ["user", "admin"],
  "iat": 1234567890,
  "exp": 1234571490
}
```

## Troubleshooting

### Keycloak won't start
```bash
# Check logs
docker-compose logs keycloak

# Verify database is running
docker ps | grep keycloak_postgres
```

### Invalid token error
- Verify token is not expired
- Check token audience matches (`account`)
- Ensure KEYCLOAK_URL is correct in backend

### CORS errors
- Frontend may need multiple redirect URIs configured
- Check browser console for detailed error

## Production Recommendations

- [ ] Use environment-specific Keycloak instances
- [ ] Enable HTTPS for token transmission
- [ ] Set strong admin passwords
- [ ] Configure token expiration policies
- [ ] Enable 2FA for sensitive roles
- [ ] Use dedicated database for Keycloak
- [ ] Implement token refresh mechanism
- [ ] Set up monitoring and alerts

## Learn More

- [Keycloak Documentation](https://www.keycloak.org/documentation)
- [OpenID Connect](https://openid.net/connect/)
- [OAuth 2.0](https://oauth.net/2/)
- [JWT](https://jwt.io/)
