from datetime import date, datetime
from typing import Any, Generic, TypeVar

from sqlalchemy import inspect
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
    
    def snapshot(self, entity: T, columns: list[str] | None = None) -> dict[str, Any]:
        """Capture the current state of an entity as a dict."""
        state = {}
        
        for column in inspect(entity.__class__).columns:
            field_name = column.name
            
            if field_name in self.exclude_fields:
                continue
            
            # Skip fields not in the requested set (if provided)
            if columns is not None and field_name not in columns:
                continue
                
            state[field_name] = self.to_json_safe(getattr(entity, field_name))
            
        return state
    
    def diff(self, before: dict, after: dict) -> tuple[dict, dict]:
        """Return only the fields that changed between two snapshots."""
        before_ = {}
        after_ = {}

        for key, value in after.items():
            if key in before and before[key] != value:
                before_[key] = before[key]
                after_[key] = value
                
        return before_, after_

    def to_json_safe(self, value: Any) -> Any:
        """Recursively convert date/datetime to ISO strings."""
        if isinstance(value, (date, datetime)):
            return value.isoformat()
        if isinstance(value, dict):
            return {k: self.to_json_safe(v) for k, v in value.items()}
        if isinstance(value, (list, tuple)):
            return [self.to_json_safe(v) for v in value]
        return value    
    
    def build_history(
        self,
        operation: TaskOperation,
        after: T,
        before: dict | None = None,
        columns_to_track: list[str] | None = None,
    ) -> H:
        """Build a history record from the before/after snapshots."""
        entity_id = after.id
        before = before or {}
        after = {} if operation == TaskOperation.DELETE else self.snapshot(after, columns=columns_to_track)
        
        print("="*50)
        print(before)
        print(after)
        
        if operation == TaskOperation.UPDATE:
            before_change, after_change = self.diff(before, after)
        else:
            before_change, after_change = before, after

        print("="*50)
        print(before_change)
        print(after_change)

        if not after:
            return None
        
        history = self.history_model(
            operation=operation,
            before=before_change,
            after=after_change
        )
        
        setattr(history, self.entity_id_field_name, entity_id)
        
        return history    

