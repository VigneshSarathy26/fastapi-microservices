import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import os
from app.main import app
from app.database import Base, get_db
from app.redis import redis_client, get_redis
import fakeredis.aioredis  # For mocking [web:28]

os.environ["DATABASE_URL"] = "sqlite:///./test.db"  # In-mem unit DB
TEST_DATABASE_URL = os.getenv("TEST_DATABASE_URL", "sqlite:///./test.db")
test_engine = create_engine(TEST_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)

@pytest.fixture(scope="function")
def session():
    Base.metadata.drop_all(bind=test_engine)
    Base.metadata.create_all(bind=test_engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=test_engine)

@pytest.fixture(scope="module")
def client():
    return TestClient(app)

@pytest.fixture(scope="function")
def override_get_db(session):
    def _override_get_db():
        try:
            yield session
        finally:
            session.close()
    app.dependency_overrides[get_db] = _override_get_db
    yield
    app.dependency_overrides.pop(get_db, None)

@pytest_asyncio.fixture(scope="function")
async def mock_redis():
    """Async fakeredis mock for Redis dependency."""
    fake_redis = fakeredis.aioredis.FakeRedis(decode_responses=True)
    
    def _override_get_redis():
        return fake_redis  # Sync ctx mgr yields fake [web:28][web:32]
    
    app.dependency_overrides[get_redis] = _override_get_redis
    yield fake_redis
    app.dependency_overrides.pop(get_redis, None)
    await fake_redis.close()

@pytest.fixture(autouse=True)
def setup_overrides(override_get_db, mock_redis):
    """Auto-apply overrides for integration tests."""
    pass
