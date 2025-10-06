#!/bin/bash

# Тестовый скрипт для проверки Docker сборки
echo "🔧 Тестирование Docker сборки frontend..."

# Переходим в директорию frontend
cd frontend

# Проверяем, что файл auth.ts существует
if [ -f "auth.ts" ]; then
    echo "✅ Файл auth.ts найден"
else
    echo "❌ Файл auth.ts не найден"
    exit 1
fi

# Проверяем содержимое файла
if grep -q "export const AUTH_TOKEN_KEY" auth.ts; then
    echo "✅ Файл auth.ts содержит правильный код"
else
    echo "❌ Файл auth.ts не содержит ожидаемый код"
    exit 1
fi

# Тестируем локальную сборку
echo "🔨 Тестирование локальной сборки..."
if npm run build; then
    echo "✅ Локальная сборка прошла успешно"
else
    echo "❌ Локальная сборка не удалась"
    exit 1
fi

# Тестируем Docker сборку
echo "🐳 Тестирование Docker сборки..."
cd ..
if docker-compose build frontend --no-cache; then
    echo "✅ Docker сборка прошла успешно"
else
    echo "❌ Docker сборка не удалась"
    exit 1
fi

echo "🎉 Все тесты прошли успешно!"
