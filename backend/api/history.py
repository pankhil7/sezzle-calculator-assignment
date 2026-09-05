from fastapi import APIRouter, Depends
from loguru import logger
from db.database import get_repository
from db.repository import CalculationRepository
from models.response import HistoryItem

router = APIRouter(prefix="/api")


@router.get("/history", response_model=list[HistoryItem])
async def get_history(repo: CalculationRepository = Depends(get_repository)):
    logger.info("Fetching calculation history")
    items = await repo.get_all()
    logger.info(f"Returning {len(items)} history items")
    return items


@router.delete("/history")
async def clear_history(repo: CalculationRepository = Depends(get_repository)):
    logger.info("Clearing calculation history")
    await repo.delete_all()
    return {"message": "History cleared"}
