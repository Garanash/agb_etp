#!/bin/bash

# Скрипт для запуска без Docker (обход rate limit)
echo "🔧 Запуск без Docker для обхода rate limit..."

# Останавливаем все контейнеры
echo "⏹️  Остановка всех контейнеров..."
docker stop agb_etp_frontend agb_etp_backend agb_etp_postgres 2>/dev/null || true
docker rm agb_etp_frontend agb_etp_backend agb_etp_postgres 2>/dev/null || true

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

# Проверяем, есть ли Node.js
if ! command -v node &> /dev/null; then
    echo "📦 Установка Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    apt-get install -y nodejs
fi

# Проверяем, есть ли PostgreSQL
if ! command -v psql &> /dev/null; then
    echo "📦 Установка PostgreSQL..."
    apt-get update
    apt-get install -y postgresql postgresql-contrib
    systemctl start postgresql
    systemctl enable postgresql
fi

# Настраиваем PostgreSQL
echo "🔧 Настройка PostgreSQL..."
sudo -u postgres psql -c "CREATE USER agb_etp WITH PASSWORD 'agb_secure_password_2024';" 2>/dev/null || true
sudo -u postgres psql -c "CREATE DATABASE agb_etp OWNER agb_etp;" 2>/dev/null || true
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE agb_etp TO agb_etp;" 2>/dev/null || true

# Запускаем Backend в фоне
echo "🚀 Запуск Backend..."
cd backend

# Устанавливаем Python зависимости
if [ ! -d "venv" ]; then
    echo "📦 Создание виртуального окружения Python..."
    python3 -m venv venv
fi

source venv/bin/activate
pip install -r requirements.txt

# Запускаем Backend в фоне
echo "🚀 Запуск Backend в фоне..."
nohup python main.py > ../logs/backend.log 2>&1 &
BACKEND_PID=$!
echo "Backend PID: $BACKEND_PID"

cd ..

# Ждем запуска Backend
echo "⏳ Ожидание запуска Backend..."
sleep 10

# Проверяем, что Backend работает
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

# Устанавливаем зависимости
if [ ! -d "node_modules" ]; then
    echo "📦 Установка зависимостей Frontend..."
    npm install
fi

# Создаем .env.local для Next.js
echo "📝 Создание .env.local для Next.js..."
cat > .env.local << 'EOF'
NEXT_PUBLIC_API_URL=http://81.200.158.192:8000
EOF

# Собираем фронтенд
echo "🔨 Сборка Frontend..."
npm run build

# Запускаем Frontend в фоне
echo "🚀 Запуск Frontend в фоне..."
nohup npm start > ../logs/frontend.log 2>&1 &
FRONTEND_PID=$!
echo "Frontend PID: $FRONTEND_PID"

cd ..

# Ждем запуска Frontend
echo "⏳ Ожидание запуска Frontend..."
sleep 15

# Проверяем статус
echo "🔍 Проверка статуса процессов:"
ps aux | grep -E "(python|node)" | grep -v grep

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

# Проверяем, что фронтенд использует правильный API URL
echo ""
echo "🔍 Проверка API URL в фронтенде:"
if grep -q "http://81.200.158.192:8000" frontend/.env.local; then
    echo "✅ NEXT_PUBLIC_API_URL настроен правильно"
else
    echo "❌ NEXT_PUBLIC_API_URL не настроен"
fi

# Тестируем API запрос
echo ""
echo "🔍 Тестирование API запроса:"
if curl -s -H "Origin: http://81.200.158.192:3000" -H "Content-Type: application/json" -X POST -d '{"email":"admin@almazgeobur.ru","password":"admin123"}' http://localhost:8000/api/v1/auth/login > /dev/null; then
    echo "✅ API запрос работает"
else
    echo "❌ API запрос не работает"
fi

echo ""
echo "🎉 Запуск завершен!"
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
