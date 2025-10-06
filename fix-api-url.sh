#!/bin/bash

# Скрипт для исправления API URL в продакшене
echo "🔧 Исправление API URL для продакшена..."

# Проверяем, запущен ли в продакшене
if [ "$1" = "--prod" ]; then
    echo "📱 Настройка для продакшена..."
    
    # Останавливаем контейнеры
    echo "⏹️  Остановка контейнеров..."
    docker-compose down
    
    # Устанавливаем правильный API URL для продакшена
    echo "🔧 Установка API URL для продакшена..."
    export NEXT_PUBLIC_API_URL=""
    
    # Пересобираем фронтенд с правильным API URL
    echo "🔨 Пересборка фронтенда..."
    cd frontend
    docker build -t agb_etp-frontend --build-arg NEXT_PUBLIC_API_URL="" .
    cd ..
    
    # Запускаем в продакшене
    echo "🚀 Запуск в продакшене..."
    docker-compose -f docker-compose.prod.yml up -d
    
    echo "✅ Готово! API URL настроен для продакшена"
    echo "📱 Приложение доступно по адресу: http://$(hostname -I | awk '{print $1}')"
    echo "📚 API документация: http://$(hostname -I | awk '{print $1}')/api/ololo/docs"
    
else
    echo "📱 Настройка для разработки..."
    
    # Останавливаем контейнеры
    echo "⏹️  Остановка контейнеров..."
    docker-compose down
    
    # Устанавливаем API URL для разработки
    echo "🔧 Установка API URL для разработки..."
    export NEXT_PUBLIC_API_URL="http://localhost:8000"
    
    # Пересобираем фронтенд
    echo "🔨 Пересборка фронтенда..."
    cd frontend
    docker build -t agb_etp-frontend --build-arg NEXT_PUBLIC_API_URL="http://localhost:8000" .
    cd ..
    
    # Запускаем в режиме разработки
    echo "🚀 Запуск в режиме разработки..."
    docker-compose up -d
    
    echo "✅ Готово! API URL настроен для разработки"
    echo "📱 Frontend: http://localhost:3000"
    echo "🔌 Backend API: http://localhost:8000"
    echo "📚 API документация: http://localhost:8000/docs"
fi

echo ""
echo "🔍 Проверка статуса контейнеров:"
docker-compose ps
