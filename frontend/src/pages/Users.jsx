import { useState, useEffect } from 'react'
import Modal from '../components/Modal'
import LoadingSpinner from '../components/LoadingSpinner'
import { usersAPI } from '../services/api'
import './Users.css'

function Users() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({
    email: '',
    full_name: '',
    password: ''
  })

  const fetchUsers = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await usersAPI.getAll()
      setUsers(response.data)
    } catch (err) {
      setError('Failed to fetch users: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const handleOpenModal = (user = null) => {
    if (user) {
      setEditingId(user.id)
      setFormData({
        email: user.email,
        full_name: user.full_name,
        password: ''
      })
    } else {
      setEditingId(null)
      setFormData({ email: '', full_name: '', password: '' })
    }
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingId(null)
    setFormData({ email: '', full_name: '', password: '' })
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (editingId) {
        await usersAPI.update(editingId, formData)
      } else {
        await usersAPI.create(formData)
      }
      await fetchUsers()
      handleCloseModal()
    } catch (err) {
      setError('Failed to save user: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      setLoading(true)
      setError(null)
      try {
        await usersAPI.delete(id)
        await fetchUsers()
      } catch (err) {
        setError('Failed to delete user: ' + err.message)
      } finally {
        setLoading(false)
      }
    }
  }

  return (
    <div className="users-page">
      <div className="page-header">
        <h1>Users Management</h1>
        <button className="btn-primary" onClick={() => handleOpenModal()}>
          + New User
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading && !users.length ? (
        <LoadingSpinner />
      ) : (
        <div className="users-container">
          {users.length === 0 ? (
            <div className="empty-state">
              <p>No users found. Create your first user!</p>
            </div>
          ) : (
            <div className="users-grid">
              {users.map(user => (
                <div key={user.id} className="user-card">
                  <div className="card-content">
                    <h3>{user.full_name}</h3>
                    <p className="email">{user.email}</p>
                    <div className="status">
                      <span className={`badge ${user.is_active ? 'active' : 'inactive'}`}>
                        {user.is_active ? '✓ Active' : '✗ Inactive'}
                      </span>
                    </div>
                  </div>
                  <div className="card-actions">
                    <button 
                      className="btn-edit" 
                      onClick={() => handleOpenModal(user)}
                    >
                      Edit
                    </button>
                    <button 
                      className="btn-delete" 
                      onClick={() => handleDelete(user.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <Modal 
        isOpen={isModalOpen} 
        title={editingId ? 'Edit User' : 'New User'}
        onClose={handleCloseModal}
      >
        <form onSubmit={handleSubmit} className="form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              placeholder="user@example.com"
            />
          </div>
          <div className="form-group">
            <label htmlFor="full_name">Full Name</label>
            <input
              id="full_name"
              type="text"
              name="full_name"
              value={formData.full_name}
              onChange={handleInputChange}
              required
              placeholder="John Doe"
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password {editingId && '(leave empty to keep current)'}</label>
            <input
              id="password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required={!editingId}
              placeholder="Enter password"
            />
          </div>
          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={handleCloseModal}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Saving...' : 'Save User'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default Users
