from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthCredentials
from jose import JWTError, jwt
from typing import Optional
import httpx
import os

security = HTTPBearer()

# Keycloak configuration
KEYCLOAK_URL = os.getenv("KEYCLOAK_URL", "http://keycloak:8080")
KEYCLOAK_REALM = os.getenv("KEYCLOAK_REALM", "microservices")
ALGORITHM = "RS256"

# Cache for public keys
_public_keys_cache = None


async def get_public_keys():
    """Fetch Keycloak public keys"""
    global _public_keys_cache
    
    if _public_keys_cache:
        return _public_keys_cache
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{KEYCLOAK_URL}/realms/{KEYCLOAK_REALM}/protocol/openid-connect/certs"
            )
            _public_keys_cache = response.json()
            return _public_keys_cache
    except Exception as e:
        print(f"Error fetching public keys: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials"
        )


async def verify_token(credentials: HTTPAuthCredentials = Depends(security)):
    """Verify JWT token from Keycloak"""
    token = credentials.credentials
    
    try:
        # Get public keys from Keycloak
        keys = await get_public_keys()
        
        # Decode token with unverified header to get kid
        unverified_header = jwt.get_unverified_header(token)
        kid = unverified_header.get("kid")
        
        if not kid:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token header"
            )
        
        # Find the matching key
        key = None
        for k in keys.get("keys", []):
            if k.get("kid") == kid:
                key = k
                break
        
        if not key:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Key not found"
            )
        
        # Convert JWK to PEM format for verification
        from cryptography.hazmat.primitives.asymmetric import rsa
        from cryptography.hazmat.primitives import serialization
        from cryptography.hazmat.backends import default_backend
        from jose.backends.cryptography_backend import RSAKey
        
        # Create RSA key from JWK
        rsa_key = RSAKey.import_key(key)
        
        # Verify and decode token
        payload = jwt.decode(
            token,
            rsa_key.public_key_pem.decode(),
            algorithms=[ALGORITHM],
            audience="account"
        )
        
        return payload
        
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials"
        )
    except Exception as e:
        print(f"Token verification error: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials"
        )


async def get_current_user(payload: dict = Depends(verify_token)):
    """Get current authenticated user from token"""
    sub = payload.get("sub")
    if sub is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )
    return payload
