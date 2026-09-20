from pydantic_settings import BaseSettings, SettingsConfigDict

_setting_config_dict = SettingsConfigDict(
    env_file="./.env",
    env_ignore_empty=True,
    extra="ignore"
)


class AppSettings(BaseSettings):
    APP_NAME: str
    APP_DOMAIN: str
    APP_API_VERSION: str    
    
    model_config = _setting_config_dict


class DatabaseSettings(BaseSettings):
    POSTGRE_SERVER: str
    POSTGRE_PORT: int
    POSTGRE_DB: str
    POSTGRE_USER_NAME: str
    POSTGRE_PASSWORD: str

    POSTGRE_TEST_SERVER: str
    POSTGRE_TEST_PORT: int
    POSTGRE_TEST_DB: str
    POSTGRE_TEST_USER_NAME: str
    POSTGRE_TEST_PASSWORD: str
    
    DB_ECHO: bool
    DB_POOL_SIZE: int
    DB_MAX_OVERFLOW: int
    DB_POOL_RECYCLE: int
    DB_POOL_TIMEOUT: int  
    
    DB_SCHEMAS: list[str] = ["tasks", "users"]
    
    REDIS_SERVER: str
    REDIS_PORT: int
    REDIS_DB: int
    # REDIS_USER_NAME: str | None
    # REDIS_PASSWORD: str | None
    
    model_config = _setting_config_dict
    
    @property
    def POSTGRE_URL(self):
        return f"postgresql+asyncpg://{self.POSTGRE_USER_NAME}:{self.POSTGRE_PASSWORD}@{self.POSTGRE_SERVER}:{self.POSTGRE_PORT}/{self.POSTGRE_DB}"
        
    @property
    def POSTGRE_TEST_DB_URL(self):
        return f"postgresql+asyncpg://{self.POSTGRE_TEST_USER_NAME}:{self.POSTGRE_TEST_PASSWORD}@{self.POSTGRE_TEST_SERVER}:{self.POSTGRE_TEST_PORT}/{self.POSTGRE_TEST_DB}"    

    def REDIS_URL(self, redis_db: int | None = None):
        if redis_db is not None:
            self.REDIS_DB = redis_db
        connection_url = f"redis://{self.REDIS_SERVER}:{self.REDIS_PORT}/{self.REDIS_DB}"
        return connection_url

class NotificationSettings(BaseSettings):
    MAIL_USERNAME: str
    MAIL_PASSWORD: str 
    MAIL_FROM: str
    MAIL_FROM_NAME: str 
    MAIL_SERVER: str 
    MAIL_PORT: int
    MAIL_STARTTLS: bool = True
    MAIL_SSL_TLS: bool = False 
    USE_CREDENTIALS: bool = True 
    VALIDATE_CERTS: bool = True
    
    model_config = _setting_config_dict   
    
class OTPSettings(BaseSettings):
    OTP_EXPIRATION_TIME_IN_MINUTE: int

    model_config = _setting_config_dict
    
class SecuritySettings(BaseSettings):
    JWT_ALGORITHM: str
    JWT_SECRET_KEY: str       
    JWT_EXPIRATION_DURATION_IN_MINUTE: int
    
    model_config = _setting_config_dict  
    
app_settings = AppSettings()    
db_settings = DatabaseSettings()
notification_settings = NotificationSettings()
otp_settings = OTPSettings()
security_settings = SecuritySettings()