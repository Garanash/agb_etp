# Инструкция по запуску проекта

## Предварительные требования

- Python 3.8+
- Node.js 16+
- Docker и Docker Compose
- Git

## Установка и запуск

### 1. Клонирование и подготовка

```bash
# Перейдите в папку проекта
cd agb_etp

# Установите Python зависимости
pip install -r requirements.txt

# Установите Node.js зависимости
cd frontend
npm install
cd ..
```

### 2. Настройка базы данных

```bash
# Запустите PostgreSQL в Docker
docker-compose up -d

# Дождитесь запуска базы данных (около 30 секунд)
# Затем инициализируйте базу данных
cd backend
python init_db.py
cd ..
```

### 3. Настройка переменных окружения

#### Backend
Создайте файл `.env` в корне проекта:

```env
# База данных
DATABASE_URL=postgresql://agb_etp_user:agb_etp_password@localhost:5432/agb_etp

# JWT настройки
SECRET_KEY=your-secret-key-change-in-production-please-use-a-strong-random-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Настройки приложения
APP_NAME=Алмазгеобур ЭТП
APP_VERSION=1.0.0
DEBUG=true

# CORS настройки
ALLOWED_ORIGINS=["http://localhost:3000", "http://127.0.0.1:3000"]
```

#### Frontend
Создайте файл `.env.local` в папке `frontend`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 4. Запуск приложения

Откройте два терминала:

**Терминал 1 - Backend:**
```bash
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**Терминал 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### 5. Доступ к приложению

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API документация**: http://localhost:8000/docs

## Учетные данные по умолчанию

После инициализации базы данных создается администратор:

- **Email**: admin@almazgeobur.ru
- **Пароль**: admin123

## Структура проекта

```
agb_etp/
├── backend/                 # FastAPI приложение
│   ├── api/                # API endpoints
│   │   └── v1/            # Версия 1 API
│   ├── models.py          # Модели базы данных
│   ├── schemas.py         # Pydantic схемы
│   ├── auth.py           # Система авторизации
│   ├── config.py         # Конфигурация
│   ├── database.py       # Подключение к БД
│   ├── main.py           # Основной файл приложения
│   └── init_db.py        # Инициализация БД
├── frontend/              # Next.js приложение
│   ├── app/              # Страницы приложения
│   ├── components/       # React компоненты
│   └── package.json      # Node.js зависимости
├── docker-compose.yml    # Конфигурация PostgreSQL
└── requirements.txt      # Python зависимости
```

## Роли пользователей

- **Администратор** - полный доступ к системе
- **Контрактный управляющий** - управление контрактами и тендерами
- **Менеджер** - управление поставщиками и просмотр тендеров
- **Поставщик** - просмотр тендеров и подача заявок

## API Endpoints

### Аутентификация
- `POST /api/v1/auth/login` - Вход в систему
- `POST /api/v1/auth/register-supplier` - Регистрация поставщика
- `GET /api/v1/auth/me` - Информация о текущем пользователе

### Тендеры
- `GET /api/v1/tenders/` - Список тендеров с фильтрацией
- `GET /api/v1/tenders/{id}` - Детали тендера
- `POST /api/v1/tenders/` - Создание тендера (требует авторизации)
- `PUT /api/v1/tenders/{id}` - Обновление тендера (требует авторизации)
- `POST /api/v1/tenders/{id}/publish` - Публикация тендера (требует авторизации)

## Разработка

### Добавление новых API endpoints

1. Создайте новый файл в `backend/api/v1/`
2. Добавьте роутер в `backend/main.py`
3. Обновите схемы в `backend/schemas.py` при необходимости

### Добавление новых страниц

1. Создайте новый файл в `frontend/app/`
2. Добавьте навигацию в `frontend/components/Header.tsx`

## Остановка

```bash
# Остановите Docker контейнеры
docker-compose down

# Остановите процессы разработки (Ctrl+C в терминалах)
```
