#!/bin/bash

# 📊 Мониторинг системы

echo "📊 Мониторинг Алмазгеобур ЭТП"
echo "================================"

# Проверка процессов
echo "🔍 Запущенные процессы:"
ps aux | grep -E "(python3|node|postgres)" | grep -v grep

echo ""
echo "💾 Использование памяти:"
free -h

echo ""
echo "💽 Использование диска:"
df -h

echo ""
echo "🌐 Сетевые соединения:"
netstat -tlnp | grep -E ":(3000|8000|5432)"

echo ""
echo "🔍 Статус сервисов:"

# Backend
if curl -s http://localhost:8000/health > /dev/null; then
    echo "✅ Backend: Работает"
else
    echo "❌ Backend: Не отвечает"
fi

# Frontend
if curl -s http://localhost:3000 > /dev/null; then
    echo "✅ Frontend: Работает"
else
    echo "❌ Frontend: Не отвечает"
fi

# PostgreSQL
if docker exec agb-postgres pg_isready -U agb_etp > /dev/null 2>&1; then
    echo "✅ PostgreSQL: Работает"
else
    echo "❌ PostgreSQL: Не отвечает"
fi

echo ""
echo "📋 Логи (последние 10 строк):"
echo "Backend:"
tail -n 10 logs/backend.log 2>/dev/null || echo "Лог не найден"

echo ""
echo "Frontend:"
tail -n 10 logs/frontend.log 2>/dev/null || echo "Лог не найден"

echo ""
echo "PostgreSQL:"
docker logs --tail 10 agb-postgres 2>/dev/null || echo "Лог не найден"
