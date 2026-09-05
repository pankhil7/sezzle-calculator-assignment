from fastapi import APIRouter, Depends, HTTPException, Query
from loguru import logger
from db.database import get_repository
from db.repository import CalculationRepository
from models.request import BinaryInput
from models.response import CalculationResponse
from util.validators import validate_numbers, validate_result, round_result

router = APIRouter(prefix="/api")


@router.post("/multiply", response_model=CalculationResponse)
async def multiply(body: BinaryInput, persist: bool = Query(True), repo: CalculationRepository = Depends(get_repository)):
    logger.info(f"multiply: a={body.a} b={body.b} persist={persist}")
    try:
        validate_numbers(body.a, body.b)
        result = round_result(body.a * body.b)
        validate_result(result)
    except ValueError as exc:
        logger.warning(f"multiply validation error: {exc}")
        raise HTTPException(status_code=400, detail=str(exc))
    if persist:
        await repo.save("multiply", body.a, result, body.b)
    logger.info(f"multiply: result={result}")
    return CalculationResponse(operation="multiply", operand_a=body.a, operand_b=body.b, result=result)
