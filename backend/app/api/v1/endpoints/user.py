

from typing import Annotated

from fastapi import APIRouter, BackgroundTasks, Depends
from fastapi.security import OAuth2PasswordRequestForm

from app.api.dependencies import UserServiceDep, get_access_token
from app.db.redis import add_jti_to_blacklist
from app.schemas.user import (
    CreateUser,
    CreateUserResponse,
    LoginResponse,
    PasswordCredential,
    PasswordCredentialResponse,
)

router = APIRouter()
prefix = "/users"
tags = ["Users"]

router = APIRouter()


@router.post("/register")
async def register_user(
    create_user: CreateUser, 
    service: UserServiceDep
) -> CreateUserResponse:
    return await service.register_user(create_user)

@router.post("/send-login-pass-code")
async def send_login_pass_code(
    password_credential: PasswordCredential, 
    service: UserServiceDep,
    background_task: BackgroundTasks
) -> PasswordCredentialResponse:
    user_pass_code = await service.send_login_pass_code(password_credential)
    # cleanup expired OTPs
    background_task.add_task(service.consume_expired_passcodes, user_pass_code.id)
    return user_pass_code

@router.post("/login")
async def login(
    request_form: Annotated[OAuth2PasswordRequestForm, Depends()], 
    service: UserServiceDep
) -> LoginResponse:
    access_token = await service.login(request_form.username, request_form.password)
    return {"access_token": access_token}

@router.get("/logout")
async def logout(
    token_data: Annotated[dict, Depends(get_access_token)]
) -> dict[str, str]:
    await add_jti_to_blacklist(token_data["user"]["jti"])
    return {
        "detail": "Successfully logged out"
    }