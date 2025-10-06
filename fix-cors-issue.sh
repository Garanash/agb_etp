#!/bin/bash

# Скрипт для исправления CORS проблемы
echo "🔧 Исправление CORS проблемы..."

# Останавливаем контейнеры
echo "⏹️  Остановка контейнеров..."
docker-compose down 2>/dev/null || true
docker-compose -f docker-compose.prod.yml down 2>/dev/null || true
docker-compose -f docker-compose.local.yml down 2>/dev/null || true

# Удаляем старый образ фронтенда
echo "🗑️  Удаление старого образа фронтенда..."
docker rmi agb_etp-frontend 2>/dev/null || true

# Пересобираем фронтенд с пустым API URL (относительные пути)
echo "🔨 Пересборка фронтенда с правильным API URL..."
cd frontend
docker build -t agb_etp-frontend --build-arg NEXT_PUBLIC_API_URL="" --no-cache .
cd ..

# Создаем .env файл если его нет
if [ ! -f ".env" ]; then
    echo "📝 Создание .env файла..."
    cat > .env << 'EOF'
POSTGRES_USER=agb_etp
POSTGRES_PASSWORD=agb_secure_password_2024
POSTGRES_DB=agb_etp
POSTGRES_HOST=postgres
POSTGRES_PORT=5432
DATABASE_URL=postgresql://agb_etp:agb_secure_password_2024@postgres:5432/agb_etp
SECRET_KEY=agb_very_secure_secret_key_2024_change_in_production
DEBUG=False
CORS_ORIGINS=["http://localhost", "http://81.200.158.192", "https://81.200.158.192"]
ALLOWED_FILE_TYPES=pdf,doc,docx,xls,xlsx,jpg,jpeg,png
MAX_FILE_SIZE=10485760
NEXT_PUBLIC_API_URL=
LOG_LEVEL=INFO
EOF
fi

# Запускаем с локальными образами
echo "🚀 Запуск с исправленным фронтендом..."
docker-compose -f docker-compose.local.yml up -d

# Ждем запуска
echo "⏳ Ожидание запуска сервисов..."
sleep 20

# Проверяем статус
echo "🔍 Проверка статуса контейнеров:"
docker-compose -f docker-compose.local.yml ps

# Проверяем доступность
echo ""
echo "🔍 Проверка доступности:"
if curl -s http://localhost/api/health > /dev/null; then
    echo "✅ API доступен через nginx"
else
    echo "❌ API недоступен через nginx"
fi

if curl -s http://localhost/ > /dev/null; then
    echo "✅ Frontend доступен"
else
    echo "❌ Frontend недоступен"
fi

# Проверяем CORS
echo ""
echo "🔍 Проверка CORS:"
if curl -s -H "Origin: http://81.200.158.192" -H "Access-Control-Request-Method: POST" -H "Access-Control-Request-Headers: Content-Type" -X OPTIONS http://localhost/api/v1/auth/login | grep -q "Access-Control-Allow-Origin"; then
    echo "✅ CORS настроен правильно"
else
    echo "❌ CORS не настроен"
fi

echo ""
echo "🎉 Исправление завершено!"
echo "📱 Приложение доступно по адресу: http://$(hostname -I | awk '{print $1}')"
echo "📚 API документация: http://$(hostname -I | awk '{print $1}')/api/ololo/docs"
echo ""
echo "🔍 Для проверки логов выполните:"
echo "   docker-compose -f docker-compose.local.yml logs -f"
