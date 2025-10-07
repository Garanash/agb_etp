#!/bin/bash

echo "🔄 Пересборка frontend с новыми настройками..."

# Останавливаем контейнеры
echo "⏹️ Останавливаем контейнеры..."
docker-compose down

# Удаляем старые образы frontend
echo "🗑️ Удаляем старые образы frontend..."
docker rmi agb_etp_frontend 2>/dev/null || true

# Пересобираем frontend
echo "🔨 Пересобираем frontend..."
docker-compose build --no-cache frontend

# Запускаем контейнеры
echo "🚀 Запускаем контейнеры..."
docker-compose up -d

echo "✅ Пересборка завершена!"
echo "🌐 Приложение доступно по адресу: http://localhost:3000"
echo "📊 Логи frontend: docker-compose logs -f frontend"