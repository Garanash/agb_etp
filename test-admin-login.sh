#!/bin/bash

# 🧪 Тестирование входа администратора

echo "🧪 Тестирование входа администратора..."

# Проверяем, что Backend работает
echo "🔍 Проверка Backend..."
if curl -s http://localhost:8000/health > /dev/null; then
    echo "✅ Backend работает"
else
    echo "❌ Backend не работает"
    exit 1
fi

# Тестируем вход администратора
echo "🔐 Тестирование входа администратора..."
RESPONSE=$(curl -s -X POST http://localhost:8000/api/v1/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email": "admin@almazgeobur.ru", "password": "admin"}')

echo "📋 Ответ сервера:"
echo "$RESPONSE"

# Проверяем, содержит ли ответ access_token
if echo "$RESPONSE" | grep -q "access_token"; then
    echo "✅ Вход администратора успешен!"
    echo "🎉 Данные для входа:"
    echo "   Email: admin@almazgeobur.ru"
    echo "   Пароль: admin"
else
    echo "❌ Вход администратора не удался"
    echo "🔍 Проверьте логи Backend:"
    echo "   tail -f logs/backend.log"
fi
