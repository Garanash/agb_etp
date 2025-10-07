#!/bin/bash

# 🔄 Полный сброс системы

echo "🔄 Полный сброс системы Алмазгеобур ЭТП..."

# Остановка всех процессов
echo "🛑 Остановка всех процессов..."
pkill -f "python3 main.py" 2>/dev/null || true
pkill -f "npm start" 2>/dev/null || true

# Остановка и удаление PostgreSQL
echo "🗑️  Остановка и удаление PostgreSQL..."
docker-compose -f docker-compose.postgres.yml down
docker volume rm agb_etp_postgres_data 2>/dev/null || true
docker volume prune -f

# Очистка логов
echo "🧹 Очистка логов..."
rm -rf logs/* 2>/dev/null || true
mkdir -p logs

# Очистка кэша npm
echo "🧹 Очистка кэша npm..."
cd frontend
npm cache clean --force 2>/dev/null || true
rm -rf node_modules package-lock.json 2>/dev/null || true
cd ..

# Очистка памяти
echo "🧹 Очистка памяти..."
sync
echo 3 > /proc/sys/vm/drop_caches 2>/dev/null || true

echo "✅ Система сброшена!"
echo "💾 Текущее использование памяти:"
free -h

echo ""
echo "🚀 Теперь можно запустить систему:"
echo "   ./run-optimized.sh"
