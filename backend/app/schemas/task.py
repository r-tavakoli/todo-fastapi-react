from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, Field, model_validator

from .base import CreateResponse, DeleteResponse, UpdateResponse
from .user import UserResponse


class TaskStatusResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    title: str
    
class TaskPriorityResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    title: str

class BaseTask(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    title: str = Field(min_length=3, max_length=100)
    status: TaskStatusResponse
    priority: TaskPriorityResponse
    due_date: date
    start_date: date
    
    @model_validator(mode='after')
    def validate_dates(self) -> 'BaseTask':
        """Validate that due_date is after start_date."""
        if self.due_date is None or self.start_date is None:
            return self
        
        if self.due_date < self.start_date:
            raise ValueError(
                f"Due date ({self.due_date}) must be greater than start date ({self.start_date})"
            )
        return self
        
class ReadTaskResponse(BaseTask):
    # user: UserResponse
    is_deleted: bool
    created_on: datetime
    modified_on: datetime


class CreateTask(BaseTask):
    pass

class CreateTaskResponse(CreateResponse):
    pass
    
class UpdateTask(BaseModel):
    title: str | None = Field(default=None, min_length=3, max_length=100)
    status_id: int | None = None
    priority_id: int | None = None
    due_date: date | None = None
    start_date: date | None = None    
    
class UpdateTaskResponse(UpdateResponse):
    pass

class DeleteTaskResponse(DeleteResponse):
    pass