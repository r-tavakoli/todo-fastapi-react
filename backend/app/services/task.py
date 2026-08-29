from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import NotFoundException
from app.models.enums import TaskOperation
from app.models.task import Task, TaskHistory
from app.schemas.task import CreateTask, UpdateTask
from app.services.base import BaseService, HistoryTracker


class TaskService(BaseService):
    def __init__(self, session: AsyncSession):
        super().__init__(Task, session)
        self.history_tracker = HistoryTracker(
            model=Task,
            history_model=TaskHistory,
            entity_id_field_name="task_id"
        )
            
    async def get(self, id: int) -> Task:
        task = await self._get(id)
        self.validate_task_exists(task)
        return task
    
    async def add(self, create_task: CreateTask) -> Task:
        task = Task(**create_task.model_dump())     
        task = await self._add(task)
        return task
    
    async def update(self, id: int , update_task: UpdateTask) -> Task:
        try:
            task = await self._get(id)
            self.validate_task_exists(task)
            
            before = self.history_tracker.track_history(task)
            task.sqlmodel_update(update_task)
            task = await self._update(task) 
            history = self.history_tracker.create_history(before, task, TaskOperation.UPDATE)
            
            print("="*50)
            print(before)
            print(task)
            print(history)
            
            if history:
                await self.add_task_history(history)
                
            return task
        except IntegrityError:
            await self.session.rollback()
            raise

    
    async def delete(self, id: int) -> Task:
        task = await self.session.get(Task, id)
        self.validate_task_exists(task)
        self._delete(task)
        
    async def add_task_history(self, task_history: TaskHistory):
        task_history = TaskHistory(**task_history.model_dump())      
        return await self._add(task_history)    
    
    def validate_task_exists(self, task: Task) -> None:
        """Validate that a task exists and is not deleted."""
        if not task or task.is_deleted:
            raise NotFoundException()