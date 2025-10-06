#!/bin/bash

# 📦 Оптимизированная установка Frontend зависимостей

echo "📦 Оптимизированная установка Frontend зависимостей..."

cd frontend

# Очищаем кэш npm
echo "🧹 Очистка кэша npm..."
npm cache clean --force

# Устанавливаем зависимости с оптимизацией памяти
echo "📦 Установка зависимостей с оптимизацией памяти..."
export NODE_OPTIONS="--max-old-space-size=1024"
npm install --no-audit --no-fund --prefer-offline

if [ $? -ne 0 ]; then
    echo "⚠️  Первая попытка не удалась, пробуем с минимальными зависимостями..."
    
    # Удаляем node_modules и package-lock.json
    rm -rf node_modules package-lock.json
    
    # Устанавливаем только production зависимости
    npm install --production --no-audit --no-fund --prefer-offline
    
    if [ $? -ne 0 ]; then
        echo "❌ Ошибка установки зависимостей Frontend"
        exit 1
    fi
fi

echo "✅ Зависимости Frontend установлены успешно!"

# Проверяем, что Next.js доступен
if [ -f "node_modules/.bin/next" ]; then
    echo "✅ Next.js найден"
else
    echo "❌ Next.js не найден"
    exit 1
fi

cd ..
