from collections.abc import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncEngine, AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker
from sqlmodel import SQLModel

from backend.config import db_settings

_engine: AsyncEngine | None = None
_sessionmaker: sessionmaker | None = None

def get_engine() -> AsyncEngine:
    """Get or create connection singleton."""
    global _engine
    _engine = create_async_engine(
        url=db_settings.POSTGRE_URL,
        pool_pre_ping=True,
        echo=db_settings.DB_ECHO,
        pool_size=db_settings.DB_POOL_SIZE,
        max_overflow=db_settings.DB_MAX_OVERFLOW,
        pool_recycle=db_settings.DB_POOL_RECYCLE,
        pool_timeout=db_settings.DB_POOL_TIMEOUT,
    )
    return _engine

def get_sessionmaker() -> sessionmaker:
    """Get or create sessionmaker singleton."""
    global _sessionmaker
    if _sessionmaker is None:
        _sessionmaker = sessionmaker(
            bind=get_engine(),
            class_=AsyncSession,
            expire_on_commit=False,
        )
        
    return _sessionmaker

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """Get a session for production database."""
    async_session = get_sessionmaker()
    async with async_session() as session:
        try:
            yield session
        finally:
            await session.close()
            
# async def create_tables() -> None:
#     """Create all tables in models.""" 
#     engine = get_engine()  
#     async with engine.begin() as connection:
#         await connection.run_sync(SQLModel.matadata.createall)