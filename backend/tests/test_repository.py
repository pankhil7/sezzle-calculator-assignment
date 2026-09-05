import pytest
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from db.database import init_db
from db.repository import CalculationRepository


@pytest.fixture
async def repo():
    await init_db()
    engine = create_async_engine("sqlite+aiosqlite:///./calculator.db")
    session_factory = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    async with session_factory() as session:
        r = CalculationRepository(session)
        await r.delete_all()
        yield r
    await engine.dispose()


@pytest.mark.asyncio
async def test_save_and_retrieve(repo):
    record = await repo.save("add", 1.0, 3.0, 2.0)
    assert record.id is not None
    assert record.result == 3.0

    items = await repo.get_all()
    assert len(items) == 1
    assert items[0].operation == "add"
    assert items[0].operand_a == 1.0
    assert items[0].operand_b == 2.0


@pytest.mark.asyncio
async def test_save_unary_without_operand_b(repo):
    record = await repo.save("sqrt", 16.0, 4.0)
    assert record.operand_b is None
    items = await repo.get_all()
    assert items[0].operand_b is None


@pytest.mark.asyncio
async def test_get_all_returns_most_recent_first(repo):
    await repo.save("add", 1.0, 3.0, 2.0)
    await repo.save("multiply", 3.0, 12.0, 4.0)
    items = await repo.get_all()
    assert items[0].operation == "multiply"
    assert items[1].operation == "add"


@pytest.mark.asyncio
async def test_delete_all_clears_records(repo):
    await repo.save("add", 1.0, 3.0, 2.0)
    await repo.delete_all()
    items = await repo.get_all()
    assert items == []
