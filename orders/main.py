from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from orders import models
from orders.database import engine
from orders.api.v1.orders import router as orders_router

# Create tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Order Microservice")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    """Health check and API info"""
    return {
        "status": "healthy",
        "service": "Order Microservice",
        "version": "1.0.0",
        "endpoints": {
            "health": "/",
            "orders": "/api/v1/orders",
            "docs": "/docs"
        }
    }

app.include_router(orders_router, prefix="/api/v1/orders", tags=["orders"])
