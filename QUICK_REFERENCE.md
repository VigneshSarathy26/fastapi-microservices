# Microservices Keycloak Integration - Quick Reference

## 🚀 Starting the Stack

```bash
# Start all services
docker-compose -f docker-compose.multi-service.yml up -d --build

# View logs
docker-compose -f docker-compose.multi-service.yml logs -f

# Check status
docker-compose -f docker-compose.multi-service.yml ps

# Stop all services
docker-compose -f docker-compose.multi-service.yml down
```

## 🔐 First-Time Keycloak Setup (1 time only)

1. **Access Admin Console**
   ```
   URL: http://localhost:8080/admin
   Username: admin
   Password: admin
   ```

2. **Create Realm**
   - Click "Create Realm"
   - Name: `microservices`
   - Click Create

3. **Create Client**
   - Menu > Clients > Create client
   - Client ID: `microservices-app`
   - Protocol: `openid-connect`
   - Click Save

4. **Configure Client**
   - Valid Redirect URIs: `http://localhost:3000/*`
   - Web Origins: `http://localhost:3000`
   - Click Save

5. **Create User**
   - Menu > Users > Add user
   - Username: `john.doe`
   - Email: `john@example.com`
   - Click Create

6. **Set User Password**
   - Click user > Credentials tab
   - Click "Set Password"
   - Temporary: OFF
   - Enter password
   - Click Save

## 🌐 Accessing Applications

| App | URL | Purpose |
|-----|-----|---------|
| Frontend | `http://localhost:3000` | React Dashboard (login required) |
| Users API | `http://localhost:8000/docs` | Swagger UI with try it out |
| Products API | `http://localhost:8001/docs` | Swagger UI with try it out |
| Orders API | `http://localhost:8002/docs` | Swagger UI with try it out |
| Keycloak | `http://localhost:8080/admin` | User/realm management |

## 🔄 Frontend Authentication

### Login Flow
```javascript
// Automatic - happens in App.jsx
initKeycloak() // Called on app start
→ Keycloak login page if not authenticated
→ Redirect to dashboard if authenticated
```

### Get Current User
```javascript
import { getUserInfo } from '@/services/auth'

const user = getUserInfo()
// Returns: { username, email, firstName, lastName, roles, userId }
```

### Check Permissions
```javascript
import { hasRole } from '@/services/auth'

if (hasRole('admin')) {
  // Show admin panel
}
```

### Make API Request
```javascript
import { usersAPI } from '@/services/api'

// JWT token automatically added to request header
const response = await usersAPI.getAll()
```

### Logout
```javascript
import { logout } from '@/services/auth'

logout() // Redirects to login page
```

## 🔒 Backend API Protection

### Get Current User
```python
from app.auth import get_current_user
from fastapi import Depends

@app.get("/api/v1/users")
async def get_users(current_user = Depends(get_current_user)):
    # current_user = {"preferred_username": "john.doe", "email": "...", ...}
    return users
```

### Check User Roles
```python
def has_role(required_role: str):
    def check(user = Depends(get_current_user)):
        if required_role not in user.get("roles", []):
            raise HTTPException(status_code=403)
        return user
    return check

@app.delete("/api/v1/users/{id}")
async def delete_user(id: int, admin = Depends(has_role("admin"))):
    # Only admins can delete
    pass
```

## 🧪 Testing with cURL

### Get JWT Token
```bash
TOKEN=$(curl -s -X POST http://localhost:8080/realms/microservices/protocol/openid-connect/token \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -d 'client_id=microservices-app&username=john.doe&password=PASSWORD&grant_type=password' \
  | jq -r '.access_token')

echo $TOKEN
```

### Test Protected Endpoint
```bash
curl -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  http://localhost:8000/api/v1/users
```

### Create User
```bash
curl -X POST http://localhost:8000/api/v1/users \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "jane.doe",
    "email": "jane@example.com",
    "full_name": "Jane Doe",
    "password": "secret123"
  }'
```

## 🐳 Docker Useful Commands

```bash
# View running containers
docker ps

# View all containers (including stopped)
docker ps -a

# View container logs
docker logs -f container_name

# Execute command in container
docker exec -it container_name bash

# View container resource usage
docker stats

# Remove stopped containers
docker container prune

# Remove unused images
docker image prune
```

## 📁 Important Files

| File | Purpose |
|------|---------|
| `/frontend/src/services/auth.js` | Keycloak integration |
| `/frontend/src/pages/Login.jsx` | Login page |
| `/frontend/.env.local` | Frontend config |
| `/app/auth.py` | JWT validation (Users) |
| `/products/auth.py` | JWT validation (Products) |
| `/orders/auth.py` | JWT validation (Orders) |
| `docker-compose.multi-service.yml` | Container orchestration |
| `KEYCLOAK_SSO_GUIDE.md` | Full Keycloak setup |
| `FRONTEND_INTEGRATION_GUIDE.md` | Frontend details |
| `DEPLOYMENT_GUIDE.md` | Deployment instructions |

