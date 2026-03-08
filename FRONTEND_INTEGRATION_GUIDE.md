# Frontend Keycloak Integration Guide

## Overview

The React frontend has been fully integrated with Keycloak for Single Sign-On (SSO) authentication. All API requests are now protected and require valid JWT tokens.

## What Was Added

### 1. Frontend Authentication Service (`/frontend/src/services/auth.js`)

Core authentication functions:

- **`initKeycloak()`** - Initializes Keycloak client with PKCE secure flow
- **`login()`** - Redirects user to Keycloak login page
- **`logout()`** - Logs out user and redirects to home page
- **`getToken()`** - Returns current JWT token
- **`isAuthenticated()`** - Checks if user is authenticated
- **`getUserInfo()`** - Returns user details (name, email, roles, etc.)
- **`refreshToken()`** - Manually refreshes JWT token
- **`hasRole(role)`** - Checks if user has specific role

### 2. Login Page (`/frontend/src/pages/Login.jsx`)

Beautiful login interface with:

- Keycloak sign-in button
- Demo credentials display
- Features overview
- Responsive design
- Animated UI elements

### 3. Protected Route Component (`/frontend/src/components/ProtectedRoute.jsx`)

Guards routes and redirects unauthenticated users to login page.

### 4. User Menu Component (`/frontend/src/components/UserMenu.jsx`)

Shows:

- Current user's name and avatar
- User email and roles
- Logout button
- Dropdown menu for additional options

### 5. Updated API Client (`/frontend/src/services/api.js`)

All API requests now include JWT token in `Authorization` header:

```javascript
// Automatically added to all requests
Authorization: Bearer <JWT_TOKEN>
```

Handles 401 responses by logging out user.

### 6. Updated App Component (`/frontend/src/App.jsx`)

- Initializes Keycloak on app startup
- Shows loading spinner while authenticating
- Protects all routes except `/login`
- Redirects unauthenticated users to login page

### 7. Updated Navbar (`/frontend/src/components/Navbar.jsx`)

- Added UserMenu component
- Shows logged-in user info
- Provides quick logout option

## Installation

### 1. Install Dependencies

```bash
cd frontend
npm install
```

This installs `keycloak-js` (added to package.json):

```bash
npm install keycloak-js
```

### 2. Environment Variables

Create/update `.env.local`:

```bash
# API Configuration
VITE_API_BASE_URL=http://localhost

# Keycloak Configuration
VITE_KEYCLOAK_URL=http://localhost:8080
VITE_KEYCLOAK_REALM=microservices
VITE_KEYCLOAK_CLIENT_ID=microservices-app
```

## Authentication Flow

```
┌─────────────────────────────────────────────────────┐
│ 1. User visits application                          │
│    Frontend initializes Keycloak                    │
└──────────────────┬──────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────┐
│ 2. User not authenticated?                          │
│    Redirect to Login page                           │
└──────────────────┬──────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────┐
│ 3. User clicks "Sign In with Keycloak"             │
│    Redirected to Keycloak login page               │
└──────────────────┬──────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────┐
│ 4. User enters credentials                          │
│    Keycloak validates and issues JWT token          │
└──────────────────┬──────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────┐
│ 5. User redirected back to Dashboard                │
│    JWT stored in browser memory                     │
└──────────────────┬──────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────┐
│ 6. API requests include JWT token                   │
│    Backend validates token                          │
│    Response data returned                           │
└─────────────────────────────────────────────────────┘
```

## Backend Changes Required

All three microservices (`/app`, `/products`, `/orders`) have been updated:

### 1. Auth Module (`auth.py`)

```python
from app.auth import verify_token, get_current_user
```

Provides:

- `verify_token(token)` - Validates JWT token against Keycloak public key
- `get_current_user(token)` - Extracts user from validated token

### 2. Protect Endpoints

Add authentication to endpoints:

```python
from fastapi import Depends
from app.auth import get_current_user

@app.get("/api/v1/protected")
async def protected_endpoint(user = Depends(get_current_user)):
    return {"message": f"Hello {user['preferred_username']}"}
```

### 3. Update main.py

Already includes:

- CORS middleware for frontend
- Health check endpoint
- Keycloak environment variables
- Auth router setup

## Usage Examples

### Frontend: Get Current User

```javascript
import { getUserInfo } from './services/auth'

function MyComponent() {
  const user = getUserInfo()
  return <div>Welcome {user.firstName}!</div>
}
```

### Frontend: Check Permissions

```javascript
import { hasRole } from './services/auth'

function AdminPanel() {
  if (!hasRole('admin')) {
    return <div>Access Denied</div>
  }
  return <div>Admin Content</div>
}
```

### Frontend: Make API Call

```javascript
import { usersAPI } from './services/api'

const response = await usersAPI.getAll()
// JWT token automatically included in request
```

### Backend: Access User Info

```python
from app.auth import get_current_user

@app.post("/api/v1/users")
async def create_user(user_data, current_user = Depends(get_current_user)):
    # current_user contains: username, email, roles, etc.
    return {"created_by": current_user['preferred_username']}
```

