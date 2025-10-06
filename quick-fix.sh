#!/bin/bash

# Быстрое исправление проблем с зависимостями
echo "🔧 Быстрое исправление проблем с зависимостями..."

# Устанавливаем npm
echo "📦 Установка npm..."
apt-get update
apt-get install -y npm

# Устанавливаем Python зависимости системно
echo "🐍 Установка Python зависимостей..."
cd backend
pip3 install --break-system-packages -r requirements.txt
cd ..

# Устанавливаем Node.js зависимости
echo "📦 Установка Node.js зависимостей..."
cd frontend
npm install
cd ..

# Создаем папку для логов
echo "📁 Создание папки для логов..."
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

# Настраиваем PostgreSQL
echo "🔧 Настройка PostgreSQL..."
sudo -u postgres psql -c "CREATE USER agb_etp WITH PASSWORD 'agb_secure_password_2024';" 2>/dev/null || true
sudo -u postgres psql -c "CREATE DATABASE agb_etp OWNER agb_etp;" 2>/dev/null || true
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE agb_etp TO agb_etp;" 2>/dev/null || true

# Запускаем Backend
echo "🚀 Запуск Backend..."
cd backend
nohup python3 main.py > ../logs/backend.log 2>&1 &
BACKEND_PID=$!
echo "Backend PID: $BACKEND_PID"
cd ..

# Ждем запуска Backend
echo "⏳ Ожидание запуска Backend..."
sleep 10

# Проверяем Backend
if curl -s http://localhost:8000/health > /dev/null; then
    echo "✅ Backend запущен успешно"
else
    echo "❌ Backend не запустился"
    echo "Логи Backend:"
    cat logs/backend.log
fi

# Запускаем Frontend
echo "🚀 Запуск Frontend..."
cd frontend

# Создаем .env.local для Next.js
echo "📝 Создание .env.local для Next.js..."
cat > .env.local << 'EOF'
NEXT_PUBLIC_API_URL=http://81.200.158.192:8000
EOF

# Собираем фронтенд
echo "🔨 Сборка Frontend..."
npm run build

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
echo "🔍 Проверка статуса процессов:"
ps aux | grep -E "(python3|node)" | grep -v grep

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
echo "🎉 Исправление завершено!"
echo "📱 Frontend доступен по адресу: http://81.200.158.192:3000"
echo "🔌 Backend API доступен по адресу: http://81.200.158.192:8000"
echo "📚 API документация: http://81.200.158.192:8000/docs"
echo ""
echo "🔍 Для проверки логов выполните:"
echo "   tail -f logs/frontend.log"
echo "   tail -f logs/backend.log"
echo ""
echo "🛑 Для остановки выполните:"
echo "   kill $FRONTEND_PID $BACKEND_PID"
