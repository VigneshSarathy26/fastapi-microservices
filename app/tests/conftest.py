import os
import pytest

# --- CRITICAL FIX: Set Env Var BEFORE importing app modules ---
# This ensures database.py sees the variable when it initializes.
os.environ["DATABASE_URL"] = "sqlite:///./test.db"

from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import pytest_asyncio # Make sure this is installed

# Imports from your app must come AFTER setting the env var
from app.main import app
from app.database import Base, get_db
from app.redis import get_redis

# Create the engine using the Env Var we just set
# check_same_thread=False is needed for SQLite to work across request threads
test_engine = create_engine(
    os.environ["DATABASE_URL"], 
    connect_args={"check_same_thread": False}
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)

@pytest.fixture(scope="function")
def session():
    """
    Creates a fresh database for every test function.
    """
    # Create tables
    Base.metadata.create_all(bind=test_engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        # Drop tables after test to ensure clean slate
        Base.metadata.drop_all(bind=test_engine)

@pytest.fixture(scope="module")
def client():
    # We use a context manager to trigger startup/shutdown events if you have them
    with TestClient(app) as c:
        yield c

@pytest.fixture(scope="function")
def override_get_db(session):
    """
    Overrides the get_db dependency to use the temporary test session.
    """
    def _override_get_db():
        try:
            yield session
        finally:
            # Session is closed in the session fixture, but we yield it here
            pass
    app.dependency_overrides[get_db] = _override_get_db
    yield
    app.dependency_overrides.pop(get_db, None)

@pytest_asyncio.fixture(scope="function")
async def mock_redis():
    """
    Simple async in-memory fake Redis for testing.
    This avoids compatibility issues with redis/fakeredis async internals.
    """
    class SimpleFakeRedis:
        def __init__(self):
            self._store = {}

        async def get(self, key):
            return self._store.get(key)

        async def set(self, key, value):
            self._store[key] = value

        async def setex(self, key, seconds, value):
            self._store[key] = value

        async def aclose(self):
            # No-op for compatibility
            pass

    fake_redis = SimpleFakeRedis()

    # Define an async override to match the async nature of Redis interaction
    async def _override_get_redis():
        return fake_redis

    app.dependency_overrides[get_redis] = _override_get_redis
    yield fake_redis

    # Cleanup
    app.dependency_overrides.pop(get_redis, None)
    await fake_redis.aclose()

@pytest.fixture(autouse=True)
def setup_overrides(override_get_db, mock_redis):
    """
    Auto-apply overrides for all tests.
    This fixture requests the other two, ensuring they run.
    """
    pass