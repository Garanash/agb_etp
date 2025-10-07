#!/bin/bash

# 🔄 Принудительное пересоздание администратора

echo "🔄 Принудительное пересоздание администратора..."

# Останавливаем Backend
echo "🛑 Остановка Backend..."
pkill -f "python3 main.py" 2>/dev/null || true
sleep 2

# Удаляем старого администратора из базы данных
echo "🗑️  Удаление старого администратора..."
docker exec agb-postgres psql -U agb_etp -d agb_etp -c "DELETE FROM users WHERE email = 'admin@almazgeobur.ru';" 2>/dev/null || true

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
    
    # Проверяем, что администратор создался
    echo "🔍 Проверка создания администратора..."
    docker exec agb-postgres psql -U agb_etp -d agb_etp -c "SELECT id, email, role, is_active FROM users WHERE email = 'admin@almazgeobur.ru';"
    
    # Останавливаем временный Backend
    echo "🛑 Остановка временного Backend..."
    kill $BACKEND_PID 2>/dev/null || true
    
    echo "✅ Администратор пересоздан!"
    echo "📧 Email: admin@almazgeobur.ru"
    echo "🔑 Пароль: admin"
else
    echo "❌ Backend не запустился"
    echo "Логи Backend:"
    cat logs/backend-temp.log
    exit 1
fi
