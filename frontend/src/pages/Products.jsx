import { useState, useEffect } from 'react'
import Modal from '../components/Modal'
import LoadingSpinner from '../components/LoadingSpinner'
import { productsAPI } from '../services/api'
import './Products.css'

function Products() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock_quantity: '',
    sku: ''
  })

  const fetchProducts = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await productsAPI.getAll()
      setProducts(response.data)
    } catch (err) {
      setError('Failed to fetch products: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  const handleOpenModal = (product = null) => {
    if (product) {
      setEditingId(product.id)
      setFormData({
        name: product.name,
        description: product.description || '',
        price: product.price,
        stock_quantity: product.stock_quantity,
        sku: product.sku
      })
    } else {
      setEditingId(null)
      setFormData({
        name: '',
        description: '',
        price: '',
        stock_quantity: '',
        sku: ''
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
      [name]: name === 'price' || name === 'stock_quantity' ? parseFloat(value) || '' : value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (editingId) {
        await productsAPI.update(editingId, formData)
      } else {
        await productsAPI.create(formData)
      }
      await fetchProducts()
      handleCloseModal()
    } catch (err) {
      setError('Failed to save product: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      setLoading(true)
      setError(null)
      try {
        await productsAPI.delete(id)
        await fetchProducts()
      } catch (err) {
        setError('Failed to delete product: ' + err.message)
      } finally {
        setLoading(false)
      }
    }
  }

  return (
    <div className="products-page">
      <div className="page-header">
        <h1>Products Management</h1>
        <button className="btn-primary" onClick={() => handleOpenModal()}>
          + New Product
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading && !products.length ? (
        <LoadingSpinner />
      ) : (
        <div className="table-container">
          {products.length === 0 ? (
            <div className="empty-state">
              <p>No products found. Add your first product!</p>
            </div>
          ) : (
            <table className="products-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>SKU</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map(product => (
                  <tr key={product.id}>
                    <td>
                      <div className="product-name">
                        <span className="name-text">{product.name}</span>
                        {product.description && (
                          <span className="description">{product.description}</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className="sku-badge">{product.sku}</span>
                    </td>
                    <td className="price-cell">${product.price.toFixed(2)}</td>
                    <td className="stock-cell">
                      <span className={`stock-badge ${product.stock_quantity > 0 ? 'in-stock' : 'out-of-stock'}`}>
                        {product.stock_quantity} units
                      </span>
                    </td>
                    <td className="actions-cell">
                      <button 
                        className="btn-small btn-edit" 
                        onClick={() => handleOpenModal(product)}
                      >
                        ✎ Edit
                      </button>
                      <button 
                        className="btn-small btn-delete" 
                        onClick={() => handleDelete(product.id)}
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
        title={editingId ? 'Edit Product' : 'New Product'}
        onClose={handleCloseModal}
      >
        <form onSubmit={handleSubmit} className="form">
          <div className="form-group">
            <label htmlFor="name">Product Name *</label>
            <input
              id="name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              placeholder="e.g., Laptop"
            />
          </div>
          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Product description..."
              rows={3}
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="sku">SKU *</label>
              <input
                id="sku"
                type="text"
                name="sku"
                value={formData.sku}
                onChange={handleInputChange}
                required
                placeholder="e.g., SKU-001"
              />
            </div>
            <div className="form-group">
              <label htmlFor="price">Price *</label>
              <input
                id="price"
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                required
                step="0.01"
                min="0"
                placeholder="0.00"
              />
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="stock_quantity">Stock Quantity *</label>
            <input
              id="stock_quantity"
              type="number"
              name="stock_quantity"
              value={formData.stock_quantity}
              onChange={handleInputChange}
              required
              min="0"
              placeholder="0"
            />
          </div>
          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={handleCloseModal}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Saving...' : 'Save Product'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default Products
