from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from loguru import logger
from db.database import init_db
from api.routes import router


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting Calculator API — initializing database")
    await init_db()
    logger.info("Database ready. Server is up.")
    yield
    logger.info("Shutting down Calculator API")


app = FastAPI(title="Calculator API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def log_requests(request: Request, call_next):
    logger.info(f"→ {request.method} {request.url.path}")
    response = await call_next(request)
    logger.info(f"← {request.method} {request.url.path} {response.status_code}")
    return response


app.include_router(router)
