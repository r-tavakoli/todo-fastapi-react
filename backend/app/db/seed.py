
from sqlmodel import select

from app.db.postgres import get_sessionmaker
from app.models import TaskPriority, TaskStatus


async def seed_task_status() -> None:
    sessionmaker = get_sessionmaker()

    async with sessionmaker() as session:
        statuses = ["Todo", "In Progress", "Completed"]

        for title in statuses:
            result = await session.execute(
                select(TaskStatus).where(TaskStatus.title == title)
            )

            if result.scalar_one_or_none() is None:
                session.add(TaskStatus(title=title))

        await session.commit()

async def seed_task_priority() -> None:
    sessionmaker = get_sessionmaker()

    async with sessionmaker() as session:
        priorities = [("Low", False, 1, "#40c057"), ("Medium", True, 2, "#fab005"), ("High", False, 3, "#fa5252")]
        
        for title, is_default, sort_order, color in priorities:
            result = await session.execute(
                select(TaskPriority).where(TaskPriority.title == title)
            )
            
            existing_priority = result.scalar_one_or_none()

            if existing_priority is None:
                # Priority doesn't exist, create it
                session.add(TaskPriority(title=title, is_default=is_default, sort_order=sort_order, color=color))
            else:
                if existing_priority.is_default != is_default or existing_priority.is_default is None:
                    # If the priority already exists and is_default is True, update it
                    existing_priority.is_default = is_default
                    
                if existing_priority.sort_order != sort_order:
                    # If the priority already exists and sort_order is different, update it
                    existing_priority.sort_order = sort_order
                    
                if existing_priority.color != color:
                    # If the priority already exists and color is different, update it
                    existing_priority.color = color
            
        await session.commit()      
        
        
        
        
        
async def seed_database():
    await seed_task_status()
    await seed_task_priority()