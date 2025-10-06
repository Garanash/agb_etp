#!/bin/bash

# Скрипт для запуска без nginx (обход Docker rate limit)
echo "🔧 Запуск без nginx для обхода Docker rate limit..."

# Останавливаем все контейнеры
echo "⏹️  Остановка контейнеров..."
docker-compose down 2>/dev/null || true
docker-compose -f docker-compose.prod.yml down 2>/dev/null || true
docker-compose -f docker-compose.local.yml down 2>/dev/null || true

# Удаляем старый образ фронтенда
echo "🗑️  Удаление старого образа фронтенда..."
docker rmi agb_etp-frontend 2>/dev/null || true

# Пересобираем фронтенд с пустым API URL
echo "🔨 Пересборка фронтенда с правильным API URL..."
cd frontend
docker build -t agb_etp-frontend --build-arg NEXT_PUBLIC_API_URL="http://81.200.158.192:8000" --no-cache .
cd ..

# Создаем .env файл если его нет
if [ ! -f ".env" ]; then
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
fi

# Создаем простой docker-compose без nginx
echo "📝 Создание docker-compose без nginx..."
cat > docker-compose.simple.yml << 'EOF'
services:
  postgres:
    image: postgres:14-alpine
    container_name: agb_etp_postgres
    restart: unless-stopped
    environment:
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: ${POSTGRES_DB}
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - agb_network

  backend:
    image: agb_etp-backend
    container_name: agb_etp_backend
    restart: unless-stopped
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - POSTGRES_USER=${POSTGRES_USER}
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
      - POSTGRES_DB=${POSTGRES_DB}
      - POSTGRES_HOST=postgres
      - POSTGRES_PORT=5432
      - SECRET_KEY=${SECRET_KEY}
      - DEBUG=${DEBUG}
      - CORS_ORIGINS=${CORS_ORIGINS}
      - ALLOWED_FILE_TYPES=${ALLOWED_FILE_TYPES}
      - MAX_FILE_SIZE=${MAX_FILE_SIZE}
      - LOG_LEVEL=${LOG_LEVEL}
    ports:
      - "8000:8000"
    depends_on:
      postgres:
        condition: service_healthy
    networks:
      - agb_network
    volumes:
      - ./uploads:/app/uploads
      - ./logs/backend:/app/logs
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  frontend:
    image: agb_etp-frontend
    container_name: agb_etp_frontend
    restart: unless-stopped
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
    ports:
      - "3000:3000"
    depends_on:
      backend:
        condition: service_healthy
    networks:
      - agb_network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

volumes:
  postgres_data:

networks:
  agb_network:
    driver: bridge
EOF

# Запускаем без nginx
echo "🚀 Запуск без nginx..."
docker-compose -f docker-compose.simple.yml up -d

# Ждем запуска
echo "⏳ Ожидание запуска сервисов..."
sleep 20

# Проверяем статус
echo "🔍 Проверка статуса контейнеров:"
docker-compose -f docker-compose.simple.yml ps

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

# Проверяем CORS
echo ""
echo "🔍 Проверка CORS:"
if curl -s -H "Origin: http://81.200.158.192:3000" -H "Access-Control-Request-Method: POST" -H "Access-Control-Request-Headers: Content-Type" -X OPTIONS http://localhost:8000/api/v1/auth/login | grep -q "Access-Control-Allow-Origin"; then
    echo "✅ CORS настроен правильно"
else
    echo "❌ CORS не настроен"
fi

echo ""
echo "🎉 Запуск завершен!"
echo "📱 Frontend доступен по адресу: http://81.200.158.192:3000"
echo "🔌 Backend API доступен по адресу: http://81.200.158.192:8000"
echo "📚 API документация: http://81.200.158.192:8000/docs"
echo ""
echo "🔍 Для проверки логов выполните:"
echo "   docker-compose -f docker-compose.simple.yml logs -f"
