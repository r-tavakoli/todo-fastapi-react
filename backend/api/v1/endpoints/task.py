from fastapi import APIRouter
from backend.models.task import TaskStatus

router = APIRouter()
prefix = "/tasks"
tags = ["Tasks"]

@router.get("/")
def test():
    return {}