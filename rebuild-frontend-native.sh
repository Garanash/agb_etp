#!/bin/bash

# 🔨 Пересборка Frontend (нативный запуск)

echo "🔨 Пересборка Frontend..."

# Останавливаем Frontend
echo "🛑 Остановка Frontend..."
pkill -f "npm start" 2>/dev/null || true
sleep 2

cd frontend

# Полная очистка
echo "🧹 Полная очистка frontend..."
rm -rf .next
rm -rf node_modules
rm -f package-lock.json
npm cache clean --force

# Устанавливаем зависимости
echo "📦 Установка зависимостей..."
export NODE_OPTIONS="--max-old-space-size=512"
npm install --no-audit --no-fund --prefer-offline

# Собираем Frontend
echo "🔨 Сборка Frontend..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Ошибка сборки Frontend"
    exit 1
fi

# Запускаем Frontend
echo "🚀 Запуск Frontend..."
nohup npm start > ../logs/frontend.log 2>&1 &
FRONTEND_PID=$!
echo "Frontend PID: $FRONTEND_PID"

cd ..

# Ждем запуска
echo "⏳ Ожидание запуска Frontend..."
sleep 15

# Проверяем
if curl -s http://localhost:3000 | grep -q "html"; then
    echo "✅ Frontend пересобран и запущен"
else
    echo "❌ Frontend не запустился"
    echo "Логи Frontend:"
    cat logs/frontend.log
    exit 1
fi

echo "🎉 Frontend успешно пересобран!"
echo "🌐 Доступен по адресу: http://localhost:3000"
echo "🔍 Логи: tail -f logs/frontend.log"
