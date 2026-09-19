from datetime import timedelta
from pathlib import Path

from itsdangerous import (
    BadSignature,
    SignatureExpired,
    URLSafeTimedSerializer,
)

from app.config import security_settings

_serializer = URLSafeTimedSerializer(security_settings.JWT_SECRET_KEY)


APP_DIR = Path(__file__).resolve().parent
TEMPLATE_PATH = APP_DIR.joinpath("templates")
TEMPLATE_EMAIL_PATH = TEMPLATE_PATH.joinpath("email")



def encode_url_safe_token(data: dict, salt: str | None = None) -> str:
    return _serializer.dumps(data, salt)

def decode_url_safe_token(token: str, expiry: timedelta | None = None, salt: str | None = None) -> dict | None:
    try:
        return _serializer.loads(
            token, 
            max_age=expiry.total_seconds() if expiry else None,
            salt=salt,
        )
    except (BadSignature, SignatureExpired):
        return None