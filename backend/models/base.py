from datetime import datetime
from typing import Annotated

from pydantic.alias_generators import to_snake
from sqlalchemy import func
from sqlalchemy.orm import DeclarativeBase, Mapped, declared_attr, mapped_column
from sqlmodel import Field, SQLModel, text

def to_snake_case(name: str) -> str:
    """Convert CamelCase to snake_case."""
    return to_snake(name)

class TablenameMixin:
    """Mixin to auto-generate table names."""
    
    @classmethod
    def __init_subclass__(cls, **kwargs):
        super().__init_subclass__(**kwargs)
        if not hasattr(cls, '__tablename__'):
            cls.__tablename__ = to_snake_case(cls.__name__)

class BaseModel(SQLModel):
    __abstract__ = True
    
    id: int = Field(
        primary_key=True,
        index=True,
        description="unique identifier"
    )
    
    created_on: datetime = Field(
        sa_column_kwargs={
            "server_default": text("NOW()"),
            "nullable": False
        }
    )
    
    modified_on: datetime = Field(
        sa_column_kwargs={
            "server_default": text("NOW()"),
            "onupdate": text("NOW()"),
            "nullable": False
        }
    )
    
    is_deleted: bool = Field(default=False)
    
    class Config:
        from_attributes = True
