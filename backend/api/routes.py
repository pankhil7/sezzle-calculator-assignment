from fastapi import APIRouter
from api.add import router as add_router
from api.subtract import router as subtract_router
from api.multiply import router as multiply_router
from api.divide import router as divide_router
from api.power import router as power_router
from api.sqrt import router as sqrt_router
from api.percent import router as percent_router
from api.history import router as history_router

router = APIRouter()
router.include_router(add_router)
router.include_router(subtract_router)
router.include_router(multiply_router)
router.include_router(divide_router)
router.include_router(power_router)
router.include_router(sqrt_router)
router.include_router(percent_router)
router.include_router(history_router)
