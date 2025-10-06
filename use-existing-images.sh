#!/bin/bash

# Скрипт для использования уже загруженных образов
echo "🔧 Использование существующих образов..."

# Останавливаем все контейнеры
echo "⏹️  Остановка контейнеров..."
docker-compose down 2>/dev/null || true
docker-compose -f docker-compose.prod.yml down 2>/dev/null || true
docker-compose -f docker-compose.local.yml down 2>/dev/null || true

# Проверяем, какие образы у нас есть
echo "📋 Доступные образы:"
docker images | grep -E "(agb_etp|postgres|nginx)"

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

# Сначала только база данных и бэкенд
echo "  - Запуск PostgreSQL и Backend..."
docker run -d --name agb_etp_postgres \
  -e POSTGRES_USER=agb_etp \
  -e POSTGRES_PASSWORD=agb_secure_password_2024 \
  -e POSTGRES_DB=agb_etp \
  -p 5432:5432 \
  -v postgres_data:/var/lib/postgresql/data \
  postgres:14-alpine

# Ждем запуска базы данных
echo "⏳ Ожидание запуска PostgreSQL..."
sleep 10

# Запускаем бэкенд
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

# Ждем запуска бэкенда
echo "⏳ Ожидание запуска Backend..."
sleep 15

# Пересобираем фронтенд с правильным API URL
echo "🔨 Пересборка фронтенда..."
cd frontend
docker build -t agb_etp-frontend --build-arg NEXT_PUBLIC_API_URL="http://81.200.158.192:8000" --no-cache .
cd ..

# Запускаем фронтенд
docker run -d --name agb_etp_frontend \
  --link agb_etp_backend:backend \
  -e NODE_ENV=production \
  -e NEXT_PUBLIC_API_URL=http://81.200.158.192:8000 \
  -p 3000:3000 \
  agb_etp-frontend

# Ждем запуска фронтенда
echo "⏳ Ожидание запуска Frontend..."
sleep 10

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
