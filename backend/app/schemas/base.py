from pydantic import BaseModel


class CreateResponse(BaseModel):
    id: int
    message: str = "created successfully"
    
class UpdateResponse(BaseModel):
    id: int
    message: str = "updated successfully"
    
class DeleteResponse(BaseModel):
    id: int
    message: str = "deleted successfully"