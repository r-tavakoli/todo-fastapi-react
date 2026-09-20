from typing import Annotated

from fastapi import BackgroundTasks, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import InvalidTokenException
from app.core.security import oauth2_scheme
from app.db.postgres import get_db
from app.db.redis import jti_is_blacklisted
from app.models.user import User
from app.services.notification import NotificationService
from app.services.task import TaskService
from app.services.user import UserService
from app.utils import decode_access_token

# session
SessionDep = Annotated[AsyncSession, Depends(get_db)]

# notification
def get_notification_service(
    background_tasks: BackgroundTasks,
) -> NotificationService:
    return NotificationService(background_tasks)

NotificationDep = Annotated[NotificationService, Depends(get_notification_service)]

# task
def get_task_service(
    session: SessionDep,
) -> TaskService:
    return TaskService(session)

# user
def get_user_service(
    session: SessionDep,
    notification: NotificationDep
) -> UserService:
    return UserService(session, notification)

# access token dependency
async def get_access_token(
    token: Annotated[str, Depends(oauth2_scheme)]
) -> dict:
    data = decode_access_token(token)

    if data is None or await jti_is_blacklisted(data["user"]["jti"]):
        raise InvalidTokenException()
    
    return data

# authentication
async def get_authenticated_user(
    token_data: Annotated[dict, Depends(get_access_token)], 
    session: SessionDep
):
    return await session.get(User, token_data["user"]["id"])

# dependencies
TaskServiceDep = Annotated[TaskService, Depends(get_task_service)]
UserServiceDep = Annotated[UserService, Depends(get_user_service)]
CurrentUserDep = Annotated[User, Depends(get_authenticated_user)]