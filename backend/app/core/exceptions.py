import logging

from fastapi import FastAPI, HTTPException, Request, status
from fastapi.responses import JSONResponse
from sqlalchemy.exc import IntegrityError

from app.schemas.exceptions import ErrorResponse

logger = logging.getLogger(__name__)

# ============================================
# Exception Classes
# ============================================  
BEARER_HEADER = {
    "WWW-Authenticate": "Bearer"
}

class BaseAppException(HTTPException):
    status_code = 500
    default_detail = "Application Error"
    error_code = "APPLICATION_ERROR"

    def __init__(self, detail: str | None = None, headers: dict | None = None):
        super().__init__(
            status_code=self.status_code,
            detail=detail or self.default_detail,
            headers=headers,
        )

class NotFoundException(BaseAppException):
    status_code=status.HTTP_404_NOT_FOUND
    default_detail="Entity not found"
    error_code = "ENTITY_NOT_FOUND"
    
    def __init__(self, entity: str | None = None, detail: str | None = None):
        if entity:
            resource = entity.lower()
            self.error_code = f"{resource.upper()}_NOT_FOUND"
            detail = detail or f"{resource.capitalize()} not found"

        super().__init__(detail)


class BadRequestException(BaseAppException):
    status_code=status.HTTP_400_BAD_REQUEST
    default_detail= "Bad request"
    error_code = "BAD_REQUEST"
        
class ConflictException(BaseAppException):
    status_code = status.HTTP_409_CONFLICT
    default_detail = "Resource already exists"
    error_code = "RESOURCE_CONFLICT"
    
class UsernameAlreadyExistsException(ConflictException):
    default_detail = "Username already exists"
    error_code = "USERNAME_ALREADY_EXISTS"
    
class EmailAlreadyExistsException(ConflictException):
    default_detail = "Email already exists"
    error_code = "EMAIL_ALREADY_EXISTS"


class InvalidCredentialsException(BaseAppException):
    status_code=status.HTTP_401_UNAUTHORIZED
    default_detail="Invalid username or password"  
    error_code = "INVALID_CREDENTIAL"
    
    def __init__(self, detail = None):
        super().__init__(detail, headers=BEARER_HEADER)   
        
class InvalidTokenException(BaseAppException):
    status_code=status.HTTP_401_UNAUTHORIZED
    default_detail="Token is invalid or expired"  
    error_code = "INVALID_TOKEN"
    
    def __init__(self, detail = None):
        super().__init__(detail, headers=BEARER_HEADER)       
        
        
class NotAuthenticatedException(BaseAppException):
    status_code=status.HTTP_401_UNAUTHORIZED
    default_detail="Not Authenticated"  
    error_code = "NOT_AUTHENTICATED"
    
    def __init__(self, detail = None):
        super().__init__(detail, headers=BEARER_HEADER)            

class ExpiredTokenException(BaseAppException):
    status_code=status.HTTP_401_UNAUTHORIZED
    default_detail="Token has expired"  
    error_code = "EXPIRED_TOKEN"
    
    def __init__(self, detail = None):
        super().__init__(detail, headers=BEARER_HEADER)           
        
class InternalServerException(BaseAppException):
    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
    default_detail="An unexpected error occurred"    
    error_code = "UNEXPECTED_ERROR"      
        
class ServiceUnavailableException(BaseAppException):
    status_code=status.HTTP_503_SERVICE_UNAVAILABLE
    default_detail="Service temporarily unavailable"           
    error_code = "SERVICE_UNAVAILABLE"
    
class DatabaseIntegrityException(BaseAppException):
    status_code=status.HTTP_400_BAD_REQUEST
    default_detail="Database integrity error"
    error_code="DATABASE_INTEGRITY_ERROR"
    
# ============================================
# Exception Handlers
# ============================================        
def create_error_response(exception: BaseAppException, request: Request | None = None) -> JSONResponse:
    """Create a standardized error response"""
    
    content = ErrorResponse(
        request_id=1, # request.state.request_id if request else None,
        error_code=exception.error_code,
        detail=exception.detail,
        path=request.url.path if request else None,
        method=request.method if request else None,
    )

    return JSONResponse(
        status_code=exception.status_code,
        content=content.model_dump(mode="json"),
        headers=getattr(exception, "headers", None),
    )


def base_exception_handler(request: Request, exception: BaseAppException) -> JSONResponse:
    """Handler for custom exceptions"""
    logger.warning(
        "method=%s path=%s status=%s error_code=%s detail=%s",
        request.method,
        request.url.path,
        exception.status_code,
        exception.error_code,
        exception.detail,
    )
    return create_error_response(exception, request)        
        
        
def general_exception_handler(request: Request, exception: Exception) -> JSONResponse:
    """Handler for all unhandled exceptions"""    
    logger.exception(
        "method=%s path=%s",
        request.method,
        request.url.path,                     
    )
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "detail": "An unexpected error occurred",
            "path": request.url.path,
            "method": request.method
        }
    )        
    
CONSTRAINT_MESSAGES = {
    # CHECK constraints
    "ck_task_due_date_gte_start_date":
        "Due date must be greater than or equal to start date.",

    # UNIQUE constraints
    "uq_users_email":
        "A user with this email already exists.",

    # FOREIGN KEY constraints
    "fk_task_created_by":
        "The specified creator does not exist.",
}


def get_constraint_name(exc: IntegrityError) -> str | None:
    """Extract PostgreSQL constraint name from IntegrityError."""
    import re
    
    error_message = str(exc.orig)

    match = re.search(
        r'constraint "([^"]+)"',
        error_message,
    )

    if match:
        return match.group(1)

    return None
    
async def integrity_error_handler(
    request: Request,
    exc: IntegrityError,
) -> JSONResponse:

    # TODO: need to handle errors based on exc.orig.sqlstate ({'pgcode': '23514', 'sqlstate': '23514'}) which is:
    #exc.orig: <class 'asyncpg.exceptions.CheckViolationError'>: new row for relation "task" violates check constraint "ck_task_due_date_gte_start_date"
    # print("exc:", exc)
    # print("exc.orig:", exc.orig)
    # print("orig type:", type(exc.orig))
    # print("orig dict:", vars(exc.orig) if hasattr(exc.orig, "__dict__") else "no __dict__")

    constraint_name = get_constraint_name(exc)
    print("constraint:", constraint_name)

    detail = CONSTRAINT_MESSAGES.get(
        constraint_name,
        "Database integrity error.",
    )

    app_exception = DatabaseIntegrityException(detail)

    return base_exception_handler(request, app_exception)    

# ============================================
# Exception Registry
# ============================================
def add_exception_handlers(app: FastAPI) -> None:
    """Register all exception handlers with the FastAPI app"""
    app.add_exception_handler(BaseAppException, base_exception_handler)
    app.add_exception_handler(IntegrityError, integrity_error_handler)
    app.add_exception_handler(Exception, general_exception_handler)