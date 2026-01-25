from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
import models
from database import engine, get_db
from api.v1.users import router as users_router

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="User Microservice")
app.include_router(users_router)
