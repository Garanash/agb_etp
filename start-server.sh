#!/bin/bash

# 🏢 Алмазгеобур ЭТП - Полный запуск на сервере
# PostgreSQL системный, Backend и Frontend нативно

echo "🚀 Запуск Алмазгеобур ЭТП на сервере..."

# Проверяем, что мы в правильной директории
if [ ! -f "backend/main.py" ] || [ ! -f "frontend/package.json" ]; then
    echo "❌ Запустите скрипт из корня проекта"
    exit 1
fi

# Создаем папку для логов
mkdir -p logs

# Останавливаем предыдущие процессы
echo "🛑 Остановка предыдущих процессов..."
pkill -f "python3 main.py" 2>/dev/null || true
pkill -f "npm start" 2>/dev/null || true
sleep 2

# Создаем .env файл
echo "📝 Создание .env файла..."
cat > .env << 'EOF'
# 🏢 Алмазгеобур ЭТП - Production Environment Variables

# =============================================================================
# БАЗА ДАННЫХ
# =============================================================================
POSTGRES_USER=agb_etp
POSTGRES_PASSWORD=agb_secure_password_2024
POSTGRES_DB=agb_etp
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
DATABASE_URL=postgresql://agb_etp:agb_secure_password_2024@localhost:5432/agb_etp

# =============================================================================
# БЕЗОПАСНОСТЬ
# =============================================================================
SECRET_KEY=agb_very_secure_secret_key_2024_change_in_production
DEBUG=False

# =============================================================================
# CORS
# =============================================================================
CORS_ORIGINS=["http://localhost", "http://81.200.158.192", "https://81.200.158.192", "http://81.200.158.192:3000"]

# =============================================================================
# ФАЙЛЫ
# =============================================================================
ALLOWED_FILE_TYPES=pdf,doc,docx,xls,xlsx,jpg,jpeg,png
MAX_FILE_SIZE=10485760

# =============================================================================
# FRONTEND
# =============================================================================
NEXT_PUBLIC_API_URL=http://81.200.158.192:8000

# =============================================================================
# ЛОГИРОВАНИЕ
# =============================================================================
LOG_LEVEL=INFO
EOF

# Запускаем системный PostgreSQL
echo "🐘 Запуск системного PostgreSQL..."
systemctl start postgresql
systemctl enable postgresql

# Ждем запуска PostgreSQL
echo "⏳ Ожидание запуска PostgreSQL..."
sleep 5

# Проверяем, что PostgreSQL запустился
if systemctl is-active --quiet postgresql; then
    echo "✅ PostgreSQL запущен"
else
    echo "❌ PostgreSQL не запустился"
    exit 1
fi

# Настраиваем PostgreSQL
echo "🔧 Настройка PostgreSQL..."
sudo -u postgres psql -c "CREATE USER agb_etp WITH PASSWORD 'agb_secure_password_2024';" 2>/dev/null || true
sudo -u postgres psql -c "CREATE DATABASE agb_etp OWNER agb_etp;" 2>/dev/null || true
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE agb_etp TO agb_etp;" 2>/dev/null || true

# Проверяем подключение к PostgreSQL
echo "🔍 Проверка подключения к PostgreSQL..."
if sudo -u postgres psql -d agb_etp -c "SELECT 1;" > /dev/null 2>&1; then
    echo "✅ Подключение к PostgreSQL успешно"
else
    echo "❌ Не удалось подключиться к PostgreSQL"
    exit 1
fi

# Запускаем Backend
echo "🚀 Запуск Backend..."
cd backend

# Устанавливаем Python зависимости
echo "📦 Установка Python зависимостей..."
pip3 install --break-system-packages -r requirements.txt
if [ $? -ne 0 ]; then
    echo "⚠️  Установка через pip не удалась, пробуем системные пакеты..."
    apt-get update
    apt-get install -y python3-fastapi python3-uvicorn python3-sqlalchemy python3-psycopg2 python3-pydantic python3-passlib python3-bcrypt python3-pandas python3-numpy python3-openpyxl
    pip3 install --break-system-packages python-jose python-multipart pydantic-settings email-validator
    if [ $? -ne 0 ]; then
        echo "❌ Ошибка установки зависимостей Backend"
        exit 1
    fi
fi

# Проверяем, что все модули импортируются
echo "🔍 Проверка импорта модулей..."
python3 -c "
try:
    from fastapi import FastAPI
    from sqlalchemy import create_engine
    from psycopg2 import connect
    print('✅ Все модули импортируются успешно')
except ImportError as e:
    print(f'❌ Ошибка импорта: {e}')
    exit(1)
"

if [ $? -ne 0 ]; then
    echo "❌ Ошибка импорта модулей"
    exit 1
fi

# Запускаем Backend в фоне
echo "🚀 Запуск Backend в фоне..."
nohup python3 main.py > ../logs/backend.log 2>&1 &
BACKEND_PID=$!
echo "Backend PID: $BACKEND_PID"

cd ..

# Ждем запуска Backend
echo "⏳ Ожидание запуска Backend..."
sleep 15

# Проверяем, что Backend запустился
echo "🔍 Проверка статуса Backend..."
if curl -s http://localhost:8000/health > /dev/null; then
    echo "✅ Backend запущен и отвечает"
    
    # Инициализируем базу данных
    echo "🔧 Инициализация базы данных..."
    cd backend
    python3 init_db.py
    cd ..
    echo "✅ База данных инициализирована"
else
    echo "❌ Backend не запустился"
    echo "Логи Backend:"
    cat logs/backend.log
    echo ""
    echo "🔍 Проверка процессов:"
    ps aux | grep python
    exit 1
fi

# Запускаем Frontend
echo "🚀 Запуск Frontend..."

# Устанавливаем зависимости Frontend
echo "📦 Установка Node.js зависимостей..."
./install-frontend.sh
if [ $? -ne 0 ]; then
    echo "❌ Ошибка установки зависимостей Frontend"
    exit 1
fi

cd frontend

# Создаем .env.local для Next.js
echo "📝 Создание .env.local для Next.js..."
cat > .env.local << 'EOF'
NEXT_PUBLIC_API_URL=http://81.200.158.192:8000
EOF

# Собираем фронтенд
echo "🔨 Сборка Frontend..."
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Ошибка сборки Frontend"
    exit 1
fi

# Запускаем Frontend
echo "🚀 Запуск Frontend в фоне..."
nohup npm start > ../logs/frontend.log 2>&1 &
FRONTEND_PID=$!
echo "Frontend PID: $FRONTEND_PID"

cd ..

# Ждем запуска Frontend
echo "⏳ Ожидание запуска Frontend..."
sleep 15

# Проверяем, что Frontend запустился
echo "🔍 Проверка статуса Frontend..."
if curl -s http://localhost:3000 | grep -q "html"; then
    echo "✅ Frontend запущен"
else
    echo "❌ Frontend не запустился"
    echo "Логи Frontend:"
    cat logs/frontend.log
    exit 1
fi

echo "🎉 Запуск завершен успешно!"
echo ""
echo "📱 Frontend доступен по адресу: http://81.200.158.192:3000"
echo "🔌 Backend API доступен по адресу: http://81.200.158.192:8000"
echo "📚 API документация: http://81.200.158.192:8000/docs"
echo ""
echo "🔍 Для проверки логов выполните:"
echo "   tail -f logs/frontend.log"
echo "   tail -f logs/backend.log"
echo ""
echo "🛑 Для остановки выполните: ./stop.sh"
echo ""
echo "📊 Статус процессов:"
echo "Backend PID: $BACKEND_PID"
echo "Frontend PID: $FRONTEND_PID"
