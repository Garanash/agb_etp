#!/bin/bash

# 🔍 Проверка конфигурации

echo "🔍 Проверка конфигурации..."

# Проверяем .env файл
if [ -f ".env" ]; then
    echo "✅ .env файл существует"
    echo "📋 Содержимое .env:"
    cat .env
else
    echo "❌ .env файл не найден"
fi

echo ""

# Проверяем переменные окружения
echo "🌍 Переменные окружения:"
echo "DATABASE_URL: $DATABASE_URL"
echo "POSTGRES_HOST: $POSTGRES_HOST"
echo "POSTGRES_PORT: $POSTGRES_PORT"
echo "POSTGRES_USER: $POSTGRES_USER"
echo "POSTGRES_DB: $POSTGRES_DB"

echo ""

# Проверяем подключение к PostgreSQL
echo "🐘 Проверка PostgreSQL:"
if systemctl is-active --quiet postgresql; then
    echo "✅ PostgreSQL запущен"
else
    echo "❌ PostgreSQL не запущен"
fi

echo ""

# Проверяем подключение к базе данных
echo "🔌 Проверка подключения к БД:"
if sudo -u postgres psql -d agb_etp -c "SELECT 1;" > /dev/null 2>&1; then
    echo "✅ Подключение к БД успешно"
else
    echo "❌ Не удается подключиться к БД"
    echo "Попытка подключения:"
    sudo -u postgres psql -d agb_etp -c "SELECT 1;"
fi

echo ""

# Проверяем Python модули
echo "🐍 Проверка Python модулей:"
python3 -c "
import os
print(f'DATABASE_URL: {os.getenv(\"DATABASE_URL\", \"НЕ УСТАНОВЛЕНО\")}')
print(f'POSTGRES_HOST: {os.getenv(\"POSTGRES_HOST\", \"НЕ УСТАНОВЛЕНО\")}')
print(f'POSTGRES_PORT: {os.getenv(\"POSTGRES_PORT\", \"НЕ УСТАНОВЛЕНО\")}')
print(f'POSTGRES_USER: {os.getenv(\"POSTGRES_USER\", \"НЕ УСТАНОВЛЕНО\")}')
print(f'POSTGRES_DB: {os.getenv(\"POSTGRES_DB\", \"НЕ УСТАНОВЛЕНО\")}')
"

echo ""

# Проверяем импорт конфигурации
echo "⚙️ Проверка импорта конфигурации:"
cd backend
python3 -c "
try:
    from config import settings
    print(f'✅ Конфигурация загружена')
    print(f'DATABASE_URL: {settings.database_url}')
    print(f'POSTGRES_HOST: {settings.postgres_host}')
    print(f'POSTGRES_PORT: {settings.postgres_port}')
    print(f'POSTGRES_USER: {settings.postgres_user}')
    print(f'POSTGRES_DB: {settings.postgres_db}')
except Exception as e:
    print(f'❌ Ошибка загрузки конфигурации: {e}')
"
cd ..
