from typing import Annotated

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from backend.db.postgres import get_db

SessionDep = Annotated[AsyncSession, Depends(get_db)]