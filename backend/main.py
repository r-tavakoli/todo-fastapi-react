from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI
from scalar_fastapi import get_scalar_api_reference
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import text

from backend.api.v1.router import v1_router
from backend.db.postgres import get_db


# @asynccontextmanager
# async def lifespan_handler(app: FastAPI):
#     await create_tables()
#     yield

app = FastAPI(
    title="ToDo App",
    description="Lets do our tasks faster!",
    docs_url=None,
    # lifespan=lifespan_handler,
)

app.include_router(v1_router)

@app.get('/')
def get_me():
    return {}

@app.get("/health/db")
async def get_health_db_check(session: AsyncSession = Depends(get_db)):
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