from fastapi import APIRouter, Depends, HTTPException, Query
from loguru import logger
from db.database import get_repository
from db.repository import CalculationRepository
from models.request import BinaryInput
from models.response import CalculationResponse
from util.validators import validate_numbers, validate_result, round_result

router = APIRouter(prefix="/api")


@router.post("/subtract", response_model=CalculationResponse)
async def subtract(body: BinaryInput, persist: bool = Query(True), repo: CalculationRepository = Depends(get_repository)):
    logger.info(f"subtract: a={body.a} b={body.b} persist={persist}")
    try:
        validate_numbers(body.a, body.b)
        result = round_result(body.a - body.b)
        validate_result(result)
    except ValueError as exc:
        logger.warning(f"subtract validation error: {exc}")
        raise HTTPException(status_code=400, detail=str(exc))
    await repo.save("subtract", body.a, result, body.b, persist=persist)
    logger.info(f"subtract: result={result}")
    return CalculationResponse(operation="subtract", operand_a=body.a, operand_b=body.b, result=result)
