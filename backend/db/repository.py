from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from loguru import logger
from models.calculation import Calculation


class CalculationRepository:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def save(
        self,
        operation: str,
        operand_a: float,
        result: float,
        operand_b: float | None = None,
        persist: bool = True,
    ) -> Calculation | None:
        if not persist:
            return None
        logger.debug(f"DB save: {operation}({operand_a}, {operand_b}) = {result}")
        record = Calculation(
            operation=operation,
            operand_a=operand_a,
            operand_b=operand_b,
            result=result,
        )
        self.db.add(record)
        await self.db.commit()
        await self.db.refresh(record)
        logger.debug(f"DB saved record id={record.id}")
        return record

    async def get_all(self, limit: int = 50) -> list[Calculation]:
        logger.debug(f"DB fetch history (limit={limit})")
        result = await self.db.execute(
            select(Calculation).order_by(Calculation.created_at.desc()).limit(limit)
        )
        rows = list(result.scalars().all())
        logger.debug(f"DB returned {len(rows)} history records")
        return rows

    async def delete_all(self) -> None:
        logger.info("DB deleting all history records")
        await self.db.execute(delete(Calculation))
        await self.db.commit()
        logger.info("DB history cleared")
