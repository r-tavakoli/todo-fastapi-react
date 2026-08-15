from fastapi import APIRouter

router = APIRouter()
prefix = "/tasks"
tags = ["Tasks"]

@router.get("/")
def test():
    return {}