from datetime import date, datetime
from typing import Annotated, Any

from pydantic import BaseModel, ConfigDict, Field, model_validator

from app.models.enums import TaskOperation
from app.schemas.user import CreatorResponse, UserAssigneesResponse

from .base import CreateResponse, DeleteResponse, UpdateResponse

TitleType = Annotated[
    str, 
    Field(
        title="Task Title", 
        description="The title of the task", 
        min_length=3, 
        max_length=100
    )
]

# ------------------------    
# read
# ------------------------
class ReadTaskPriority(BaseModel):
    id: int
    title: str
    
class TaskStatusResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    title: str
    
class TaskPriorityResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    title: str
    is_default: bool
    sort_order: int
    color: str

class ReadTaskResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    title: TitleType
    creator: CreatorResponse
    task_assignees: list[UserAssigneesResponse]
    status: TaskStatusResponse
    priority: TaskPriorityResponse
    due_date: date
    start_date: date
    is_deleted: bool
    created_on: datetime
    modified_on: datetime
    
class ReadTaskHistoryResponse(BaseModel):
    id: int
    operation: TaskOperation
    before: dict[str, Any]
    after: dict[str, Any]
    created_on: datetime

# ------------------------    
# create
# ------------------------
class CreateTask(BaseModel):
    title: TitleType
    status_id: int
    priority_id: int
    due_date: date
    start_date: date 
    assignee_ids: list[int] = [] 
    
    @model_validator(mode='after')
    def validate_dates(self) -> 'CreateTask':
        """Validate that due_date is after start_date."""
        if self.due_date and self.start_date and self.due_date < self.start_date:
            raise ValueError(
                f"Due date ({self.due_date}) must be > start date ({self.start_date})"
            )
        return self    

class CreateTaskResponse(CreateResponse):
    pass

# ------------------------    
# update 
# ------------------------
class UpdateTask(BaseModel):
    title: TitleType | None = Field(default=None)
    status_id: int | None = None
    priority_id: int | None = None
    due_date: date | None = None
    start_date: date | None = None    
    assignee_ids: list[int] | None = None
    
    @model_validator(mode='after')
    def validate_dates(self) -> 'UpdateTask':
        """Validate that due_date is after start_date."""
        if (
            self.due_date is not None 
            and self.start_date is not None
            and self.due_date < self.start_date
        ):
            raise ValueError(
                f"Due date ({self.due_date}) must be > start date ({self.start_date})"
            )
        return self    
    
class UpdateTaskResponse(UpdateResponse):
    pass

# ------------------------    
# delete 
# ------------------------
class DeleteTaskResponse(DeleteResponse):
    pass