import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { initKeycloak } from './services/auth'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Users from './pages/Users'
import Products from './pages/Products'
import Orders from './pages/Orders'
import './App.css'

function App() {
  const [isInitializing, setIsInitializing] = useState(true)
  const [initError, setInitError] = useState(null)

  useEffect(() => {
    const initAuth = async () => {
      try {
        await initKeycloak()
      } catch (error) {
        console.error('Failed to initialize authentication:', error)
        setInitError(error.message)
      } finally {
        setIsInitializing(false)
      }
    }

    initAuth()
  }, [])

  if (isInitializing) {
    return (
      <div className="app-loading">
        <div className="loading-spinner"></div>
        <p>Loading authentication...</p>
      </div>
    )
  }

  if (initError) {
    return (
      <div className="app-error">
        <h2>Authentication Error</h2>
        <p>{initError}</p>
        <p>Please check that Keycloak is running on {import.meta.env.VITE_KEYCLOAK_URL}</p>
      </div>
    )
  }

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <>
                <Navbar />
                <div className="app-container">
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/users" element={<Users />} />
                    <Route path="/products" element={<Products />} />
                    <Route path="/orders" element={<Orders />} />
                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                  </Routes>
                </div>
              </>
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  )
}

export default App
