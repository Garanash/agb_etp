import os
from pydantic_settings import BaseSettings
from typing import List, Optional

class Settings(BaseSettings):
    # Настройки приложения
    app_name: str = "АлмазГеоБур ЭТП"
    app_version: str = "1.0.0"
    
    # Настройки базы данных
    database_url: str = "postgresql://agb_etp:agb_secure_password_2024@localhost:5432/agb_etp"
    postgres_user: str = "agb_etp"
    postgres_password: str = "agb_secure_password_2024"
    postgres_db: str = "agb_etp"
    postgres_host: str = "localhost"
    postgres_port: int = 5432
    
    # Настройки аутентификации
    secret_key: str = "your-secret-key-here-change-this-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    
    # Настройки сервера
    host: str = "0.0.0.0"
    port: int = 8000
    debug: bool = True
    
    # Настройки CORS
    cors_origins: List[str] = ["http://localhost:3000", "http://127.0.0.1:3000", "http://81.200.158.192:3000"]
    
    # Настройки файлов
    upload_dir: str = "uploads"
    max_file_size: int = 10485760  # 10MB в байтах
    allowed_file_types: str = "pdf,doc,docx,xls,xlsx,jpg,jpeg,png"
    
    # Настройки email
    smtp_host: Optional[str] = None
    smtp_port: int = 587
    smtp_username: Optional[str] = None
    smtp_password: Optional[str] = None
    smtp_use_tls: bool = True
    
    # Настройки Redis
    redis_url: str = "redis://localhost:6379/0"
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        # Создаем директорию для загрузок если её нет
        os.makedirs(self.upload_dir, exist_ok=True)
    
    @property
    def allowed_file_types_list(self) -> List[str]:
        """Возвращает список разрешенных типов файлов"""
        return [ext.strip() for ext in self.allowed_file_types.split(',')]

settings = Settings()