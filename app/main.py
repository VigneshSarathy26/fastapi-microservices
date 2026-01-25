from fastapi import FastAPI
from app import models
from app.database import engine
from app.v1.users import router as users_router

# --- ADD THIS TEMPORARY LINE ---
# This deletes the table so it can be recreated with the new columns
models.Base.metadata.drop_all(bind=engine) 
# -------------------------------

# Create tables (now that they are gone, this will create them fresh)
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="User Microservice")
app.include_router(users_router, prefix="/api/v1/users", tags=["users"])