#!/bin/bash

# 🔧 Исправление проблем с портами

echo "🔧 Исправление проблем с портами..."

# Остановка всех процессов
echo "🛑 Остановка всех процессов..."
pkill -f "python3 main.py" 2>/dev/null || true
pkill -f "npm start" 2>/dev/null || true
pkill -f "next start" 2>/dev/null || true
pkill -f "node.*next" 2>/dev/null || true

# Принудительная очистка портов
echo "🔍 Принудительная очистка портов..."
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
lsof -ti:8000 | xargs kill -9 2>/dev/null || true

# Дополнительная очистка
echo "🧹 Дополнительная очистка..."
fuser -k 3000/tcp 2>/dev/null || true
fuser -k 8000/tcp 2>/dev/null || true

sleep 3

# Проверка портов
echo "🔍 Проверка портов..."
if lsof -i:3000 > /dev/null 2>&1; then
    echo "❌ Порт 3000 все еще занят"
    lsof -i:3000
else
    echo "✅ Порт 3000 свободен"
fi

if lsof -i:8000 > /dev/null 2>&1; then
    echo "❌ Порт 8000 все еще занят"
    lsof -i:8000
else
    echo "✅ Порт 8000 свободен"
fi

echo "🎉 Исправление завершено!"
echo "Теперь можно запустить: ./run-optimized.sh"
