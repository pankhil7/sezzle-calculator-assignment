from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class CalculationResponse(BaseModel):
    operation: str
    operand_a: float
    operand_b: Optional[float] = None
    result: float


class HistoryItem(BaseModel):
    id: int
    operation: str
    operand_a: float
    operand_b: Optional[float] = None
    result: float
    created_at: datetime

    model_config = {"from_attributes": True}
