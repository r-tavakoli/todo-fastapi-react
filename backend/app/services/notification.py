from typing import Any

from fastapi import BackgroundTasks
from fastapi_mail import ConnectionConfig, FastMail, MessageSchema, MessageType
from pydantic import EmailStr

from app.config import notification_settings
from app.utils import TEMPLATE_EMAIL_PATH


class NotificationService:
    def __init__(self, background_tasks: BackgroundTasks):
        self.fast_mail = FastMail(
            ConnectionConfig(
                **notification_settings.model_dump(), 
                TEMPLATE_FOLDER=TEMPLATE_EMAIL_PATH
            )
        )
        self.background_tasks = background_tasks

    async def send_email(
        self,
        recipients: list[EmailStr],
        subject: str,
        context: dict[str, Any],
        template_name: str,
    ):
        self.background_tasks.add_task(
            self.fast_mail.send_message,
            message=MessageSchema(
                recipients=recipients,
                subject=subject,
                template_body=context,
                subtype=MessageType.html,
            ),
            template_name=template_name,
        )