import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { login, isAuthenticated } from '../services/auth'
import './Login.css'

const Login = () => {
  const navigate = useNavigate()

  useEffect(() => {
    // If already authenticated, redirect to dashboard
    if (isAuthenticated()) {
      navigate('/dashboard')
    }
  }, [navigate])

  const handleLogin = () => {
    login()
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>Microservices Dashboard</h1>
          <p>Secure Authentication with Keycloak</p>
        </div>

        <div className="login-content">
          <div className="login-illustration">
            <div className="icon">🔐</div>
          </div>

          <h2>Welcome</h2>
          <p>Sign in with your credentials to access the microservices dashboard</p>

          <button className="login-button" onClick={handleLogin}>
            <span className="button-icon">🔓</span>
            Sign In with Keycloak
          </button>

          <div className="login-info">
            <h3>Demo Credentials</h3>
            <p><strong>Username:</strong> john.doe</p>
            <p><strong>Password:</strong> password (or your setup password)</p>
          </div>

          <div className="login-features">
            <h3>Features</h3>
            <ul>
              <li>✨ Manage Users</li>
              <li>📦 Manage Products</li>
              <li>📋 Manage Orders</li>
              <li>🔒 Secure API Access</li>
            </ul>
          </div>
        </div>

        <div className="login-footer">
          <p className="text-muted">Powered by Keycloak</p>
        </div>
      </div>
    </div>
  )
}

export default Login
