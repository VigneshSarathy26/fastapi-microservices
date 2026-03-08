from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from products import crud, schemas, models
from products.database import get_db
from products.redis import get_cache, set_cache, delete_cache

router = APIRouter()


@router.get("/", response_model=list[schemas.Product])
def list_products(skip: int = 0, limit: int = 10, db: Session = Depends(get_db)):
    """List all products with pagination"""
    products = crud.get_products(db, skip=skip, limit=limit)
    return products


@router.get("/{product_id}", response_model=schemas.Product)
def get_product(product_id: int, db: Session = Depends(get_db)):
    """Get a product by ID"""
    cache_key = f"product:{product_id}"
    cached = get_cache(cache_key)
    if cached:
        return cached

    product = crud.get_product(db, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    set_cache(cache_key, schemas.Product.model_validate(product).model_dump())
    return product


@router.post("/", response_model=schemas.Product)
def create_product(product: schemas.ProductCreate, db: Session = Depends(get_db)):
    """Create a new product"""
    existing = crud.get_product_by_sku(db, product.sku)
    if existing:
        raise HTTPException(status_code=400, detail="SKU already exists")
    
    new_product = crud.create_product(db, product)
    return new_product


@router.put("/{product_id}", response_model=schemas.Product)
def update_product(product_id: int, product_update: schemas.ProductUpdate, db: Session = Depends(get_db)):
    """Update a product"""
    product = crud.update_product(db, product_id, product_update)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    cache_key = f"product:{product_id}"
    delete_cache(cache_key)
    return product


@router.delete("/{product_id}")
def delete_product(product_id: int, db: Session = Depends(get_db)):
    """Delete a product"""
    product = crud.delete_product(db, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    cache_key = f"product:{product_id}"
    delete_cache(cache_key)
    return {"message": "Product deleted successfully"}
