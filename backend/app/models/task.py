from datetime import datetime
from typing import Any

from sqlalchemy import JSON, Column, text
from sqlmodel import Field, Index, Relationship

from app.models.base import BaseModel
from app.models.enums import TaskOperation
from app.models.user import User

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
        back_populates="priority"
    )
    
class TaskAssignee(BaseModel, table=True):
    __tablename__ = "task_assignee"
    __table_args__ = (
        Index(
            "ix_unique_active_task_assignee",
            "task_id",
            "user_id",
            unique=True,
            postgresql_where=text("is_deleted = false"),
        ),
        {"schema": _schema},
    )
    
    task_id: int = Field(foreign_key=f"{_schema}.task.id", primary_key=True)
    user_id: int = Field(foreign_key="users.user.id", primary_key=True)
    
    task: "Task" = Relationship(
        back_populates="assignees",
    )
    
    user: "User" = Relationship(
        back_populates="assigned_tasks",
    )   
    
class Task(BaseModel, table=True):
    __tablename__ = "task"
    __table_args__ = {"schema": _schema}
    
    title: str = Field(max_length=100, min_length=3)
    status_id: int = Field(foreign_key=f"{_schema}.task_status.id")    
    priority_id: int = Field(foreign_key=f"{_schema}.task_priority.id")
    start_date: datetime
    due_date: datetime
    owner_id: int = Field(foreign_key="users.user.id")
        
    status: "TaskStatus" = Relationship(
        back_populates="tasks",
        sa_relationship_kwargs={"innerjoin": True}
    )
    
    priority: "TaskPriority" = Relationship(
        back_populates="tasks",
        sa_relationship_kwargs={"innerjoin": True}
    )
    
    task_history: list["TaskHistory"] = Relationship(
        back_populates="task",
    )   
    
    creator: "User" = Relationship(
        back_populates="created_tasks",
        sa_relationship_kwargs={"innerjoin": True}
    )
    
    assignees: "list[TaskAssignee]" = Relationship(
        back_populates="task"
    )
    
    
class TaskHistory(BaseModel, table=True):
    __tablename__ = "task_history"
    __table_args__ = {"schema": _schema}
    
    operation: TaskOperation
    before: dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    after: dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    task_id: int = Field(foreign_key=f"{_schema}.task.id")

    task: "Task" = Relationship(
        back_populates="task_history"
    )
