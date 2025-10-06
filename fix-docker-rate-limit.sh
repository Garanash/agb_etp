#!/bin/bash

# Скрипт для решения проблемы с Docker rate limit
echo "🔧 Решение проблемы с Docker rate limit..."

# Останавливаем все контейнеры
echo "⏹️  Остановка всех контейнеров..."
docker-compose down 2>/dev/null || true
docker-compose -f docker-compose.prod.yml down 2>/dev/null || true

# Очищаем неиспользуемые образы
echo "🧹 Очистка неиспользуемых образов..."
docker image prune -f

# Создаем .env файл
echo "📝 Создание .env файла..."
./create-env.sh

# Используем локальные образы вместо загрузки из Docker Hub
echo "🔨 Сборка образов локально..."

# Собираем backend
echo "  - Сборка backend..."
cd backend
docker build -t agb_etp-backend .
cd ..

# Собираем frontend с правильным API URL
echo "  - Сборка frontend..."
cd frontend
docker build -t agb_etp-frontend --build-arg NEXT_PUBLIC_API_URL="" .
cd ..

# Используем локальные образы в docker-compose
echo "🔧 Обновление docker-compose.prod.yml для использования локальных образов..."

# Создаем временный docker-compose файл с локальными образами
cat > docker-compose.local.yml << 'EOF'
version: '3.8'

services:
  postgres:
    image: postgres:14-alpine
    container_name: agb_etp_postgres_prod
    restart: unless-stopped
    environment:
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: ${POSTGRES_DB}
      POSTGRES_INITDB_ARGS: "--encoding=UTF-8 --lc-collate=C --lc-ctype=C"
    ports:
      - "5432:5432"
    volumes:
      - postgres_data_prod:/var/lib/postgresql/data
      - ./backups:/backups
    networks:
      - agb_network_prod
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER} -d ${POSTGRES_DB}"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 30s

  backend:
    image: agb_etp-backend
    container_name: agb_etp_backend_prod
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
      - agb_network_prod
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
    container_name: agb_etp_frontend_prod
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
      - agb_network_prod
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  nginx:
    image: nginx:alpine
    container_name: agb_etp_nginx_prod
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/conf.d:/etc/nginx/conf.d:ro
      - ./ssl:/etc/nginx/ssl:ro
      - ./logs/nginx:/var/log/nginx
    depends_on:
      - frontend
      - backend
    networks:
      - agb_network_prod
    healthcheck:
      test: ["CMD", "nginx", "-t"]
      interval: 30s
      timeout: 10s
      retries: 3

volumes:
  postgres_data_prod:

networks:
  agb_network_prod:
    driver: bridge
EOF

# Запускаем с локальными образами
echo "🚀 Запуск с локальными образами..."
docker-compose -f docker-compose.local.yml up -d

# Ждем запуска
echo "⏳ Ожидание запуска сервисов..."
sleep 15

# Проверяем статус
echo "🔍 Проверка статуса контейнеров:"
docker-compose -f docker-compose.local.yml ps

# Проверяем доступность
echo ""
echo "🔍 Проверка доступности:"
if curl -s http://localhost/api/health > /dev/null; then
    echo "✅ API доступен через nginx"
else
    echo "❌ API недоступен через nginx"
fi

if curl -s http://localhost/ > /dev/null; then
    echo "✅ Frontend доступен"
else
    echo "❌ Frontend недоступен"
fi

echo ""
echo "🎉 Исправление завершено!"
echo "📱 Приложение доступно по адресу: http://$(hostname -I | awk '{print $1}')"
echo "📚 API документация: http://$(hostname -I | awk '{print $1}')/api/ololo/docs"
echo ""
echo "🔍 Для проверки логов выполните:"
echo "   docker-compose -f docker-compose.local.yml logs -f"
