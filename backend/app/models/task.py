from datetime import datetime
from typing import Any

from sqlalchemy import JSON, Column
from sqlmodel import Field, Relationship

from app.models.base import BaseModel

_schema = "tasks"


class TaskStatus(BaseModel, table=True):
    __tablename__ = "task_status"
    __table_args__ = {"schema": _schema}
    
    title: str = Field(
        max_length=50,
        min_length=3,
        unique=True,
        index=True,
    )
    
    color: str = Field(default="#808080",max_length=7)
    
    tasks: list["Task"] = Relationship(
        back_populates="status",
        sa_relationship_kwargs={"lazy": "selectin"}
    )
    
    
class TaskPriority(BaseModel, table=True):
    __tablename__ = "task_priority"
    __table_args__ = {"schema": _schema}
    
    title: str = Field(
        max_length=50,
        min_length=3,
        unique=True,
        index=True,
    )
    
    color: str = Field(default="#808080",max_length=7)
    
    tasks: list["Task"] = Relationship(
        back_populates="priority",
        sa_relationship_kwargs={"lazy": "selectin"}
    )
    
class Task(BaseModel, table=True):
    __tablename__ = "task"
    __table_args__ = {"schema": _schema}
    
    title: str = Field(max_length=100, min_length=3)
    status_id: int = Field(default=1, foreign_key=f"{_schema}.task_status.id")    
    priority_id: int = Field(default=1, foreign_key=f"{_schema}.task_priority.id")
    start_date: datetime
    due_date: datetime
    
    status: "TaskStatus" = Relationship(
        back_populates="tasks",
        sa_relationship_kwargs={"lazy": "selectin", "innerjoin": True}
    )
    
    priority: "TaskPriority" = Relationship(
        back_populates="tasks",
        sa_relationship_kwargs={"lazy": "selectin", "innerjoin": True}
    )
    
    task_history: list["TaskHistory"] = Relationship(
        back_populates="task",
        sa_relationship_kwargs={"lazy": "selectin"}
    )   

    
class TaskHistory(BaseModel, table=True):
    __tablename__ = "task_history"
    __table_args__ = {"schema": _schema}
    
    operation: str = Field(max_length=20, min_length=5)
    before: dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    after: dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    task_id: int = Field(foreign_key=f"{_schema}.task.id")

    task: "Task" = Relationship(
        back_populates="task_history",
        sa_relationship_kwargs={"lazy": "selectin"}    
    )
