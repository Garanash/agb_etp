#!/bin/bash

# 🛑 Остановка оптимизированной системы

echo "🛑 Остановка Алмазгеобур ЭТП..."

# Остановка Backend и Frontend
echo "⏹️  Остановка Backend и Frontend..."
pkill -f "python3 main.py" 2>/dev/null || true
pkill -f "npm start" 2>/dev/null || true

# Остановка PostgreSQL Docker контейнера
echo "⏹️  Остановка PostgreSQL..."
docker-compose -f docker-compose.postgres.yml down

# Очистка памяти
echo "🧹 Очистка памяти..."
sync
echo 3 > /proc/sys/vm/drop_caches 2>/dev/null || true

echo "✅ Все сервисы остановлены"
echo "💾 Текущее использование памяти:"
free -h
