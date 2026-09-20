from fastapi.security import OAuth2PasswordBearer

from app.config import app_settings

oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"/api/{app_settings.APP_API_VERSION}/users/login")