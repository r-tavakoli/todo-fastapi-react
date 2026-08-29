from typing import Annotated

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.postgres import get_db
from app.services.task import TaskService

SessionDep = Annotated[AsyncSession, Depends(get_db)]

# task
def get_task_service(
    session: SessionDep,
) -> TaskService:
    return TaskService(session)

# dependencies
TaskServiceDep = Annotated[TaskService, Depends(get_task_service)]
