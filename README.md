# 🏢 Алмазгеобур - Электронная торговая площадка

Современная веб-платформа для проведения электронных торгов и закупок, разработанная для компании Алмазгеобур.

## 📋 Описание проекта

Электронная торговая площадка (ЭТП) представляет собой полнофункциональную систему для:
- Публикации и управления тендерами
- Подачи заявок поставщиками
- Создания детальных предложений по позициям
- Аналитики и отчетности
- Управления пользователями и ролями

## 🚀 Быстрый старт

### Автоматический запуск (рекомендуется)

```bash
# Клонируйте репозиторий
git clone <repository-url>
cd agb_etp

# Подготовка сервера и запуск в режиме разработки
./deploy.sh

# Или для продакшена
./deploy.sh --prod

# Только подготовка сервера (установка Docker)
./deploy.sh --setup
```

### Доступные команды

```bash
./deploy.sh --help      # Показать справку
./deploy.sh --dev       # Деплой в режиме разработки (по умолчанию)
./deploy.sh --prod      # Деплой в продакшен режиме
./deploy.sh --setup     # Только подготовка сервера
./deploy.sh --clean     # Деплой с очисткой Docker
./deploy.sh --stop      # Остановить все сервисы
./deploy.sh --restart   # Перезапустить сервисы
./deploy.sh --logs      # Показать логи
./deploy.sh --status    # Показать статус сервисов
```

### Ручной запуск

```bash
# 1. Запустите Docker Compose
docker-compose up -d

# 2. Дождитесь запуска всех сервисов (30-60 секунд)
# 3. Откройте браузер: http://localhost:3000
```

## 🛠 Технологический стек

### Backend
- **FastAPI** - современный веб-фреймворк для Python
- **PostgreSQL** - надежная реляционная база данных
- **SQLAlchemy** - ORM для работы с базой данных
- **Pydantic** - валидация данных и сериализация
- **JWT** - аутентификация и авторизация

### Frontend
- **Next.js 14** - React фреймворк с App Router
- **TypeScript** - типизированный JavaScript
- **Tailwind CSS** - утилитарный CSS фреймворк
- **Lucide React** - современные иконки

### Инфраструктура
- **Docker & Docker Compose** - контейнеризация
- **Nginx** - веб-сервер и прокси (для продакшена)

## 📁 Структура проекта

```
agb_etp/
├── backend/                 # Backend приложение
│   ├── api/v1/             # API эндпоинты
│   ├── models.py           # Модели базы данных
│   ├── schemas.py          # Pydantic схемы
│   ├── main.py             # Точка входа FastAPI
│   └── requirements.txt    # Python зависимости
├── frontend/               # Frontend приложение
│   ├── app/                # Next.js App Router
│   ├── components/         # React компоненты
│   ├── lib/                # Утилиты и хелперы
│   └── package.json        # Node.js зависимости
├── docker-compose.yml      # Docker Compose конфигурация
├── deploy.sh              # Скрипт автоматического деплоя
└── README.md              # Документация
```

## 🔧 Конфигурация

### Переменные окружения

Создайте файл `.env` в корне проекта:

```env
# База данных
POSTGRES_USER=agb_etp
POSTGRES_PASSWORD=your_secure_password
POSTGRES_DB=agb_etp
POSTGRES_HOST=localhost
POSTGRES_PORT=5432

# Безопасность
SECRET_KEY=your_very_secure_secret_key_here
DEBUG=False

# CORS
CORS_ORIGINS=["http://localhost:3000", "https://yourdomain.com"]

# Файлы
ALLOWED_FILE_TYPES=pdf,doc,docx,xls,xlsx,jpg,jpeg,png
MAX_FILE_SIZE=10485760

# API
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Настройка для продакшена

1. **Измените пароли** в `.env` файле
2. **Настройте домен** в `CORS_ORIGINS`
3. **Установите DEBUG=False**
4. **Настройте SSL** сертификаты

## 👥 Роли пользователей

### Администратор (ADMIN)
- Управление пользователями
- Просмотр аналитики
- Настройка системы

### Менеджер (MANAGER)
- Создание и управление тендерами
- Просмотр заявок
- Аналитика по тендерам

### Контрактный менеджер (CONTRACT_MANAGER)
- Создание тендеров
- Управление закупками
- Работа с поставщиками

### Поставщик (SUPPLIER)
- Просмотр доступных тендеров
- Подача заявок
- Создание детальных предложений
- Управление своими предложениями

## 🎯 Основные функции

### Для организаторов тендеров
- ✅ Создание и публикация тендеров
- ✅ Управление лотами и позициями
- ✅ Загрузка документов
- ✅ Просмотр и анализ заявок
- ✅ Детальная аналитика

### Для поставщиков
- ✅ Просмотр доступных тендеров
- ✅ Подача заявок на участие
- ✅ Создание детальных предложений по позициям
- ✅ Указание цен, сроков поставки, комментариев
- ✅ Тоглы для "оригинал/аналог" и "наличие товара"
- ✅ Редактирование предложений

### Аналитика
- ✅ Сводка по всем тендерам
- ✅ Статистика по поставщикам
- ✅ Анализ цен и предложений
- ✅ Отчеты по эффективности

## 🚀 Деплой на сервер

### Требования к серверу
- **OS**: Ubuntu 20.04+ / CentOS 7+ / Debian 10+
- **RAM**: минимум 2GB, рекомендуется 4GB+
- **CPU**: минимум 2 ядра
- **Диск**: минимум 10GB свободного места
- **Docker**: версия 20.10+
- **Docker Compose**: версия 2.0+

### Автоматический деплой

```bash
# 1. Подключитесь к серверу
ssh user@your-server.com