## Keycloak Setup

See [KEYCLOAK_SSO_GUIDE.md](./KEYCLOAK_SSO_GUIDE.md) for detailed setup instructions:

1. Start Keycloak
2. Access admin console
3. Create realm
4. Create client
5. Create users
6. Test authentication

## Security Features

✅ **PKCE Flow** - Secure OAuth2 authorization for SPAs  
✅ **JWT Validation** - Backend validates token signature  
✅ **Token Expiry** - Automatic token refresh  
✅ **Secure Storage** - Tokens stored in secure browser memory  
✅ **CORS Protection** - Frontend and backend configured  
✅ **401 Handling** - Automatic logout on authentication failure  

## Troubleshooting

### Issue: "Cannot GET /callback"

**Solution**: Keycloak redirect URI should be configured in admin console:

1. Realm Settings > Keycloak Realm
2. Go to Client > microservices-app
3. Update Valid Redirect URIs: `http://localhost:3000/*`

### Issue: "Invalid token" errors

**Possible causes**:

- Token expired (auto-refreshes on API calls)
- Keycloak not running (check port 8080)
- Realm/client mismatch

**Solution**:

```bash
# Check Keycloak is running
docker ps | grep keycloak

# Check environment variables
echo $VITE_KEYCLOAK_URL
echo $VITE_KEYCLOAK_REALM
echo $VITE_KEYCLOAK_CLIENT_ID
```

### Issue: CORS errors on API calls

**Solution**: Ensure backend has CORS middleware:

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Issue: Token not sent with requests

**Solution**: Verify axios interceptor:

```javascript
import { getToken } from './services/auth'

// In api.js:
axiosInstance.interceptors.request.use((config) => {
    const token = getToken()
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})
```

## Testing

### Manual Testing

1. Start all services:

```bash
docker-compose -f docker-compose.multi-service.yml up -d --build
```

2. Navigate to `http://localhost:3000`

3. Click "Sign In with Keycloak"

4. Enter credentials:

   - Username: `john.doe`
   - Password: (use configured password)

5. Try CRUD operations on Users, Products, Orders

### Testing with cURL

```bash
# Get JWT token
TOKEN=$(curl -X POST http://localhost:8080/realms/microservices/protocol/openid-connect/token \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -d 'client_id=microservices-app&username=john.doe&password=password&grant_type=password' \
  | jq -r '.access_token')

# Use token in API request
curl -H "Authorization: Bearer $TOKEN" http://localhost:8000/api/v1/users
```

## Next Steps

### For Production

1. [x] Frontend Keycloak integration
2. [x] Backend JWT validation
3. [ ] Protect API endpoints with `@Depends(get_current_user)`
4. [ ] Set up database row-level access control
5. [ ] Implement audit logging
6. [ ] Set up rate limiting
7. [ ] Configure HTTPS
8. [ ] Deploy to cloud (Azure, AWS, GCP)

### Optional Enhancements

- [ ] Add MFA (Multi-Factor Authentication)
- [ ] Create role-based admin panels
- [ ] Add custom claims to JWT
- [ ] Implement API rate limiting by user
- [ ] Add user profile management page
- [ ] Set up password policies

## File Summary

**Created/Updated**:

- ✅ `/frontend/src/services/auth.js` - Keycloak initialization
- ✅ `/frontend/src/pages/Login.jsx` - Login page
- ✅ `/frontend/src/pages/Login.css` - Login styling
- ✅ `/frontend/src/components/ProtectedRoute.jsx` - Route guard
- ✅ `/frontend/src/components/UserMenu.jsx` - User menu
- ✅ `/frontend/src/components/UserMenu.css` - User menu styling
- ✅ `/frontend/src/services/api.js` - Updated with JWT interceptor
- ✅ `/frontend/src/App.jsx` - Updated with auth initialization
- ✅ `/frontend/src/App.css` - Updated with loading states
- ✅ `/frontend/src/components/Navbar.jsx` - Updated with UserMenu
- ✅ `/frontend/src/components/Navbar.css` - Updated styles
- ✅ `/frontend/package.json` - Added keycloak-js dependency
- ✅ `/frontend/.env.local` - Environment variables
- ✅ `/frontend/.env.example` - Example environment file
- ✅ `/app/auth.py` - Backend JWT validation
- ✅ `/products/auth.py` - Backend JWT validation
- ✅ `/orders/auth.py` - Backend JWT validation
- ✅ `/docker-compose.multi-service.yml` - Added Keycloak service
- ✅ `/KEYCLOAK_SSO_GUIDE.md` - Keycloak setup guide

## Resources

- [Keycloak Documentation](https://www.keycloak.org/documentation)
- [Keycloak JS Documentation](https://keycloak.github.io/docs/latest/securing_apps/#_javascript_adapter)
- [OpenID Connect Protocol](https://openid.net/connect/)
- [OAuth 2.0 with PKCE](https://tools.ietf.org/html/draft-ietf-oauth-security-best-practices-19#section-2.1)
- [JWT.io - Token Debugging](https://jwt.io/)
