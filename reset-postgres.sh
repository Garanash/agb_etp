#!/bin/bash

# 🔄 Сброс PostgreSQL для исправления конфликта версий

echo "🔄 Сброс PostgreSQL..."

# Остановка и удаление контейнера
echo "🛑 Остановка PostgreSQL контейнера..."
docker-compose -f docker-compose.postgres.yml down

# Удаление volume с данными
echo "🗑️  Удаление старых данных PostgreSQL..."
docker volume rm agb_etp_postgres_data 2>/dev/null || true

# Очистка неиспользуемых volumes
echo "🧹 Очистка неиспользуемых volumes..."
docker volume prune -f

# Запуск PostgreSQL заново
echo "🚀 Запуск PostgreSQL с чистыми данными..."
docker-compose -f docker-compose.postgres.yml up -d

# Ждем запуска
echo "⏳ Ожидание запуска PostgreSQL..."
sleep 20

# Проверка
echo "🔍 Проверка PostgreSQL..."
if docker exec agb-postgres pg_isready -U agb_etp; then
    echo "✅ PostgreSQL запущен успешно!"
    echo "💾 Текущее использование памяти:"
    free -h
else
    echo "❌ PostgreSQL не запустился"
    echo "Логи PostgreSQL:"
    docker logs agb-postgres
    exit 1
fi
