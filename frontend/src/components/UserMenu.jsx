import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { logout, getUserInfo } from '../services/auth'
import './UserMenu.css'

const UserMenu = () => {
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)
  const userInfo = getUserInfo()

  const handleLogout = () => {
    logout()
  }

  if (!userInfo) {
    return null
  }

  return (
    <div className="user-menu">
      <button
        className="user-button"
        onClick={() => setIsOpen(!isOpen)}
        title={userInfo.email}
      >
        <span className="user-avatar">
          {userInfo.firstName?.[0]?.toUpperCase() || userInfo.username?.[0]?.toUpperCase() || 'U'}
        </span>
        <span className="user-name">{userInfo.firstName || userInfo.username}</span>
        <span className="menu-icon">▼</span>
      </button>

      {isOpen && (
        <div className="menu-dropdown">
          <div className="menu-header">
            <div className="user-info">
              <div className="user-name-full">
                {userInfo.firstName} {userInfo.lastName}
              </div>
              <div className="user-email">{userInfo.email}</div>
            </div>
          </div>

          <div className="menu-divider"></div>

          <div className="menu-item">
            <span className="label">User ID:</span>
            <span className="value">{userInfo.userId?.slice(0, 8)}...</span>
          </div>

          <div className="menu-item">
            <span className="label">Roles:</span>
            <span className="value">
              {userInfo.roles?.length > 0 ? userInfo.roles.join(', ') : 'No roles'}
            </span>
          </div>

          <div className="menu-divider"></div>

          <button className="menu-logout-btn" onClick={handleLogout}>
            🚪 Logout
          </button>
        </div>
      )}
    </div>
  )
}

export default UserMenu
