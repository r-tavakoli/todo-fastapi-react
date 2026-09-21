from pydantic import BaseModel, ConfigDict, EmailStr

from .base import CreateResponse


class BaseUser(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
        
class CreatorResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    first_name: str
    last_name: str
    email: EmailStr
    
class UserAssigneesResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    first_name: str
    last_name: str
    email: EmailStr

class CreateUser(BaseUser):
    pass

class CreateUserResponse(CreateResponse):
    pass

class PasswordCredential(BaseModel):
    email: EmailStr

class PasswordCredentialResponse(BaseModel):
    id: int
    message: str = "code sent successfully"
    
class LoginResponse(BaseModel):
    access_token: str
    jwt_type: str = "jwt"
    
class ReadUsersResponse(BaseModel):
    id: int
    first_name: str
    last_name: str