import secrets
from datetime import datetime, timedelta
from typing import TYPE_CHECKING

from pydantic import EmailStr
from sqlmodel import Field, Relationship

from app.models.base import BaseModel

if TYPE_CHECKING:
    from app.models.task import Task, TaskAssignee

_schema = "users"


class User(BaseModel, table=True):
    __tablename__ = "user"
    __table_args__ = {"schema": _schema}
    
    first_name: str = Field(min_length=2, max_length=50)
    last_name: str = Field(min_length=2, max_length=50)
    email: EmailStr = Field(unique=True, index=True)
    is_active: bool = Field(default=True)
    last_login: datetime | None = Field(default=None)
    last_logout: datetime | None = Field(default=None)
    
    login_pass_codes: list["LoginPassCode"] = Relationship(
        back_populates="user",
    )
    
    created_tasks: list["Task"] = Relationship(
        back_populates="creator",
        sa_relationship_kwargs={"lazy": "selectin"}
    )   
    
    assigned_tasks: list["TaskAssignee"] = Relationship(
        back_populates="user",
    )             

class LoginPassCode(BaseModel, table=True):
    __tablename__ = "login_pass_code"
    __table_args__ = {"schema": _schema}
    
    user_id: int = Field(foreign_key=f"{_schema}.user.id")
    pass_code_hash: str
    expires_at: datetime = Field(default_factory=lambda: datetime.now() + timedelta(minutes=5))
    is_used: bool = Field(default=False)

    user: "User" = Relationship(
        back_populates="login_pass_codes",    
    )

    @staticmethod
    def generate_code() -> str:
        return f"{secrets.randbelow(1_000_000):06d}"
            
    def is_expired(self) -> bool:
        """Check if the passcode has expired."""
        return datetime.now() > self.expires_at
    
    @property
    def is_valid(self) -> bool:
        """Check if the passcode can be used (not expired and not used)."""        
        return not self.is_used and not self.is_expired()