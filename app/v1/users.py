import json
from fastapi import APIRouter, Depends, Query, HTTPException # <--- Added HTTPException
from fastapi.encoders import jsonable_encoder
from sqlalchemy.orm import Session
from app import crud, schemas
from app.database import get_db
from app.redis import get_redis

router = APIRouter()

# --- EXISTING GET ENDPOINT ---
@router.get("/", response_model=list[schemas.User])
async def read_users(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db), 
    redis=Depends(get_redis)
):
    cache_key = f"users:{skip}:{limit}"
    
    # 1. Check Cache
    cached = await redis.get(cache_key)
    if cached:
        return json.loads(cached)
    
    # 2. Database Fetch
    users = crud.get_users(db, skip=skip, limit=limit)
    
    # 3. Serialize and Cache
    users_data = jsonable_encoder(users)
    await redis.setex(cache_key, 60, json.dumps(users_data))
    
    return users

# --- NEW POST ENDPOINT (ADD THIS) ---
@router.post("/", response_model=schemas.User)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = crud.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    return crud.create_user(db=db, user=user)