from datetime import date, datetime
from typing import Any, Generic, TypeVar

from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import SQLModel

from app.models.enums import TaskOperation

T = TypeVar('T', bound=SQLModel)
H = TypeVar('H', bound=SQLModel)

class BaseService:
    
    def __init__(self, model:SQLModel, session: AsyncSession):
        self.session = session
        self.model = model
        
    async def _get(self, id: int):
        return await self.session.get(self.model, id)

    async def _add(self, entity: SQLModel):
        self.session.add(entity)
        await self.session.commit()
        await self.session.refresh(entity)
        return entity
    
    async def _update(self, entity: SQLModel):
        return await self._add(entity) 
    
    async def _delete(self, entity: SQLModel):
        entity.is_deleted = True
        await self.session.commit()
        await self.session.refresh(entity)
        return entity

class HistoryTracker(Generic[T, H]):     
    def __init__(
        self,
        model: type[T],
        history_model: type[H],
        exclude_fields: list[str] | None = None,
        extra_fields: dict[str, Any] | None = None,
        entity_id_field_name: str = "entity_id"
    ):
        self.model = model
        self.history_model = history_model
        self.exclude_fields = exclude_fields or ['id', 'created_on', 'modified_on']
        self.extra_fields = extra_fields or {}
        self.entity_id_field_name = entity_id_field_name
    
    def _get_data(self, entity: T) -> dict[str, Any]:
        state = {}
        from sqlalchemy import inspect
        for column in inspect(entity.__class__).columns:
            field_name = column.name
            if field_name not in self.exclude_fields:
                value = getattr(entity, field_name)
                if isinstance(value, datetime):
                    value = value.isoformat()
                state[field_name] = value
        return state
    
    def _serialize_dates(self, value: date) -> str:
        """Convert date objects to strings for JSON serialization."""
        return value.isoformat() if isinstance(value, date) else value

    def _extract_data_changes(self, before: dict, after: dict):
        before_ = {}
        after_ = {}
        if before != after:
            for key in after.keys():
                if key in before and before[key] != after[key]:
                    before_[key] = self._serialize_dates(before[key])
                    after_[key] = self._serialize_dates(after[key])
        return before_, after_
        
    def track_history(self, entity: T) -> dict:
        return self._get_data(entity)
    
    def create_history(self, before: dict, after: T, operation: TaskOperation) -> H:
        after_dict = self._get_data(after)
        
        before_change, after_change = self._extract_data_changes(before, after_dict)

        if not after_change:
            return None
        
        history = self.history_model(
            operation=operation,
            before=before_change,
            after=after_change
        )
        
        setattr(history, self.entity_id_field_name, after.id)
        
        return history    
    

