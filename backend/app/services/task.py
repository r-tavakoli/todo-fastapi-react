from sqlalchemy import update
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload, with_loader_criteria
from sqlmodel import select

from app.core.exceptions import NotFoundException
from app.models.enums import TaskOperation
from app.models.task import Task, TaskAssignee, TaskHistory, TaskPriority, TaskStatus
from app.models.user import User
from app.schemas.task import CreateTask, UpdateTask
from app.services.base import BaseService, HistoryTracker

TASK_LIST_OPTIONS = (
    selectinload(Task.status).load_only(
        TaskStatus.id,
        TaskStatus.title,
    ),
    selectinload(Task.priority).load_only(
        TaskPriority.id,
        TaskPriority.title,
        TaskPriority.is_default,
        TaskPriority.sort_order,
        TaskPriority.color,
    ),
    selectinload(Task.creator).load_only(
        User.id,
        User.first_name,
        User.last_name,
        User.email
    ),
    selectinload(Task.assignees)
    .selectinload(TaskAssignee.user)
    .load_only(
        User.id,
        User.first_name,
        User.last_name,
        User.email
    ),
    with_loader_criteria(
        TaskAssignee,
        TaskAssignee.is_deleted.is_(False),
        include_aliases=True,
    ),    
)

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
    
    async def get_task(self, id: int) -> Task:
        statement = (
            select(Task)
            .where(Task.id == id, Task.is_deleted == False)
            .options(*TASK_LIST_OPTIONS)
        )
        result = await self.session.execute(statement=statement)
        task = result.scalar_one_or_none()
        self.validate_task_exists(task)
        return task
    
    async def get_tasks(self) -> list[Task]:
        statement = (
            select(Task)
            .where(Task.is_deleted.is_(False))
            .options(*TASK_LIST_OPTIONS)
        )
        results = await self.session.execute(statement=statement)
        tasks = results.scalars().all()            
        if not tasks:
            raise NotFoundException(entity="Task", detail="No task found")
        return tasks    
    
    async def add(self, create_task: CreateTask) -> Task:
        
        # Extract the assignee IDs and remove them from the dict
        assignee_ids = create_task.assignee_ids
        task_data = create_task.model_dump(exclude={"assignee_ids"})     
        
        task = Task(**task_data)     
        self.session.add(task)
        await self.session.flush() # flush (not commit) to get task.id
        
        # Create the link row
        if assignee_ids:
            links = [
                TaskAssignee(task_id=task.id, user_id=uid)
                for uid in set(assignee_ids)
            ]
            self.session.add_all(links)
            await self.session.flush()
            
        # Record task history
        history = self.history_tracker.build_history(
            TaskOperation.CREATE, 
            after=task, 
            columns_to_track=list(CreateTask.model_fields.keys())
        )
        
        if history:
            await self.add_task_history(history)
            
        # Commit data
        await self.session.commit()
        await self.session.refresh(task)
        
        return task
    
    async def update(self, id: int , update_task: UpdateTask) -> Task:
        try:
            # Fetch the task with its current assignees
            task = await self.get_task(id)
            self.validate_task_exists(task)
            
            # Snapshot before 
            before = self.history_tracker.snapshot(task)
            
            # Separate assignees from other fields
            update_data = update_task.model_dump(exclude_unset=True, exclude={"assignee_ids"}, exclude_none=True)
                    
            # Apply non-assignee fields        
            if update_data:
                task.sqlmodel_update(update_data)
                await self.session.flush()
                
            # Apply assignee changes if the client sent them        
            if update_task.assignee_ids is not None:
                await self._replace_assignees(task, set(update_task.assignee_ids))
                await self.session.flush()
                    
            # Build history                
            history = self.history_tracker.build_history(
                TaskOperation.UPDATE, 
                after=task, 
                before=before, 
            )
            
            if history:
                await self.add_task_history(history)
                
            # One atomic commit
            await self.session.commit()
            await self.session.refresh(task)
            return task            

        except IntegrityError:
            await self.session.rollback()
            raise

    async def delete(self, id: int) -> Task:
        task = await self.session.get(Task, id)
        self.validate_task_exists(task)
        return await self._delete(task)
        
    async def add_task_history(self, task_history: TaskHistory):
        task_history = TaskHistory(**task_history.model_dump())      
        return await self._add(task_history)    
    
    def validate_task_exists(self, task: Task) -> None:
        """Validate that a task exists and is not deleted."""
        if not task or task.is_deleted:
            raise NotFoundException(entity="Task", detail="Task does not exist")
        
    async def get_priorities(self) -> list[TaskPriority]:
        statement = select(TaskPriority)
        results = await self.session.execute(statement=statement)
        priorities = results.scalars().all()            
        if not priorities:
            raise NotFoundException()
        return priorities
    
    async def get_statuses(self) -> list[TaskStatus]:
        statement = select(TaskStatus)
        results = await self.session.execute(statement=statement)
        statuses = results.scalars().all()            
        if not statuses:
            raise NotFoundException()
        return statuses
    
    async def get_task_changes_history(self, task_id: int) -> list[TaskHistory]:
        statement = select(TaskHistory).where(TaskHistory.task_id == task_id)
        results = await self.session.execute(statement=statement)
        task_history = results.scalars().all()
        if not task_history:
            raise NotFoundException()
        return task_history
            
    async def _replace_assignees(self, task: Task, new_user_ids: set[int]) -> None:
        """Replace the task's assignees with the given user IDs."""
        # Only active links are "currently assigned"
        current_active_ids = {link.user_id for link in task.assignees if not link.is_deleted}

        # Validate users exist
        if new_user_ids:
            valid_ids = set(
                await self.session.scalars(
                    select(User.id).where(User.id.in_(new_user_ids))
                )
            )
            missing = new_user_ids - valid_ids
            if missing:
                raise NotFoundException(
                    entity="User",
                    detail=f"User id(s) not found: {', '.join(map(str, missing))}",
                )

        # Soft-delete removed assignees
        to_remove = current_active_ids - new_user_ids
        if to_remove:
            await self.session.execute(
                update(TaskAssignee)
                .where(
                    TaskAssignee.task_id == task.id,
                    TaskAssignee.user_id.in_(to_remove),
                    TaskAssignee.is_deleted.is_(False),
                )
                .values(is_deleted=True)
            )

        # Insert a new active row for every requested user not currently active
        to_add = new_user_ids - current_active_ids
        if to_add:
            self.session.add_all([
                TaskAssignee(task_id=task.id, user_id=uid)   # is_deleted defaults to False
                for uid in to_add
            ])