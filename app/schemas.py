from pydantic import BaseModel, EmailStr

# 1. Base Schema (Shared properties)
# Used as a parent class for everything else to avoid repetition.
class UserBase(BaseModel):
    email: EmailStr  # Validates that it's an actual email format
    name: str | None = None  # Optional, defaults to None

# 2. Create Schema (Input)
# What we expect the user to send via POST. 
# We require a password here, but we NEVER return it in the response.
class UserCreate(UserBase):
    password: str

# 3. Response Schema (Output)
# What we return to the user. Includes ID and system flags.
class User(UserBase):
    id: int
    is_active: bool = True

    # This allows Pydantic to read data from SQLAlchemy models
    class Config:
        from_attributes = True  # Use 'orm_mode = True' if using Pydantic v1