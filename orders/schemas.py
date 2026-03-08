from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class OrderBase(BaseModel):
    user_id: int = Field(..., gt=0)
    product_id: int = Field(..., gt=0)
    quantity: int = Field(default=1, gt=0)
    total_price: float = Field(..., gt=0)


class OrderCreate(OrderBase):
    pass


class OrderUpdate(BaseModel):
    quantity: Optional[int] = None
    total_price: Optional[float] = None
    status: Optional[str] = None


class Order(OrderBase):
    id: int
    order_number: str
    status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
