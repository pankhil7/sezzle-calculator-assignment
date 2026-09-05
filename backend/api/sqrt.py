import math
from fastapi import APIRouter, Depends, HTTPException, Query
from loguru import logger
from db.database import get_repository
from db.repository import CalculationRepository
from models.request import UnaryInput
from models.response import CalculationResponse
from util.validators import validate_numbers, validate_result, round_result

router = APIRouter(prefix="/api")


@router.post("/sqrt", response_model=CalculationResponse)
async def sqrt(body: UnaryInput, persist: bool = Query(True), repo: CalculationRepository = Depends(get_repository)):
    logger.info(f"sqrt: a={body.a} persist={persist}")
    try:
        validate_numbers(body.a)
        if body.a < 0:
            logger.warning(f"sqrt: negative input a={body.a}")
            raise ValueError("Cannot take square root of a negative number")
        result = round_result(math.sqrt(body.a))
        validate_result(result)
    except ValueError as exc:
        logger.warning(f"sqrt validation error: {exc}")
        raise HTTPException(status_code=400, detail=str(exc))
    if persist:
        await repo.save("sqrt", body.a, result)
    logger.info(f"sqrt: result={result}")
    return CalculationResponse(operation="sqrt", operand_a=body.a, result=result)
