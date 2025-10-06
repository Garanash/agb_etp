#!/bin/bash

# 🚀 Запуск только Frontend

echo "🚀 Запуск только Frontend..."

# Останавливаем предыдущие процессы Frontend
echo "🛑 Остановка предыдущих процессов Frontend..."
pkill -f "npm start" 2>/dev/null || true
sleep 2

# Устанавливаем зависимости Frontend
echo "📦 Установка Node.js зависимостей..."
./install-frontend.sh
if [ $? -ne 0 ]; then
    echo "❌ Ошибка установки зависимостей Frontend"
    exit 1
fi

cd frontend

# Создаем .env.local для Next.js
echo "📝 Создание .env.local для Next.js..."
cat > .env.local << 'EOF'
NEXT_PUBLIC_API_URL=http://81.200.158.192:8000
EOF

# Собираем фронтенд
echo "🔨 Сборка Frontend..."
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Ошибка сборки Frontend"
    exit 1
fi

# Запускаем Frontend
echo "🚀 Запуск Frontend в фоне..."
nohup npm start > ../logs/frontend.log 2>&1 &
FRONTEND_PID=$!
echo "Frontend PID: $FRONTEND_PID"

cd ..

# Ждем запуска Frontend
echo "⏳ Ожидание запуска Frontend..."
sleep 15

# Проверяем, что Frontend запустился
echo "🔍 Проверка статуса Frontend..."
if curl -s http://localhost:3000 | grep -q "html"; then
    echo "✅ Frontend запущен"
    echo "📱 Frontend доступен по адресу: http://81.200.158.192:3000"
else
    echo "❌ Frontend не запустился"
    echo "Логи Frontend:"
    cat logs/frontend.log
    exit 1
fi

echo "🎉 Frontend запущен успешно!"
echo "📊 Frontend PID: $FRONTEND_PID"
