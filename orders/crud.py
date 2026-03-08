from sqlalchemy.orm import Session
from orders import models, schemas
from datetime import datetime
import uuid


def get_order(db: Session, order_id: int):
    return db.query(models.Order).filter(models.Order.id == order_id).first()


def get_order_by_number(db: Session, order_number: str):
    return db.query(models.Order).filter(models.Order.order_number == order_number).first()


def get_orders_by_user(db: Session, user_id: int, skip: int = 0, limit: int = 10):
    return db.query(models.Order).filter(models.Order.user_id == user_id).offset(skip).limit(limit).all()


def get_orders(db: Session, skip: int = 0, limit: int = 10):
    return db.query(models.Order).offset(skip).limit(limit).all()


def create_order(db: Session, order: schemas.OrderCreate):
    order_number = f"ORD-{datetime.now().strftime('%Y%m%d')}-{str(uuid.uuid4())[:8].upper()}"
    
    db_order = models.Order(
        user_id=order.user_id,
        product_id=order.product_id,
        quantity=order.quantity,
        total_price=order.total_price,
        order_number=order_number,
    )
    db.add(db_order)
    db.commit()
    db.refresh(db_order)
    return db_order


def update_order(db: Session, order_id: int, order_update: schemas.OrderUpdate):
    db_order = get_order(db, order_id)
    if not db_order:
        return None
    
    update_data = order_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_order, field, value)
    
    db.commit()
    db.refresh(db_order)
    return db_order


def delete_order(db: Session, order_id: int):
    db_order = get_order(db, order_id)
    if db_order:
        db.delete(db_order)
        db.commit()
    return db_order
