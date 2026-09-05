import pytest
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import delete
from main import app
from db.database import init_db, engine
from models.calculation import Calculation


@pytest.fixture(autouse=True)
async def setup_db():
    await init_db()
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    async with async_session() as session:
        await session.execute(delete(Calculation))
        await session.commit()


@pytest.fixture
def client():
    return AsyncClient(transport=ASGITransport(app=app), base_url="http://test")
