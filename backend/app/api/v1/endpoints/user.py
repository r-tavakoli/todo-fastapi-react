

from fastapi import APIRouter

from app.api.dependencies import UserServiceDep
from app.schemas.user import (
    CreateUser,
    CreateUserResponse,
    LoginUser,
    LoginUserResponse,
)

router = APIRouter()
prefix = "/users"
tags = ["Users"]

router = APIRouter()


@router.post("/register")
async def register_user(create_task: CreateUser, service: UserServiceDep) -> CreateUserResponse:
    return await service.register_user(create_task)

@router.post("/send_login_code")
async def send_login_code(credential: LoginUser, service: UserServiceDep) -> LoginUserResponse:
    return await service.send_login_code(credential)