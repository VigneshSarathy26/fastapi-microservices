# Keycloak Configuration Verification & Setup Guide

## ⚠️ Critical: Redirect URI Configuration

If you're being redirected to `localhost:3000` after login, it's likely a **redirect URI mismatch** in Keycloak.

### Fix: Configure Keycloak Valid Redirect URIs

1. **Access Keycloak Admin Console**:
   ```
   http://localhost:8080/admin
   Username: admin
   Password: admin
   ```

2. **Navigate to Client Configuration**:
   - Menu > Clients > Microservices
   - Or select Realm: `microservices` > Clients > `microservices-app`

3. **Update Settings** (Critical):
   - **Valid Redirect URIs**: 
     ```
     http://localhost:3000
     http://localhost:3000/
     http://localhost:3000/*
     http://localhost:3000/dashboard
     http://localhost:3000/callback
     ```
   - **Web Origins**:
     ```
     http://localhost:3000
     ```
   - **Valid Post Logout Redirect URIs**:
     ```
     http://localhost:3000
     ```
   - Click **Save**

4. **Go to Credentials Tab**:
   - Copy the **Client Secret** (you might need it later)
   - Note the **Client ID**: `microservices-app`

## Testing the Login Flow

### Test 1: Manual Keycloak Token Request

```bash
# Get a token from Keycloak (test that realm is working)
TOKEN=$(curl -s -X POST http://localhost:8080/realms/microservices/protocol/openid-connect/token \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -d 'client_id=microservices-app' \
  -d 'username=john.doe' \
  -d 'password=PASSWORD' \
  -d 'grant_type=password' \
  | jq -r '.access_token')

echo "Token: $TOKEN"

# If no token, the user doesn't exist or password is wrong!
```

### Test 2: Verify Frontend Keycloak Connection

1. Open browser DevTools (F12)
2. Go to Console tab
3. Clear the page and refresh
4. Check for any JavaScript errors
5. Expected flow:
   - Keycloak initializes (no console errors)
   - You should see Login page OR Dashboard
   - NO 404 errors

### Test 3: Verify Keycloak Realm Config

```bash
# Check realm metadata
curl -s http://localhost:8080/realms/microservices | jq .

# Look for "openid-configuration"
curl -s http://localhost:8080/realms/microservices/.well-known/openid-configuration | jq .

# Check if your redirect_uris are listed
```

## Common Issues & Fixes

### Issue 1: "Invalid Redirect URI"
**Cause**: Redirect URI in Keycloak doesn't match what frontend is using
**Fix**: Add all variations to "Valid Redirect URIs":
```
http://localhost:3000
http://localhost:3000/
http://localhost:3000/*
```

### Issue 2: Blank Page After Login
**Cause**: Keycloak client not fully configured
**Fix**: 
```bash
# Restart containers
docker-compose -f docker-compose.multi-service.yml restart

# Clear browser cache (Ctrl+F5)
```

### Issue 3: "Client not found" Error
**Cause**: Client ID mismatch
**Fix**:
1. Verify client ID is exactly: `microservices-app`
2. Verify it's in the correct realm: `microservices`
3. Check `.env.local`:
   ```
   VITE_KEYCLOAK_CLIENT_ID=microservices-app
   ```

### Issue 4: CORS Errors
**Cause**: Frontend can't reach Keycloak
**Fix**:
1. Verify Keycloak is running: `docker ps | grep keycloak`
2. Check URL in browser: `http://localhost:8080`
3. Verify `.env.local`:
   ```
   VITE_KEYCLOAK_URL=http://localhost:8080
   ```

## Step-by-Step Setup (If Starting Fresh)

### 1. Create Realm
```
URL: http://localhost:8080/admin
Menu > Create Realm
Name: microservices
Click Create
```

### 2. Create Client
```
Realm: microservices
Menu > Clients > Create client
Client ID: microservices-app
Client Protocol: openid-connect
Save

Configure:
- Valid Redirect URIs: http://localhost:3000/*
- Web Origins: http://localhost:3000
- Root URL: http://localhost:3000
- Home URL: /
Click Save
```

### 3. Create User
```
Menu > Users > Add user
Username: john.doe
Email: john@example.com
Email Verified: ON
Click Create

Go to Credentials tab:
Set Password:
- Enter password
- Temporary: OFF
Click Save
```

### 4. Test Access
```
1. Open http://localhost:3000
2. You should see Login page
3. Click "Sign In with Keycloak"
4. Enter: john.doe / password
5. Should redirect to Dashboard
6. Success! ✅
```

## Advanced Configuration

### If Using Different Domain
Replace `localhost:3000` with your domain everywhere:

**In Keycloak**:
- Valid Redirect URIs: `https://yourdomain.com/*`
- Web Origins: `https://yourdomain.com`

**In `.env.local`**:
```
VITE_KEYCLOAK_URL=https://keycloak.yourdomain.com
VITE_API_BASE_URL=https://yourdomain.com
VITE_KEYCLOAK_CLIENT_ID=microservices-app
VITE_KEYCLOAK_REALM=microservices
```

**In docker-compose.yml** (if using different domain):
```yaml
frontend:
  build:
    args:
      VITE_KEYCLOAK_URL: https://keycloak.yourdomain.com
      VITE_API_BASE_URL: https://yourdomain.com
```

## Debugging Commands

### Check Keycloak Logs
```bash
docker logs -f keycloak_sso
```

### Check Frontend Logs
```bash
docker logs -f microservices_ui
```

### Verify All Services Running
```bash
docker-compose -f docker-compose.multi-service.yml ps
```

### Test Direct Token Call
```bash
curl -X POST http://localhost:8080/realms/microservices/protocol/openid-connect/token \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -d 'client_id=microservices-app&username=john.doe&password=password&grant_type=password'
```

## Browser Console Tips

When testing, open DevTools (F12) and check:

1. **Network Tab**: 
   - Look for requests to `http://localhost:8080`
   - Check response status codes

2. **Console Tab**: 
   - Look for JavaScript errors
   - Keycloak should log its initialization

3. **Application Tab** (Storage):
   - Check if any tokens are being stored
   - Local storage should have Keycloak data

## Checklist Before Testing

- [ ] Keycloak running: `docker ps | grep keycloak`
- [ ] Realm exists: `curl http://localhost:8080/realms/microservices`
- [ ] Client exists: Admin console sees `microservices-app`
- [ ] Redirect URIs include `http://localhost:3000/*`
- [ ] User `john.doe` exists with password set
- [ ] Frontend running: `http://localhost:3000`
- [ ] `.env.local` has correct Keycloak URLs
- [ ] Browser cache cleared (Ctrl+F5)

## Still Having Issues?

1. **Check docker logs**:
   ```bash
   docker logs keycloak_sso
   docker logs microservices_ui
   ```

2. **Verify network connectivity**:
   ```bash
   docker exec microservices_ui curl -v http://keycloak:8080
   ```

3. **Restart everything**:
   ```bash
   docker-compose -f docker-compose.multi-service.yml down
   docker-compose -f docker-compose.multi-service.yml up -d --build
   # Wait 60 seconds for Keycloak to start
   ```

4. **Check environment variables**:
   ```bash
   cat frontend/.env.local
   ```

## Next Steps

After successful login:
1. ✅ You'll see the Dashboard
2. ✅ Can manage Users, Products, Orders
3. ✅ Your profile shows in top-right menu
4. ✅ Logout button available

Then follow [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for production setup!
