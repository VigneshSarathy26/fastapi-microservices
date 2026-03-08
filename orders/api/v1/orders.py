from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from orders import crud, schemas
from orders.database import get_db
from orders.redis import get_cache, set_cache, delete_cache

router = APIRouter()


@router.get("/", response_model=list[schemas.Order])
def list_orders(skip: int = 0, limit: int = 10, db: Session = Depends(get_db)):
    """List all orders with pagination"""
    orders = crud.get_orders(db, skip=skip, limit=limit)
    return orders


@router.get("/user/{user_id}", response_model=list[schemas.Order])
def get_user_orders(user_id: int, skip: int = 0, limit: int = 10, db: Session = Depends(get_db)):
    """Get all orders for a specific user"""
    orders = crud.get_orders_by_user(db, user_id, skip=skip, limit=limit)
    return orders


@router.get("/{order_id}", response_model=schemas.Order)
def get_order(order_id: int, db: Session = Depends(get_db)):
    """Get an order by ID"""
    cache_key = f"order:{order_id}"
    cached = get_cache(cache_key)
    if cached:
        return cached

    order = crud.get_order(db, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    set_cache(cache_key, schemas.Order.model_validate(order).model_dump())
    return order


@router.post("/", response_model=schemas.Order)
def create_order(order: schemas.OrderCreate, db: Session = Depends(get_db)):
    """Create a new order"""
    new_order = crud.create_order(db, order)
    return new_order


@router.put("/{order_id}", response_model=schemas.Order)
def update_order(order_id: int, order_update: schemas.OrderUpdate, db: Session = Depends(get_db)):
    """Update an order"""
    order = crud.update_order(db, order_id, order_update)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    cache_key = f"order:{order_id}"
    delete_cache(cache_key)
    return order


@router.delete("/{order_id}")
def delete_order(order_id: int, db: Session = Depends(get_db)):
    """Delete an order"""
    order = crud.delete_order(db, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    cache_key = f"order:{order_id}"
    delete_cache(cache_key)
    return {"message": "Order deleted successfully"}
