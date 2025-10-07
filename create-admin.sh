#!/bin/bash

# 👤 Принудительное создание администратора

echo "👤 Создание администратора..."

# Останавливаем Backend
echo "🛑 Остановка Backend..."
pkill -f "python3 main.py" 2>/dev/null || true
sleep 2

# Запускаем Backend временно для создания администратора
echo "🚀 Запуск Backend для создания администратора..."
cd backend
nohup python3 main.py > ../logs/backend-temp.log 2>&1 &
BACKEND_PID=$!
cd ..

# Ждем запуска Backend
echo "⏳ Ожидание запуска Backend..."
sleep 10

# Проверяем Backend
if curl -s http://localhost:8000/health > /dev/null; then
    echo "✅ Backend запущен"
    
    # Создаем администратора
    echo "👤 Создание администратора..."
    cd backend
    python3 init_db.py
    cd ..
    
    # Останавливаем временный Backend
    echo "🛑 Остановка временного Backend..."
    kill $BACKEND_PID 2>/dev/null || true
    
    echo "✅ Администратор создан!"
    echo "📧 Email: admin@almazgeobur.ru"
    echo "🔑 Пароль: admin123"
else
    echo "❌ Backend не запустился"
    echo "Логи Backend:"
    cat logs/backend-temp.log
    exit 1
fi
