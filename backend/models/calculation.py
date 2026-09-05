from datetime import datetime, UTC
from typing import Optional
from sqlalchemy import Integer, String, Float, DateTime
from sqlalchemy.orm import Mapped, mapped_column
from db.database import Base


class Calculation(Base):
    __tablename__ = "calculations"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    operation: Mapped[str] = mapped_column(String, nullable=False)
    operand_a: Mapped[float] = mapped_column(Float, nullable=False)
    operand_b: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    result: Mapped[float] = mapped_column(Float, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(UTC))
