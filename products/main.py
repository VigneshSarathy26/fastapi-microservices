from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from products import models
from products.database import engine
from products.api.v1.products import router as products_router

# Create tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Product Microservice")

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
        "service": "Product Microservice",
        "version": "1.0.0",
        "endpoints": {
            "health": "/",
            "products": "/api/v1/products",
            "docs": "/docs"
        }
    }

app.include_router(products_router, prefix="/api/v1/products", tags=["products"])
