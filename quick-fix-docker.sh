#!/bin/bash

# 🔧 Быстрое исправление Docker PATH
# Простая версия для быстрого исправления

echo "🔧 Быстрое исправление Docker PATH..."

# Добавляем Docker в PATH
export PATH="/usr/bin:/usr/local/bin:/snap/bin:$PATH"

# Проверяем Docker
if command -v docker &> /dev/null; then
    echo "✅ Docker найден: $(docker --version)"
else
    echo "❌ Docker не найден"
    echo "Попробуйте:"
    echo "  export PATH=\"/usr/bin:/usr/local/bin:/snap/bin:\$PATH\""
    echo "  source ~/.bashrc"
    exit 1
fi

# Проверяем Docker Compose
if command -v docker-compose &> /dev/null; then
    echo "✅ Docker Compose найден: $(docker-compose --version)"
else
    echo "⚠️  Docker Compose не найден"
fi

echo "✅ Готово! Теперь можно использовать docker и docker-compose"
