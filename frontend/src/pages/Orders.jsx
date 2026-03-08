import { useState, useEffect } from 'react'
import Modal from '../components/Modal'
import LoadingSpinner from '../components/LoadingSpinner'
import { ordersAPI } from '../services/api'
import './Orders.css'

function Orders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({
    user_id: '',
    product_id: '',
    quantity: '',
    total_price: '',
    status: 'pending'
  })

  const statuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']

  const fetchOrders = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await ordersAPI.getAll()
      setOrders(response.data)
    } catch (err) {
      setError('Failed to fetch orders: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  const handleOpenModal = (order = null) => {
    if (order) {
      setEditingId(order.id)
      setFormData({
        user_id: order.user_id,
        product_id: order.product_id,
        quantity: order.quantity,
        total_price: order.total_price,
        status: order.status
      })
    } else {
      setEditingId(null)
      setFormData({
        user_id: '',
        product_id: '',
        quantity: '',
        total_price: '',
        status: 'pending'
      })
    }
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingId(null)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'user_id' || name === 'product_id' || name === 'quantity' ? parseInt(value) || '' : 
              name === 'total_price' ? parseFloat(value) || '' : value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (editingId) {
        await ordersAPI.update(editingId, formData)
      } else {
        await ordersAPI.create(formData)
      }
      await fetchOrders()
      handleCloseModal()
    } catch (err) {
      setError('Failed to save order: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this order?')) {
      setLoading(true)
      setError(null)
      try {
        await ordersAPI.delete(id)
        await fetchOrders()
      } catch (err) {
        setError('Failed to delete order: ' + err.message)
      } finally {
        setLoading(false)
      }
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      pending: '#f59e0b',
      processing: '#3b82f6',
      shipped: '#8b5cf6',
      delivered: '#10b981',
      cancelled: '#ef4444'
    }
    return colors[status] || '#6b7280'
  }

  return (
    <div className="orders-page">
      <div className="page-header">
        <h1>Orders Management</h1>
        <button className="btn-primary" onClick={() => handleOpenModal()}>
          + New Order
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading && !orders.length ? (
        <LoadingSpinner />
      ) : (
        <div className="table-container">
          {orders.length === 0 ? (
            <div className="empty-state">
              <p>No orders found. Create your first order!</p>
            </div>
          ) : (
            <table className="orders-table">
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>User ID</th>
                  <th>Product ID</th>
                  <th>Quantity</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order.id}>
                    <td>
                      <span className="order-number">{order.order_number}</span>
                    </td>
                    <td>{order.user_id}</td>
                    <td>{order.product_id}</td>
                    <td className="quantity-cell">{order.quantity}</td>
                    <td className="price-cell">${order.total_price.toFixed(2)}</td>
                    <td>
                      <span 
                        className="status-badge"
                        style={{ backgroundColor: getStatusColor(order.status) + '20', color: getStatusColor(order.status) }}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="actions-cell">
                      <button 
                        className="btn-small btn-edit" 
                        onClick={() => handleOpenModal(order)}
                      >
                        ✎ Edit
                      </button>
                      <button 
                        className="btn-small btn-delete" 
                        onClick={() => handleDelete(order.id)}
                      >
                        🗑 Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      <Modal 
        isOpen={isModalOpen} 
        title={editingId ? 'Edit Order' : 'New Order'}
        onClose={handleCloseModal}
      >
        <form onSubmit={handleSubmit} className="form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="user_id">User ID *</label>
              <input
                id="user_id"
                type="number"
                name="user_id"
                value={formData.user_id}
                onChange={handleInputChange}
                required
                min="1"
                placeholder="1"
              />
            </div>
            <div className="form-group">
              <label htmlFor="product_id">Product ID *</label>
              <input
                id="product_id"
                type="number"
                name="product_id"
                value={formData.product_id}
                onChange={handleInputChange}
                required
                min="1"
                placeholder="1"
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="quantity">Quantity *</label>
              <input
                id="quantity"
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleInputChange}
                required
                min="1"
                placeholder="1"
              />
            </div>
            <div className="form-group">
              <label htmlFor="total_price">Total Price *</label>
              <input
                id="total_price"
                type="number"
                name="total_price"
                value={formData.total_price}
                onChange={handleInputChange}
                required
                step="0.01"
                min="0"
                placeholder="0.00"
              />
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="status">Status *</label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              required
            >
              {statuses.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={handleCloseModal}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Saving...' : 'Save Order'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default Orders
