from datetime import datetime, timedelta
from pathlib import Path
from uuid import uuid4

import jwt

from app.config import security_settings
from app.core.exceptions import ExpiredTokenException

# email template path 
APP_DIR = Path(__file__).resolve().parent
TEMPLATE_PATH = APP_DIR.joinpath("templates")
TEMPLATE_EMAIL_PATH = TEMPLATE_PATH.joinpath("emails")


# access token (jwt)
def encode_access_token(
    id: int, 
    user_name: str, 
    expiry_in_minute: timedelta | None = None 
) -> str:
    expiry = expiry_in_minute or security_settings.JWT_EXPIRATION_DURATION_IN_MINUTE
        
    token = jwt.encode(
        payload={
            "user": {
                "user_name": user_name,
                "id": id,
                "jti": str(uuid4())
            },
            "exp": datetime.now() + timedelta(minutes=expiry)
        },
        algorithm=security_settings.JWT_ALGORITHM,
        key=security_settings.JWT_SECRET_KEY
    )
    return token

def decode_access_token(token: str) -> dict | None:
    try:
        return jwt.decode(
            jwt=token,
            key=security_settings.JWT_SECRET_KEY,
            algorithms=[security_settings.JWT_ALGORITHM]
        )
    except jwt.ExpiredSignatureError:
        raise ExpiredTokenException()
    except jwt.PyJWTError:
        return None