## 🔧 Environment Variables

### Frontend (`.env.local`)
```bash
VITE_KEYCLOAK_URL=http://localhost:8080
VITE_KEYCLOAK_REALM=microservices
VITE_KEYCLOAK_CLIENT_ID=microservices-app
VITE_API_BASE_URL=http://localhost
```

### Backend (in docker-compose)
```bash
KEYCLOAK_URL=http://keycloak:8080
KEYCLOAK_REALM=microservices
KEYCLOAK_CLIENT_ID=microservices-app
```

## 🚨 Common Issues & Solutions

### Keycloak taking too long to start
```bash
# Wait longer and check health
curl http://localhost:8080/health/ready

# View logs
docker logs keycloak
```

### "Invalid token" errors on API calls
```bash
# Verify token is fresh (< 30 minutes old)
# Check Keycloak is running: curl http://localhost:8080/health/ready
# Verify realm and client match environment variables
```

### CORS errors in frontend
```bash
# Ensure backend has proper CORS configuration
# Check frontend environment variables
echo $VITE_API_BASE_URL
echo $VITE_KEYCLOAK_URL
```

### Frontend blank page after login
```bash
# Check browser console for errors
# Press F12 > Console tab
# Common causes: wrong Keycloak URL, missing realm/client
```

### Can't login to Keycloak admin
```bash
# Default credentials: admin / admin
# If changed, check docker-compose.yml for KEYCLOAK_ADMIN_PASSWORD
# Reset by restarting container: docker-compose restart keycloak
```

## 📊 Port Reference

| Service | Port | Protocol |
|---------|------|----------|
| Frontend | 3000 | HTTP |
| Users API | 8000 | HTTP |
| Products API | 8001 | HTTP |
| Orders API | 8002 | HTTP |
| Keycloak | 8080 | HTTP |
| Keycloak DB | 5435 | PostgreSQL |
| Users DB | 5432 | PostgreSQL |
| Products DB | 5433 | PostgreSQL |
| Orders DB | 5434 | PostgreSQL |
| Users Cache | 6379 | Redis |
| Products Cache | 6380 | Redis |
| Orders Cache | 6381 | Redis |

## 📖 Documentation

- **[KEYCLOAK_SSO_GUIDE.md](./KEYCLOAK_SSO_GUIDE.md)** - Complete Keycloak setup
- **[FRONTEND_INTEGRATION_GUIDE.md](./FRONTEND_INTEGRATION_GUIDE.md)** - Frontend implementation
- **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** - Deployment & orchestration
- **[README.md](./README.md)** - Project overview
- **[KEYCLOAK_INTEGRATION_SUMMARY.md](./KEYCLOAK_INTEGRATION_SUMMARY.md)** - Integration summary

## 🎯 Typical Development Workflow

1. **Start stack**
   ```bash
   docker-compose -f docker-compose.multi-service.yml up -d --build
   ```

2. **Wait for Keycloak**
   ```bash
   curl http://localhost:8080/health/ready
   ```

3. **Access frontend**
   ```
   http://localhost:3000
   ```

4. **Login**
   - Username: `john.doe`
   - Password: (configured in Keycloak)

5. **Test APIs**
   ```bash
   # Get token
   TOKEN=...
   
   # Test endpoints
   curl -H "Authorization: Bearer $TOKEN" http://localhost:8000/api/v1/users
   ```

6. **Debug if needed**
   ```bash
   # View logs
   docker logs -f keycloak
   docker logs -f users  # or products, orders
   
   # Check container status
   docker-compose ps
   ```

## 💡 Pro Tips

✅ Use Swagger UI for API testing: `http://localhost:8000/docs`
✅ Decode JWT tokens at: https://jwt.io
✅ Monitor services: `docker stats`
✅ Keep Keycloak logs visible: `docker logs -f keycloak`
✅ Test with frontend first, then cURL if issues
✅ Always include Bearer token in Authorization header
✅ Token format: `Authorization: Bearer <JWT_TOKEN>`

## 🔗 Quick Links

```
Frontend:         http://localhost:3000
Keycloak Admin:   http://localhost:8080/admin
Users API Docs:   http://localhost:8000/docs
Products Docs:    http://localhost:8001/docs
Orders Docs:      http://localhost:8002/docs
```

---

**Last Updated**: January 2025  
**Status**: Production Ready ✅
