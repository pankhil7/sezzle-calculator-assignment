from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase

DATABASE_URL = "sqlite+aiosqlite:///./calculator.db"

engine = create_async_engine(DATABASE_URL, echo=False)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


class Base(DeclarativeBase):
    pass


async def get_repository():
    from db.repository import CalculationRepository
    async with AsyncSessionLocal() as session:
        yield CalculationRepository(session)


async def init_db():
    async with engine.begin() as conn:
        from models.calculation import Calculation  # noqa: F401
        await conn.run_sync(Base.metadata.create_all)
