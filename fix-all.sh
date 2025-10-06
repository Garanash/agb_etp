#!/bin/bash

# 🔧 Полное исправление всех проблем

echo "🔧 Полное исправление системы Алмазгеобур ЭТП..."

# Останавливаем все процессы
echo "🛑 Остановка всех процессов..."
pkill -f "python3 main.py" 2>/dev/null || true
pkill -f "npm start" 2>/dev/null || true
sleep 3

# Перезапускаем PostgreSQL
echo "🔄 Перезапуск PostgreSQL..."
systemctl restart postgresql
sleep 5

# Проверяем PostgreSQL
if systemctl is-active --quiet postgresql; then
    echo "✅ PostgreSQL перезапущен"
else
    echo "❌ Ошибка перезапуска PostgreSQL"
    exit 1
fi

# Пересоздаем пользователя и базу данных
echo "🔧 Пересоздание базы данных..."
sudo -u postgres psql -c "DROP DATABASE IF EXISTS agb_etp;" 2>/dev/null || true
sudo -u postgres psql -c "DROP USER IF EXISTS agb_etp;" 2>/dev/null || true
sudo -u postgres psql -c "CREATE USER agb_etp WITH PASSWORD 'agb_secure_password_2024';"
sudo -u postgres psql -c "CREATE DATABASE agb_etp OWNER agb_etp;"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE agb_etp TO agb_etp;"

# Очищаем кэш pip
echo "🧹 Очистка кэша pip..."
pip3 cache purge 2>/dev/null || true

# Переустанавливаем зависимости
echo "📦 Переустановка Python зависимостей..."
cd backend
pip3 install --break-system-packages --force-reinstall -r requirements.txt
cd ..

# Очищаем node_modules
echo "🧹 Очистка node_modules..."
cd frontend
rm -rf node_modules package-lock.json
npm install
cd ..

# Очищаем логи
echo "🧹 Очистка логов..."
rm -f logs/backend.log logs/frontend.log

echo "✅ Исправление завершено!"
echo "Теперь запустите: ./start-server.sh"
