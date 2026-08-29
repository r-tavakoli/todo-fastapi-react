from fastapi import APIRouter, status

from app.api.dependencies import TaskServiceDep
from app.core.exceptions import BadRequestException
from app.schemas.task import (
    CreateTask,
    CreateTaskResponse,
    DeleteTaskResponse,
    ReadTaskResponse,
    UpdateTask,
    UpdateTaskResponse,
)

router = APIRouter()
prefix = "/tasks"
tags = ["Tasks"]

router = APIRouter()

@router.get("/")
async def get_task(task_id: int, service: TaskServiceDep) -> ReadTaskResponse:
    task = await service.get(task_id)
    return task

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