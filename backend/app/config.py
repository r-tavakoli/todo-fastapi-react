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
    
    model_config = _setting_config_dict
    
    @property
    def POSTGRE_URL(self):
        return f"postgresql+asyncpg://{self.POSTGRE_USER_NAME}:{self.POSTGRE_PASSWORD}@{self.POSTGRE_SERVER}:{self.POSTGRE_PORT}/{self.POSTGRE_DB}"
        
    @property
    def POSTGRE_TEST_DB_URL(self):
        return f"postgresql+asyncpg://{self.POSTGRE_TEST_USER_NAME}:{self.POSTGRE_TEST_PASSWORD}@{self.POSTGRE_TEST_SERVER}:{self.POSTGRE_TEST_PORT}/{self.POSTGRE_TEST_DB}"    
    
    
class SecuritySettings(BaseSettings):
    JWT_ALGORITHM: str
    JWT_SECRET_KEY: str       
    
    model_config = _setting_config_dict      
    
    
    
    
app_settings = AppSettings()    
db_settings = DatabaseSettings()
security_settings = SecuritySettings()