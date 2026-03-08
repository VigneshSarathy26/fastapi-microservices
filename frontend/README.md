# Microservices React Frontend

A modern React application for managing microservices (Users, Products, Orders).

## Features

- 🎨 Modern, responsive UI built with React
- 🚀 Fast development with Vite
- 📱 Mobile-friendly design
- 🔄 Real-time CRUD operations
- 🌐 Multi-service integration
- 📊 Dashboard overview

## Project Structure

```
frontend/
├── src/
│   ├── pages/              # Page components
│   │   ├── Dashboard.jsx   # Main dashboard
│   │   ├── Users.jsx       # Users management
│   │   ├── Products.jsx    # Products management
│   │   └── Orders.jsx      # Orders management
│   ├── components/         # Reusable components
│   │   ├── Navbar.jsx
│   │   ├── Modal.jsx
│   │   └── LoadingSpinner.jsx
│   ├── services/          # API service layer
│   │   ├── api.js         # API endpoints
│   │   └── hooks.js       # Custom React hooks
│   ├── App.jsx            # Main app component
│   └── main.jsx           # Entry point
├── public/
│   └── index.html         # HTML template
├── package.json
└── vite.config.js
```

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create `.env.local` from `.env.example`:
```bash
cp .env.example .env.local
```

3. Update API base URL in `.env.local` if needed.

## Development

Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## Building

Build for production:
```bash
npm run build
```

Preview production build:
```bash
npm run preview
```

## Services Integration

### Users Service (Port 8000)
- List, create, update, delete users
- User authentication and profile management

### Products Service (Port 8001)
- Product catalog management
- Stock tracking
- SKU management

### Orders Service (Port 8002)
- Order creation and tracking
- Order status management
- User order history

## API Endpoints

The frontend connects to the following services:

- Users: `http://localhost:8000/api/v1/users`
- Products: `http://localhost:8001/api/v1/products`
- Orders: `http://localhost:8002/api/v1/orders`

## Components

### Pages
| Page | Route | Description |
|------|-------|-------------|
| Dashboard | / | Overview and service cards |
| Users | /users | User management interface |
| Products | /products | Product management interface |
| Orders | /orders | Order management interface |

### Shared Components
- **Navbar**: Navigation menu
- **Modal**: Reusable modal dialogs
- **LoadingSpinner**: Loading state indicator

### Services
- **api.js**: All API calls for CRUD operations
- **hooks.js**: Custom React hooks for async operations

## Styling

The project uses CSS modules and a modern, clean design system:
- Color scheme: Blues, Greens, and Neutrals
- Typography: System fonts
- Responsive grid layouts
- Smooth transitions and animations

## Deployment with Docker

Build Docker image:
```bash
docker build -t microservices-frontend .
```

Run container:
```bash
docker run -p 3000:3000 microservices-frontend
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Future Enhancements

- [ ] Authentication and JWT tokens
- [ ] Advanced filtering and search
- [ ] Pagination
- [ ] Data export (CSV/PDF)
- [ ] Real-time updates with WebSockets
- [ ] Dark mode
- [ ] Internationalization (i18n)
