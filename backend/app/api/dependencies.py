from typing import Annotated

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.postgres import get_db
from app.services.task import TaskService
from app.services.user import UserService

SessionDep = Annotated[AsyncSession, Depends(get_db)]

# task
def get_task_service(
    session: SessionDep,
) -> TaskService:
    return TaskService(session)

# user
def get_user_service(
    session: SessionDep,
) -> UserService:
    return UserService(session)

# dependencies
TaskServiceDep = Annotated[TaskService, Depends(get_task_service)]
UserServiceDep = Annotated[UserService, Depends(get_user_service)]