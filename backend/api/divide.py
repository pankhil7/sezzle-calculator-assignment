from fastapi import APIRouter, Depends, HTTPException, Query
from loguru import logger
from db.database import get_repository
from db.repository import CalculationRepository
from models.request import BinaryInput
from models.response import CalculationResponse
from util.validators import validate_numbers, validate_result, round_result

router = APIRouter(prefix="/api")


@router.post("/divide", response_model=CalculationResponse)
async def divide(body: BinaryInput, persist: bool = Query(True), repo: CalculationRepository = Depends(get_repository)):
    logger.info(f"divide: a={body.a} b={body.b} persist={persist}")
    try:
        validate_numbers(body.a, body.b)
        if body.b == 0:
            logger.warning("divide: attempted division by zero")
            raise ValueError("Division by zero")
        result = round_result(body.a / body.b)
        validate_result(result)
    except ValueError as exc:
        logger.warning(f"divide validation error: {exc}")
        raise HTTPException(status_code=400, detail=str(exc))
    await repo.save("divide", body.a, result, body.b, persist=persist)
    logger.info(f"divide: result={result}")
    return CalculationResponse(operation="divide", operand_a=body.a, operand_b=body.b, result=result)
