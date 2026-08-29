from datetime import datetime

from pydantic import BaseModel, EmailStr, Field

from .base import CreateResponse


class BaseUser(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    user_name: str = Field(ge=3)
    password: str = Field(ge=3)
        
class ReadUser(BaseUser):
    pass

class CreateUser(BaseUser):
    pass

class CreateUserResponse(CreateResponse):
    pass

class UserResponse(BaseModel):
    id: int
    first_name: str
    last_name: str
    email: str
    user_name: str
    is_active: bool
    is_email_verified: bool
    created_on: datetime
    modified_on: datetime