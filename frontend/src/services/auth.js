import Keycloak from 'keycloak-js'

let keycloak

/**
 * Initialize Keycloak instance
 */
export const initKeycloak = async () => {
  keycloak = new Keycloak({
    url: import.meta.env.VITE_KEYCLOAK_URL,
    realm: import.meta.env.VITE_KEYCLOAK_REALM,
    clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID
  })

  try {
    // Use 'check-sso' to check for existing sessions without forcing login
    // ProtectedRoute will redirect unauthenticated users to /login
    const authenticated = await keycloak.init({
      onLoad: 'check-sso',
      silentCheckSsoRedirectUri: `${window.location.origin}/public/silent-check-sso.html`,
      flow: 'standard',
      pkceMethod: 'S256',
      checkLoginIframe: true,
      checkLoginIframeInterval: 5
    })

    return authenticated
  } catch (error) {
    console.error('Keycloak initialization failed', error)
    throw error
  }
}

/**
 * Get Keycloak instance
 */
export const getKeycloak = () => {
  return keycloak
}

/**
 * Login user
 */
export const login = () => {
  return keycloak.login({
    redirectUri: `${window.location.origin}/dashboard`
  })
}

/**
 * Logout user
 */
export const logout = () => {
  return keycloak.logout({
    redirectUri: window.location.origin
  })
}

/**
 * Get current token
 */
export const getToken = () => {
  return keycloak?.token
}

/**
 * Check if user is authenticated
 */
export const isAuthenticated = () => {
  return keycloak?.authenticated || false
}

/**
 * Get user info
 */
export const getUserInfo = () => {
  if (!keycloak?.authenticated) {
    return null
  }

  return {
    username: keycloak.tokenParsed?.preferred_username,
    email: keycloak.tokenParsed?.email,
    firstName: keycloak.tokenParsed?.given_name,
    lastName: keycloak.tokenParsed?.family_name,
    roles: keycloak.tokenParsed?.realm_access?.roles,
    userId: keycloak.tokenParsed?.sub
  }
}

/**
 * Refresh token
 */
export const refreshToken = async () => {
  try {
    const refreshed = await keycloak.updateToken(30)
    if (refreshed) {
      console.log('Token refreshed')
    }
    return true
  } catch (error) {
    console.error('Failed to refresh token', error)
    return false
  }
}

/**
 * Check if token is expired
 */
export const isTokenExpired = () => {
  if (!keycloak?.tokenParsed) {
    return true
  }

  const now = Math.floor(Date.now() / 1000)
  const expiryTime = keycloak.tokenParsed.exp

  return now > expiryTime
}

/**
 * Get token expiry time in seconds
 */
export const getTokenExpiresIn = () => {
  if (!keycloak?.tokenParsed) {
    return 0
  }

  const now = Math.floor(Date.now() / 1000)
  const expiryTime = keycloak.tokenParsed.exp

  return Math.max(0, expiryTime - now)
}

/**
 * Check if user has specific role
 */
export const hasRole = (role) => {
  if (!keycloak?.authenticated) {
    return false
  }

  const roles = keycloak.tokenParsed?.realm_access?.roles || []
  return roles.includes(role)
}

/**
 * Handle authentication error
 */
export const handleAuthError = (error) => {
  console.error('Authentication error:', error)

  if (error?.response?.status === 401) {
    // Token expired or invalid
    logout()
  }
}
