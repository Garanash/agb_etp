#!/bin/bash

# 🚀 Алмазгеобур ЭТП - Оптимизированный запуск для сервера с 4GB RAM
# Backend + Frontend: нативно (без Docker)
# PostgreSQL: в Docker (экономия памяти)

set -e

echo "🚀 Алмазгеобур ЭТП - Оптимизированный запуск..."
echo "💾 Оптимизация для сервера с 4GB RAM"

# Функция для получения IP сервера
get_server_ip() {
    hostname -I | awk '{print $1}'
}

SERVER_IP=$(get_server_ip)
echo "🌐 IP сервера: $SERVER_IP"

# Остановка всех процессов
echo "🛑 Остановка всех процессов..."
pkill -f "python3 main.py" 2>/dev/null || true
pkill -f "npm start" 2>/dev/null || true
docker stop agb-postgres 2>/dev/null || true
docker rm agb-postgres 2>/dev/null || true
sleep 3

# Создание папки для логов
mkdir -p logs

# Создание .env файла
echo "📝 Создание .env файла..."
cat > .env << EOF
# Database
DATABASE_URL=postgresql://agb_etp:agb_secure_password_2024@localhost:5432/agb_etp
POSTGRES_USER=agb_etp
POSTGRES_PASSWORD=agb_secure_password_2024
POSTGRES_DB=agb_etp
POSTGRES_HOST=localhost
POSTGRES_PORT=5432

# Security
SECRET_KEY=your-secret-key-here-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# CORS
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000,http://$SERVER_IP:3000

# File uploads
ALLOWED_FILE_TYPES=pdf,doc,docx,xls,xlsx
MAX_FILE_SIZE=10485760

# Server
HOST=0.0.0.0
PORT=8000
DEBUG=false
EOF

# Создание .env.local для Frontend
echo "📝 Создание .env.local для Frontend..."
cat > frontend/.env.local << EOF
NEXT_PUBLIC_API_URL=http://$SERVER_IP:8000
EOF

# Запуск PostgreSQL в Docker (минимальная конфигурация)
echo "🐘 Запуск PostgreSQL в Docker..."
docker-compose -f docker-compose.postgres.yml up -d

# Ждем запуска PostgreSQL
echo "⏳ Ожидание запуска PostgreSQL..."
sleep 15

# Проверка PostgreSQL
echo "🔍 Проверка PostgreSQL..."
if docker exec agb-postgres pg_isready -U agb_etp; then
    echo "✅ PostgreSQL запущен"
else
    echo "❌ PostgreSQL не запустился"
    echo "Логи PostgreSQL:"
    docker logs agb-postgres
    exit 1
fi

# Настройка PostgreSQL
echo "🔧 Настройка PostgreSQL..."
docker exec agb-postgres psql -U agb_etp -d agb_etp -c "GRANT ALL PRIVILEGES ON DATABASE agb_etp TO agb_etp;" 2>/dev/null || true

# Установка Python зависимостей (минимальный набор)
echo "📦 Установка Python зависимостей..."
cd backend

# Устанавливаем только критически важные пакеты
pip3 install --break-system-packages --no-cache-dir \
    fastapi==0.118.0 \
    uvicorn==0.37.0 \
    sqlalchemy==2.0.43 \
    psycopg2-binary==2.9.10 \
    pydantic==2.11.10 \
    pydantic-settings==2.11.0 \
    python-jose==3.5.0 \
    passlib==1.7.4 \
    python-multipart==0.0.20 \
    bcrypt==5.0.0 \
    email-validator==2.3.0

if [ $? -ne 0 ]; then
    echo "❌ Ошибка установки Python зависимостей"
    exit 1
fi

# Запуск Backend
echo "🚀 Запуск Backend..."
nohup python3 main.py > ../logs/backend.log 2>&1 &
BACKEND_PID=$!
echo "Backend PID: $BACKEND_PID"

cd ..

# Ждем запуска Backend
echo "⏳ Ожидание запуска Backend..."
sleep 15

# Проверка Backend
if curl -s http://localhost:8000/health > /dev/null; then
    echo "✅ Backend запущен"
    
    # Инициализация базы данных
    echo "🔧 Инициализация базы данных..."
    cd backend
    python3 init_db.py
    cd ..
else
    echo "❌ Backend не запустился"
    echo "Логи Backend:"
    cat logs/backend.log
    exit 1
fi

# Установка Node.js зависимостей (минимальная)
echo "📦 Установка Node.js зависимостей..."
cd frontend

# Очистка кэша
npm cache clean --force

# Установка с минимальным потреблением памяти
export NODE_OPTIONS="--max-old-space-size=512"
npm install --production --no-audit --no-fund --prefer-offline --silent

if [ $? -ne 0 ]; then
    echo "⚠️  Попытка установки с dev зависимостями..."
    npm install --no-audit --no-fund --prefer-offline --silent
fi

# Сборка Frontend
echo "🔨 Сборка Frontend..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Ошибка сборки Frontend"
    exit 1
fi

# Запуск Frontend
echo "🚀 Запуск Frontend..."
nohup npm start > ../logs/frontend.log 2>&1 &
FRONTEND_PID=$!
echo "Frontend PID: $FRONTEND_PID"

cd ..

# Ждем запуска Frontend
echo "⏳ Ожидание запуска Frontend..."
sleep 20

# Финальная проверка
echo "🔍 Финальная проверка системы..."

# Проверка Backend
if curl -s http://localhost:8000/health > /dev/null; then
    echo "✅ Backend работает"
else
    echo "❌ Backend не отвечает"
fi

# Проверка Frontend
if curl -s http://localhost:3000 | grep -q "html"; then
    echo "✅ Frontend работает"
else
    echo "❌ Frontend не отвечает"
fi

# Проверка PostgreSQL
if docker exec agb-postgres pg_isready -U agb_etp > /dev/null; then
    echo "✅ PostgreSQL работает"
else
    echo "❌ PostgreSQL не отвечает"
fi

# Показать использование памяти
echo "💾 Использование памяти:"
free -h

# Показать процессы
echo "🔍 Запущенные процессы:"
ps aux | grep -E "(python3|node|postgres)" | grep -v grep

echo ""
echo "🎉 Система запущена!"
echo "📱 Frontend: http://$SERVER_IP:3000"
echo "🔌 Backend API: http://$SERVER_IP:8000"
echo "📚 API документация: http://$SERVER_IP:8000/docs"
echo "🐘 PostgreSQL: localhost:5432"
echo ""
echo "🔍 Логи:"
echo "   Backend: tail -f logs/backend.log"
echo "   Frontend: tail -f logs/frontend.log"
echo "   PostgreSQL: docker logs agb-postgres"
echo ""
echo "🛑 Остановка:"
echo "   kill $BACKEND_PID $FRONTEND_PID"
echo "   docker stop agb-postgres"
echo ""
echo "💾 Использование памяти:"
free -h
