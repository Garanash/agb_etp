#!/bin/bash

# 🏢 Алмазгеобур ЭТП - Остановка приложения

echo "🛑 Остановка Алмазгеобур ЭТП..."

# Останавливаем Frontend и Backend процессы
echo "⏹️  Остановка Frontend и Backend..."
pkill -f "python3 main.py" 2>/dev/null || true
pkill -f "npm start" 2>/dev/null || true

# Останавливаем PostgreSQL в Docker
echo "⏹️  Остановка PostgreSQL..."
docker-compose -f docker-compose.db.yml down

echo "✅ Все сервисы остановлены"
