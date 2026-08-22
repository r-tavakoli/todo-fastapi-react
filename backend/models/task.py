from sqlmodel import Field

from backend.models.base import BaseModel

TODO_SCHEMA = "tasks"


class TaskStatus(BaseModel, table=True):
    __tablename__ = "task_status"
    __table_args__ = {"schema": TODO_SCHEMA}
    
    title: str = Field(max_length=50, min_length=3)
