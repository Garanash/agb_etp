from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from config import settings
from api.v1 import auth, tenders, applications, users, export, imports, dashboard, files

# Создаем таблицы в базе данных
Base.metadata.create_all(bind=engine)

# Создаем приложение FastAPI
app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="Электронная торговая площадка для компании Алмазгеобур"
)

# Настройка CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Подключение роутеров API v1
app.include_router(auth.router, prefix="/api/v1/auth", tags=["Аутентификация"])
app.include_router(tenders.router, prefix="/api/v1/tenders", tags=["Тендеры"])
app.include_router(applications.router, prefix="/api/v1/applications", tags=["Заявки"])
app.include_router(users.router, prefix="/api/v1/users", tags=["Пользователи"])
app.include_router(export.router, prefix="/api/v1/export", tags=["Экспорт данных"])
app.include_router(imports.router, prefix="/api/v1/import", tags=["Импорт данных"])
app.include_router(dashboard.router, prefix="/api/v1/dashboard", tags=["Дашборд"])
app.include_router(files.router, prefix="/api/v1/files", tags=["Файлы"])


@app.get("/")
async def root():
    """Корневой endpoint"""
    return {"message": "Добро пожаловать на API Алмазгеобур ЭТП!"}


@app.get("/health")
async def health_check():
    """Проверка состояния сервиса"""
    return {"status": "healthy"}