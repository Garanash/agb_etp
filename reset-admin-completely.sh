#!/bin/bash

# 🔄 Полный сброс и пересоздание администратора с новым хешером

echo "🔄 Полный сброс и пересоздание администратора..."

# Останавливаем все процессы
echo "🛑 Остановка всех процессов..."
pkill -f "python3 main.py" 2>/dev/null || true
pkill -f "npm start" 2>/dev/null || true
sleep 2

# Удаляем всех пользователей из базы данных
echo "🗑️  Удаление всех пользователей..."
docker exec agb-postgres psql -U agb_etp -d agb_etp -c "DELETE FROM users;" 2>/dev/null || true

# Проверяем, что таблица пуста
echo "🔍 Проверка таблицы пользователей..."
docker exec agb-postgres psql -U agb_etp -d agb_etp -c "SELECT COUNT(*) FROM users;"

# Запускаем Backend временно для создания администратора
echo "🚀 Запуск Backend для создания администратора..."
cd backend
nohup python3 main.py > ../logs/backend-temp.log 2>&1 &
BACKEND_PID=$!
cd ..

# Ждем запуска Backend
echo "⏳ Ожидание запуска Backend..."
sleep 15

# Проверяем Backend
if curl -s http://localhost:8000/health > /dev/null; then
    echo "✅ Backend запущен"
    
    # Создаем администратора
    echo "👤 Создание администратора с новым хешером..."
    cd backend
    python3 init_db.py
    cd ..
    
    # Проверяем, что администратор создался
    echo "🔍 Проверка создания администратора..."
    docker exec agb-postgres psql -U agb_etp -d agb_etp -c "SELECT id, email, role, is_active FROM users WHERE email = 'admin@almazgeobur.ru';"
    
    # Останавливаем временный Backend
    echo "🛑 Остановка временного Backend..."
    kill $BACKEND_PID 2>/dev/null || true
    
    echo "✅ Администратор создан с новым хешером!"
    echo "📧 Email: admin@almazgeobur.ru"
    echo "🔑 Пароль: admin"
else
    echo "❌ Backend не запустился"
    echo "Логи Backend:"
    cat logs/backend-temp.log
    exit 1
fi
