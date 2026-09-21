
import secrets
from datetime import datetime, timedelta

from fastapi import BackgroundTasks
from passlib.context import CryptContext
from pydantic import EmailStr
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import otp_settings
from app.core.exceptions import (
    EmailAlreadyExistsException,
    InvalidCredentialsException,
    InvalidPasswordTokenException,
    NotAuthenticatedException,
    NotFoundException,
)
from app.models.user import LoginPassCode, User
from app.schemas.user import CreateUser, PasswordCredential
from app.services.base import BaseService
from app.services.notification import NotificationService
from app.utils import encode_access_token

password_context = CryptContext(
    schemes=["pbkdf2_sha256"],
    pbkdf2_sha256__rounds=300000,
    deprecated="auto",
)

class UserService(BaseService):
    
    def __init__(self, session: AsyncSession, notification_service: NotificationService):
        super().__init__(User, session)
        self.notification_service = notification_service
        
    async def get(self, id: int) -> User:
        return self._get(User, id)
    
    async def get_user_by_email(self, email: EmailStr) -> User:
        user = await self.session.execute(
            select(User)
            .where(User.email == email)
            .where(User.is_active == True)
            .where(User.is_deleted == False)
        )
        return user.scalar_one_or_none()
    
    async def register_user(self, create_user: CreateUser) -> User:
        # Check if email exists
        existing_user = await self.get_user_by_email(create_user.email)
        if existing_user:
            if not existing_user.is_active:
                raise NotAuthenticatedException()
            raise EmailAlreadyExistsException() 
                
        # Create user
        user = User(**create_user.model_dump())
        user = await self._add(user)
        
        return user
    
    async def send_login_pass_code(self, credential: PasswordCredential) -> User:
        # Check if email exists
        user = await self.get_user_by_email(credential.email)
        
        if not user or not user.is_active:
            raise InvalidCredentialsException()
                
        # Generate a 6 digit otp code
        pass_code = self.generate_code()
        
        # Add otp to LoginPassCode table
        login_pass_code = LoginPassCode(
            user_id=user.id, 
            pass_code_hash=password_context.hash(pass_code),
            expires_at=datetime.now() + timedelta(minutes=otp_settings.OTP_EXPIRATION_TIME_IN_MINUTE),
        )
        await self._add(login_pass_code)

        # Sending email
        await self.notification_service.send_email(
            recipients=[user.email],
            subject="Pass Code (OTP)",
            context={
                "first_name": user.first_name.capitalize(),
                "pass_code": pass_code,
                "expiry_duration":otp_settings.OTP_EXPIRATION_TIME_IN_MINUTE
            },
            template_name="verification_code.html"
        )            
        
        return user
    
    async def login(self, email: EmailStr, password: str) -> str:
        # Check if user exists
        user = await self.get_user_by_email(email)
        
        if not user or not user.is_active:
            raise InvalidCredentialsException()

        # Verify pass code
        pass_code = await self.session.execute(
            select(LoginPassCode)
            .where(LoginPassCode.user_id == user.id)
            .where(LoginPassCode.is_used == False)
            .order_by(LoginPassCode.id.desc())
            .limit(1)
        )
        
        pass_code = pass_code.scalar_one_or_none()
        
        # Check if pass code does exist and match the input password
        if (
            pass_code is None
            or not password_context.verify(password, pass_code.pass_code_hash)
        ):
            raise InvalidCredentialsException()   
        
        # Check if pass code has expired
        if pass_code.is_expired:
            pass_code.is_used = True
            await self._update(pass_code)
            raise InvalidPasswordTokenException()
        
        # Create token
        token = encode_access_token(user.id, user.email)
        
        # Update LoginPassCode table
        pass_code.is_used = True
        await self._update(pass_code)
        
        return token
    
    async def consume_expired_passcodes(self, user_id: int) -> int:
        """Mark all expired, unused passcodes for a user as used.

        Returns the number of rows updated.
        """
        stmt = (
            update(LoginPassCode)
            .where(LoginPassCode.user_id == user_id)
            .where(LoginPassCode.is_used == False)
            .where(LoginPassCode.expires_at < datetime.now())
            .values(is_used=True)
        )
        result = await self.session.execute(stmt)
        await self.session.commit()
        return result.rowcount

    @staticmethod    
    def generate_code() -> str:
        return f"{secrets.randbelow(1_000_000):06d}"
    
    async def get_users(self) -> list[User]:
        results = await self.session.execute(
            select(User)
            .where(User.is_deleted == False)
        )
        
        users = results.scalars().all()
        if not users:
            raise NotFoundException(entity="User", detail="User(s) not found")
        
        return users