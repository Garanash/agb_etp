#!/bin/bash

# 🔧 Быстрое исправление Docker PATH
# Простая версия для быстрого исправления

echo "🔧 Быстрое исправление Docker PATH..."

# Добавляем Docker в PATH
export PATH="/usr/bin:/usr/local/bin:/snap/bin:$PATH"

# Проверяем Docker
if command -v docker &> /dev/null; then
    DOCKER_VERSION=$(docker --version 2>/dev/null || echo "не отвечает")
    echo "✅ Docker найден: $DOCKER_VERSION"
else
    echo "❌ Docker не найден"
    echo "Попробуйте:"
    echo "  export PATH=\"/usr/bin:/usr/local/bin:/snap/bin:\$PATH\""
    echo "  source ~/.bashrc"
    exit 1
fi

# Проверяем Docker Compose
if command -v docker-compose &> /dev/null; then
    COMPOSE_VERSION=$(docker-compose --version 2>/dev/null || echo "не отвечает")
    echo "✅ Docker Compose найден: $COMPOSE_VERSION"
else
    echo "⚠️  Docker Compose не найден"
fi

echo "✅ Готово! Теперь можно использовать docker и docker-compose"
