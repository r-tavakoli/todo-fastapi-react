from contextlib import asynccontextmanager

from app.api.v1.dependencies import SessionDep
from app.api.v1.router import v1_router
from app.config import app_settings
from app.db.postgres import create_tables
from app.db.seed import seed_database
from fastapi import FastAPI
from scalar_fastapi import get_scalar_api_reference
from sqlmodel import text


@asynccontextmanager
async def lifespan_handler(app: FastAPI):
    await create_tables()
    await seed_database()
    yield

app = FastAPI(
    title=app_settings.APP_NAME,
    description="Lets do our tasks faster!",
    docs_url=None,
    lifespan=lifespan_handler,
)

app.include_router(v1_router)

@app.get('/')
def get_me():
    return {}

@app.get("/health/db")
async def get_health_db_check(session: SessionDep):
    try:
        await session.execute(text("SELECT 1"))
        return {"database": "connected"}
    except Exception as e:
        return {"database error": f"{str(e)}"}
        
@app.get("/docs", include_in_schema=False)
def get_scalar_docs():
    return get_scalar_api_reference(
        openapi_url=app.openapi_url,
        title="Scalar API"
    )