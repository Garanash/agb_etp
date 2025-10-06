#!/bin/bash

# Быстрое исправление API URL на сервере
echo "🚀 Быстрое исправление API URL на сервере..."

# Проверяем, что мы на сервере
if [ ! -f "docker-compose.prod.yml" ]; then
    echo "❌ Файл docker-compose.prod.yml не найден. Запустите скрипт в корне проекта."
    exit 1
fi

# Останавливаем все контейнеры
echo "⏹️  Остановка контейнеров..."
docker-compose down 2>/dev/null || true
docker-compose -f docker-compose.prod.yml down 2>/dev/null || true

# Устанавливаем правильный API URL для продакшена (пустой, чтобы использовать относительные пути)
echo "🔧 Установка API URL для продакшена..."
export NEXT_PUBLIC_API_URL=""

# Пересобираем фронтенд с правильным API URL
echo "🔨 Пересборка фронтенда с правильным API URL..."
cd frontend
docker build -t agb_etp-frontend --build-arg NEXT_PUBLIC_API_URL="" --no-cache .
cd ..

# Запускаем в продакшене
echo "🚀 Запуск в продакшене..."
docker-compose -f docker-compose.prod.yml up -d

# Ждем запуска
echo "⏳ Ожидание запуска сервисов..."
sleep 10

# Проверяем статус
echo "🔍 Проверка статуса контейнеров:"
docker-compose -f docker-compose.prod.yml ps

# Проверяем доступность
echo ""
echo "🔍 Проверка доступности API:"
if curl -s http://localhost/api/health > /dev/null; then
    echo "✅ API доступен через nginx"
else
    echo "❌ API недоступен через nginx"
fi

echo ""
echo "🎉 Исправление завершено!"
echo "📱 Приложение доступно по адресу: http://$(hostname -I | awk '{print $1}')"
echo "📚 API документация: http://$(hostname -I | awk '{print $1}')/api/ololo/docs"
echo ""
echo "🔍 Для проверки логов выполните:"
echo "   docker-compose -f docker-compose.prod.yml logs -f"
