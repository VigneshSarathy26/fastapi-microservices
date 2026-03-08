import { Link } from 'react-router-dom'
import './Dashboard.css'

function Dashboard() {
  return (
    <div className="dashboard">
      <h1>Microservices Dashboard</h1>
      <p className="subtitle">Manage your microservices from a single interface</p>
      
      <div className="services-grid">
        <Link to="/users" className="service-card users-card">
          <div className="card-icon">👥</div>
          <h2>Users Service</h2>
          <p>Manage user accounts and authentication</p>
          <div className="card-details">
            <span className="port">Port 8000</span>
            <span className="type">FastAPI</span>
          </div>
        </Link>

        <Link to="/products" className="service-card products-card">
          <div className="card-icon">📦</div>
          <h2>Products Service</h2>
          <p>Manage product catalog and inventory</p>
          <div className="card-details">
            <span className="port">Port 8001</span>
            <span className="type">FastAPI</span>
          </div>
        </Link>

        <Link to="/orders" className="service-card orders-card">
          <div className="card-icon">📋</div>
          <h2>Orders Service</h2>
          <p>Manage orders and order status</p>
          <div className="card-details">
            <span className="port">Port 8002</span>
            <span className="type">FastAPI</span>
          </div>
        </Link>
      </div>

      <div className="info-section">
        <h3>Architecture Overview</h3>
        <div className="info-cards">
          <div className="info-card">
            <h4>🏗️ Architecture</h4>
            <p>Microservices architecture with independent services, databases, and caching layers</p>
          </div>
          <div className="info-card">
            <h4>🗄️ Database</h4>
            <p>PostgreSQL for each service with isolated schemas</p>
          </div>
          <div className="info-card">
            <h4>⚡ Caching</h4>
            <p>Redis instances for performance optimization</p>
          </div>
          <div className="info-card">
            <h4>🐳 Deployment</h4>
            <p>Docker containerized services with Docker Compose orchestration</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
