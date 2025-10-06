#!/bin/bash

# Скрипт для использования кэшированных образов
echo "🔧 Использование кэшированных образов..."

# Останавливаем все контейнеры
echo "⏹️  Остановка всех контейнеров..."
docker stop agb_etp_frontend agb_etp_backend agb_etp_postgres 2>/dev/null || true
docker rm agb_etp_frontend agb_etp_backend agb_etp_postgres 2>/dev/null || true

# Проверяем, какие образы у нас есть
echo "📋 Доступные образы:"
docker images

# Создаем .env файл
echo "📝 Создание .env файла..."
cat > .env << 'EOF'
POSTGRES_USER=agb_etp
POSTGRES_PASSWORD=agb_secure_password_2024
POSTGRES_DB=agb_etp
POSTGRES_HOST=postgres
POSTGRES_PORT=5432
DATABASE_URL=postgresql://agb_etp:agb_secure_password_2024@postgres:5432/agb_etp
SECRET_KEY=agb_very_secure_secret_key_2024_change_in_production
DEBUG=False
CORS_ORIGINS=["http://localhost:3000", "http://81.200.158.192:3000", "http://81.200.158.192:8000"]
ALLOWED_FILE_TYPES=pdf,doc,docx,xls,xlsx,jpg,jpeg,png
MAX_FILE_SIZE=10485760
NEXT_PUBLIC_API_URL=http://81.200.158.192:8000
LOG_LEVEL=INFO
EOF

# Пробуем запустить с существующими образами
echo "🚀 Запуск с существующими образами..."

# Сначала только база данных
echo "  - Запуск PostgreSQL..."
if docker images | grep -q postgres; then
    docker run -d --name agb_etp_postgres \
      -e POSTGRES_USER=agb_etp \
      -e POSTGRES_PASSWORD=agb_secure_password_2024 \
      -e POSTGRES_DB=agb_etp \
      -p 5432:5432 \
      -v postgres_data:/var/lib/postgresql/data \
      postgres:14-alpine
else
    echo "❌ Образ PostgreSQL не найден"
    exit 1
fi

# Ждем запуска базы данных
echo "⏳ Ожидание запуска PostgreSQL..."
sleep 15

# Запускаем бэкенд
echo "  - Запуск Backend..."
if docker images | grep -q agb_etp-backend; then
    docker run -d --name agb_etp_backend \
      --link agb_etp_postgres:postgres \
      -e DATABASE_URL=postgresql://agb_etp:agb_secure_password_2024@postgres:5432/agb_etp \
      -e POSTGRES_USER=agb_etp \
      -e POSTGRES_PASSWORD=agb_secure_password_2024 \
      -e POSTGRES_DB=agb_etp \
      -e POSTGRES_HOST=postgres \
      -e POSTGRES_PORT=5432 \
      -e SECRET_KEY=agb_very_secure_secret_key_2024_change_in_production \
      -e DEBUG=False \
      -e CORS_ORIGINS='["http://localhost:3000", "http://81.200.158.192:3000", "http://81.200.158.192:8000"]' \
      -e ALLOWED_FILE_TYPES=pdf,doc,docx,xls,xlsx,jpg,jpeg,png \
      -e MAX_FILE_SIZE=10485760 \
      -e LOG_LEVEL=INFO \
      -p 8000:8000 \
      -v $(pwd)/uploads:/app/uploads \
      agb_etp-backend
else
    echo "❌ Образ Backend не найден"
    exit 1
fi

# Ждем запуска бэкенда
echo "⏳ Ожидание запуска Backend..."
sleep 20

# Проверяем, что Backend работает
if curl -s http://localhost:8000/health > /dev/null; then
    echo "✅ Backend запущен успешно"
else
    echo "❌ Backend не запустился"
    echo "Логи Backend:"
    docker logs agb_etp_backend
fi

# Запускаем фронтенд
echo "  - Запуск Frontend..."
if docker images | grep -q agb_etp-frontend; then
    docker run -d --name agb_etp_frontend \
      --link agb_etp_backend:backend \
      -e NODE_ENV=production \
      -e NEXT_PUBLIC_API_URL=http://81.200.158.192:8000 \
      -p 3000:3000 \
      agb_etp-frontend
else
    echo "❌ Образ Frontend не найден"
    echo "Попробуйте запустить: ./run-without-docker.sh"
    exit 1
fi

# Ждем запуска фронтенда
echo "⏳ Ожидание запуска Frontend..."
sleep 15

# Проверяем статус
echo "🔍 Проверка статуса контейнеров:"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

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
echo "📱 Frontend доступен по адресу: http://81.200.158.192:3000"
echo "🔌 Backend API доступен по адресу: http://81.200.158.192:8000"
echo "📚 API документация: http://81.200.158.192:8000/docs"
echo ""
echo "🔍 Для проверки логов выполните:"
echo "   docker logs agb_etp_frontend"
echo "   docker logs agb_etp_backend"
echo "   docker logs agb_etp_postgres"
