import json
from fastapi import Query

# ... existing imports/code ...

@router.get("/", response_model=list[schemas.User])
async def read_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), redis=Depends(get_redis)):
    cache_key = f"users:{skip}:{limit}"
    cached = await redis.get(cache_key)
    if cached:
        return json.loads(cached)
    users = crud.get_users(db)
    users_slice = users[skip:skip+limit]
    await redis.setex(cache_key, 60, json.dumps([u.__dict__ for u in users_slice]))
    return users_slice
