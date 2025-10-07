#!/bin/bash

# 🔍 Проверка администратора в базе данных

echo "🔍 Проверка администратора в базе данных..."

# Проверяем подключение к PostgreSQL
echo "🔌 Проверка подключения к PostgreSQL..."
if docker exec agb-postgres pg_isready -U agb_etp; then
    echo "✅ PostgreSQL доступен"
else
    echo "❌ PostgreSQL недоступен"
    exit 1
fi

# Проверяем таблицы
echo "📋 Проверка таблиц..."
docker exec agb-postgres psql -U agb_etp -d agb_etp -c "\dt"

# Проверяем пользователей
echo "👥 Проверка пользователей..."
docker exec agb-postgres psql -U agb_etp -d agb_etp -c "SELECT id, email, role, is_active FROM users;"

# Проверяем конкретно администратора
echo "👤 Проверка администратора..."
docker exec agb-postgres psql -U agb_etp -d agb_etp -c "SELECT id, email, role, is_active, created_at FROM users WHERE email = 'admin@almazgeobur.ru';"

# Если администратора нет, создаем его
echo "🔧 Создание администратора..."
cd backend
python3 init_db.py
cd ..

echo "✅ Проверка завершена!"
