from fastapi import APIRouter, Depends, HTTPException, Query
from loguru import logger
from db.database import get_repository
from db.repository import CalculationRepository
from models.request import BinaryInput
from models.response import CalculationResponse
from util.validators import validate_numbers, validate_result, round_result

router = APIRouter(prefix="/api")


@router.post("/power", response_model=CalculationResponse)
async def power(body: BinaryInput, persist: bool = Query(True), repo: CalculationRepository = Depends(get_repository)):
    logger.info(f"power: a={body.a} b={body.b} persist={persist}")
    try:
        validate_numbers(body.a, body.b)
        if body.a < 0 and not float(body.b).is_integer():
            raise ValueError("Cannot raise a negative number to a fractional exponent")
        result = round_result(body.a ** body.b)
        validate_result(result)
    except ZeroDivisionError:
        logger.warning("power: zero cannot be raised to a negative power")
        raise HTTPException(status_code=400, detail="Zero cannot be raised to a negative power")
    except OverflowError:
        logger.warning("power overflow: result out of computable range")
        raise HTTPException(status_code=400, detail="Result is out of computable range")
    except ValueError as exc:
        logger.warning(f"power validation error: {exc}")
        raise HTTPException(status_code=400, detail=str(exc))
    if persist:
        await repo.save("power", body.a, result, body.b)
    logger.info(f"power: result={result}")
    return CalculationResponse(operation="power", operand_a=body.a, operand_b=body.b, result=result)
