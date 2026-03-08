import { Link } from 'react-router-dom'
import UserMenu from './UserMenu'
import './Navbar.css'

function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          🚀 Microservices Dashboard
        </Link>
        <ul className="nav-menu">
          <li className="nav-item">
            <Link to="/" className="nav-link">Dashboard</Link>
          </li>
          <li className="nav-item">
            <Link to="/users" className="nav-link">Users</Link>
          </li>
          <li className="nav-item">
            <Link to="/products" className="nav-link">Products</Link>
          </li>
          <li className="nav-item">
            <Link to="/orders" className="nav-link">Orders</Link>
          </li>
        </ul>
        <div className="navbar-user">
          <UserMenu />
        </div>
      </div>
    </nav>
  )
}

export default Navbar
