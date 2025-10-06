#!/bin/bash

# 🏢 Алмазгеобур ЭТП - Запуск приложения
# PostgreSQL системный, Backend и Frontend нативно

echo "🚀 Запуск Алмазгеобур ЭТП..."

# Проверяем, что мы в правильной директории
if [ ! -f "backend/main.py" ] || [ ! -f "frontend/package.json" ]; then
    echo "❌ Запустите скрипт из корня проекта"
    exit 1
fi

# Создаем папку для логов
mkdir -p logs

# Создаем .env файл
echo "📝 Создание .env файла..."
cat > .env << 'EOF'
POSTGRES_USER=agb_etp
POSTGRES_PASSWORD=agb_secure_password_2024
POSTGRES_DB=agb_etp
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
DATABASE_URL=postgresql://agb_etp:agb_secure_password_2024@localhost:5432/agb_etp
SECRET_KEY=agb_very_secure_secret_key_2024_change_in_production
DEBUG=False
CORS_ORIGINS=["http://localhost:3000", "http://81.200.158.192:3000", "http://81.200.158.192:8000"]
ALLOWED_FILE_TYPES=pdf,doc,docx,xls,xlsx,jpg,jpeg,png
MAX_FILE_SIZE=10485760
NEXT_PUBLIC_API_URL=http://81.200.158.192:8000
LOG_LEVEL=INFO
EOF

# Запускаем системный PostgreSQL
echo "🐘 Запуск системного PostgreSQL..."
sudo systemctl start postgresql
sudo systemctl enable postgresql

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

# Запускаем Backend
echo "🚀 Запуск Backend..."
cd backend

# Устанавливаем Python зависимости
echo "📦 Установка Python зависимостей..."
pip3 install --break-system-packages -r requirements.txt
if [ $? -ne 0 ]; then
    echo "❌ Ошибка установки зависимостей Backend"
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
sleep 10

# Проверяем Backend
if curl -s http://localhost:8000/health > /dev/null; then
    echo "✅ Backend запущен"
else
    echo "❌ Backend не запустился"
    echo "Логи Backend:"
    cat logs/backend.log
fi

# Запускаем Frontend
echo "🚀 Запуск Frontend..."
cd frontend

# Устанавливаем зависимости
echo "📦 Установка Node.js зависимостей..."
npm install
if [ $? -ne 0 ]; then
    echo "❌ Ошибка установки зависимостей Frontend"
    exit 1
fi

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
echo "🚀 Запуск Frontend..."
nohup npm start > ../logs/frontend.log 2>&1 &
FRONTEND_PID=$!
echo "Frontend PID: $FRONTEND_PID"
cd ..

# Ждем запуска Frontend
echo "⏳ Ожидание запуска Frontend..."
sleep 15

# Проверяем статус
echo "🔍 Проверка статуса:"
echo "PostgreSQL (Docker): $(docker ps --format 'table {{.Names}}\t{{.Status}}' | grep postgres)"
echo "Backend (PID $BACKEND_PID): $(ps -p $BACKEND_PID > /dev/null && echo 'Запущен' || echo 'Остановлен')"
echo "Frontend (PID $FRONTEND_PID): $(ps -p $FRONTEND_PID > /dev/null && echo 'Запущен' || echo 'Остановлен')"

# Проверяем доступность
echo ""
echo "🔍 Проверка доступности:"
if curl -s http://localhost:8000/health > /dev/null; then
    echo "✅ Backend API доступен"
else
    echo "❌ Backend API недоступен"
fi

if curl -s http://localhost:3000/ > /dev/null; then
    echo "✅ Frontend доступен"
else
    echo "❌ Frontend недоступен"
fi

echo ""
echo "🎉 Запуск завершен!"
echo "📱 Frontend: http://81.200.158.192:3000"
echo "🔌 Backend API: http://81.200.158.192:8000"
echo "📚 API документация: http://81.200.158.192:8000/docs"
echo ""
echo "🔍 Логи:"
echo "   Backend: tail -f logs/backend.log"
echo "   Frontend: tail -f logs/frontend.log"
echo "   PostgreSQL: docker logs agb_etp_postgres"
echo ""
echo "🛑 Остановка:"
echo "   ./stop.sh"
