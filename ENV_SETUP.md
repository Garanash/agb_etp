# Настройка переменных окружения

## Создание .env файла

1. Скопируйте файл `env.example` в `.env`:
   ```bash
   cp env.example .env
   ```

2. Отредактируйте файл `.env` в папке `backend/` и настройте переменные под ваши нужды.

## Основные настройки

### База данных
- `DATABASE_URL` - полный URL подключения к PostgreSQL
- `POSTGRES_USER` - имя пользователя базы данных
- `POSTGRES_PASSWORD` - пароль пользователя базы данных
- `POSTGRES_DB` - имя базы данных
- `POSTGRES_HOST` - хост базы данных
- `POSTGRES_PORT` - порт базы данных

### Безопасность
- `SECRET_KEY` - секретный ключ для JWT токенов (ОБЯЗАТЕЛЬНО измените в продакшене!)
- `ALGORITHM` - алгоритм шифрования для JWT
- `ACCESS_TOKEN_EXPIRE_MINUTES` - время жизни токена в минутах

### Сервер
- `HOST` - хост для запуска сервера
- `PORT` - порт для запуска сервера
- `DEBUG` - режим отладки (True/False)

### CORS
- `CORS_ORIGINS` - список разрешенных доменов для CORS

### Файлы
- `UPLOAD_DIR` - директория для загрузки файлов
- `MAX_FILE_SIZE` - максимальный размер файла в байтах
- `ALLOWED_FILE_TYPES` - разрешенные типы файлов

## Важные замечания

1. **Никогда не коммитьте .env файл в git!** Он уже добавлен в .gitignore
2. Обязательно измените `SECRET_KEY` на случайную строку в продакшене
3. Настройте правильные CORS origins для вашего фронтенда
4. Убедитесь, что настройки базы данных соответствуют вашей конфигурации PostgreSQL

## Пример настройки для разработки

```env
# База данных (соответствует docker-compose.yml)
DATABASE_URL=postgresql://agb_etp:agb_etp@localhost:5435/agb_etp
POSTGRES_USER=agb_etp
POSTGRES_PASSWORD=agb_etp
POSTGRES_DB=agb_etp
POSTGRES_HOST=localhost
POSTGRES_PORT=5435

# Безопасность
SECRET_KEY=your-super-secret-key-for-development-only
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Сервер
HOST=0.0.0.0
PORT=8000
DEBUG=True

# CORS для фронтенда
CORS_ORIGINS=["http://localhost:3000", "http://127.0.0.1:3000"]
```
