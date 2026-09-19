
# from passlib.context import CryptContext
from datetime import datetime
import secrets

from pydantic import EmailStr
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import EmailAlreadyExistsException, NotAuthenticatedException
from app.models.user import LoginPassCode, User
from app.schemas.user import CreateUser, LoginUser
from app.services.base import BaseService

# password_context = CryptContext(
#     schemes=["pbkdf2_sha256"],
#     pbkdf2_sha256__rounds=300000,
#     deprecated="auto"
# )

class UserService(BaseService):
    
    def __init__(self, session: AsyncSession):
        super().__init__(User, session)
        # self.notification_service = notification_service
        
    async def get(self, id: int) -> User:
        return self._get(User, id)        
    
    async def register_user(self, create_user: CreateUser) -> User:
        # Check if email exists
        self.user_verification(create_user.email)
                
        # Create user
        user = User(**create_user.model_dump())
        user = await self._add(user)
        
        return user
    
    async def send_login_code(self, email: EmailStr) -> User:
        # Check if email exists
        self.user_verification(email)
        
        # Generate a 6 digit code
        pass_code = self.generate_code()
            
            
    async def user_verification(self, email: EmailStr) -> None:
        # Check if email already exists
        existing_user = await self.session.execute(
            select(User).where(User.email == email)
        )
        existing_user = existing_user.scalar_one_or_none()
        
        if existing_user:
            if not existing_user.is_active:
                raise NotAuthenticatedException()
            raise EmailAlreadyExistsException() 

    @staticmethod    
    def generate_code() -> str:
        return f"{secrets.randbelow(1_000_000):06d}"
            
    def is_expired(self) -> bool:
        """Check if the passcode has expired."""
        return datetime.now() > self.expires_at
    
    @property
    def is_valid(self) -> bool:
        """Check if the passcode can be used (not expired and not used)."""        
        return not self.is_used and not self.is_expired()