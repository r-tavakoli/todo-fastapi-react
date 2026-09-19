from datetime import datetime

from pydantic import BaseModel, EmailStr, Field

from .base import CreateResponse


class BaseUser(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
        
class ReadUser(BaseUser):
    pass

class CreateUser(BaseUser):
    pass

class CreateUserResponse(CreateResponse):
    pass

class LoginUser(BaseModel):
    email: EmailStr

class LoginUserResponse(BaseModel):
    message: str = "code sent successfully"