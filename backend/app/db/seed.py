
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
        priorities = ["Low", "Medium", "High"]

        for title in priorities:
            result = await session.execute(
                select(TaskPriority).where(TaskPriority.title == title)
            )

            if result.scalar_one_or_none() is None:
                session.add(TaskPriority(title=title))

        await session.commit()       
        
async def seed_database():
    await seed_task_status()
    await seed_task_priority()