# 2. Клонируйте репозиторий
git clone <repository-url>
cd agb_etp

# 3. Настройте переменные окружения
cp .env.example .env
nano .env  # Отредактируйте настройки

# 4. Запустите деплой
chmod +x deploy.sh
./deploy.sh
```

### Ручной деплой

```bash
# 1. Установите Docker и Docker Compose
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
sudo usermod -aG docker $USER

# 2. Установите Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 3. Запустите приложение
docker-compose up -d

# 4. Проверьте статус
docker-compose ps
```

## 🔍 Мониторинг и логи

### Просмотр логов
```bash
# Все сервисы
docker-compose logs -f

# Только backend
docker-compose logs -f backend

# Только frontend
docker-compose logs -f frontend

# Только база данных
docker-compose logs -f postgres
```

### Мониторинг ресурсов
```bash
# Использование ресурсов контейнерами
docker stats

# Статус сервисов
docker-compose ps

# Использование диска
docker system df
```

## 🛠 Разработка

### Локальная разработка

```bash
# Backend
cd backend
python -m venv venv
source venv/bin/activate  # Linux/Mac
# или
venv\Scripts\activate     # Windows
pip install -r requirements.txt
python main.py

# Frontend
cd frontend
npm install
npm run dev
```

### Тестирование

```bash
# Backend тесты
cd backend
pytest

# Frontend тесты
cd frontend
npm test
```

## 📊 API Документация

После запуска приложения API документация доступна по адресам:

### Локальная разработка:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **OpenAPI схема**: http://localhost:8000/openapi.json

### Продакшен (через Nginx):
- **Swagger UI**: http://yourdomain.com/api/ololo/docs
- **ReDoc**: http://yourdomain.com/api/ololo/redoc
- **OpenAPI схема**: http://yourdomain.com/api/ololo/openapi.json

📚 **Подробная документация API**: [API_DOCS.md](API_DOCS.md)

## 🔒 Безопасность

### Рекомендации для продакшена
1. **Измените все пароли по умолчанию**
2. **Используйте HTTPS** с валидными SSL сертификатами
3. **Настройте файрвол** для ограничения доступа к портам
4. **Регулярно обновляйте** зависимости
5. **Настройте резервное копирование** базы данных
6. **Мониторьте логи** на предмет подозрительной активности

### Резервное копирование

```bash
# Создание бэкапа базы данных
docker exec agb_etp_postgres pg_dump -U agb_etp agb_etp > backup_$(date +%Y%m%d_%H%M%S).sql

# Восстановление из бэкапа
docker exec -i agb_etp_postgres psql -U agb_etp agb_etp < backup_file.sql
```

## 🆘 Устранение неполадок

### Частые проблемы

**Проблема**: Контейнеры не запускаются
```bash
# Решение: Проверьте логи
docker-compose logs
# Убедитесь, что порты 3000 и 8000 свободны
```

**Проблема**: Ошибка подключения к базе данных
```bash
# Решение: Перезапустите базу данных
docker-compose restart postgres
# Подождите 30 секунд и перезапустите backend
docker-compose restart backend
```

**Проблема**: Frontend не загружается
```bash
# Решение: Проверьте переменную NEXT_PUBLIC_API_URL
# Должна соответствовать адресу backend сервера
```

### Очистка системы

```bash
# Остановить все контейнеры
docker-compose down

# Удалить все данные (ОСТОРОЖНО!)
docker-compose down -v
docker system prune -a

# Пересобрать с нуля
docker-compose build --no-cache
docker-compose up -d
```

## 📞 Поддержка

При возникновении проблем:
1. Проверьте раздел "Устранение неполадок"
2. Изучите логи приложения
3. Создайте issue в репозитории с подробным описанием

## 📄 Лицензия

Проект разработан для компании Алмазгеобур. Все права защищены.

---

**Версия**: 1.0.0  
**Дата**: 2025  
**Автор**: Команда разработки Алмазгеобур