from fastapi import APIRouter, status

from app.api.dependencies import TaskServiceDep
from app.core.exceptions import BadRequestException
from app.schemas.task import (
    CreateTask,
    CreateTaskResponse,
    DeleteTaskResponse,
    ReadTaskResponse,
    TaskPriorityResponse,
    UpdateTask,
    UpdateTaskResponse,
)

router = APIRouter()
prefix = "/tasks"
tags = ["Tasks"]

router = APIRouter()

@router.get("/")
async def get_task(id: int, service: TaskServiceDep) -> ReadTaskResponse:
    """Get a task by ID."""
    task = await service.get_task(id)
    return task

@router.get("/get-tasks")
async def get_tasks(service: TaskServiceDep) -> list[ReadTaskResponse]:
    """Get all tasks."""
    tasks = await service.get_tasks()
    return tasks

@router.post("/add", status_code=status.HTTP_201_CREATED)
async def create_task(create_task: CreateTask, service: TaskServiceDep) -> CreateTaskResponse:
    return await service.add(create_task)

@router.patch("/update")
async def update_task(id: int, update_task: UpdateTask, service: TaskServiceDep) -> UpdateTaskResponse:
    task = update_task.model_dump(exclude_none=True)
    if not task:
        raise BadRequestException()
    return await service.update(id, task)

@router.delete("/delete")
async def delete_task(id: int, service: TaskServiceDep) -> DeleteTaskResponse:
    return await service.delete(id)

@router.get("/get-priorities")
async def get_priorities(service: TaskServiceDep) -> list[TaskPriorityResponse]:
    """Get the priority value based on the string input."""
    priorities = await service.get_priorities()
    return priorities