#!/bin/bash

# Тестовый скрипт для проверки nginx конфигурации
echo "🔧 Тестирование nginx конфигурации..."

# Проверяем синтаксис nginx конфигурации
echo "📋 Проверка синтаксиса nginx конфигурации..."

# Создаем временный файл для проверки
cat > /tmp/nginx_test.conf << 'EOF'
events {
    worker_connections 1024;
}

http {
    include /etc/nginx/conf.d/agb-etp.conf;
}
EOF

# Проверяем, есть ли nginx в системе
if command -v nginx &> /dev/null; then
    echo "✅ Nginx найден в системе"
    if nginx -t -c /tmp/nginx_test.conf 2>/dev/null; then
        echo "✅ Синтаксис nginx конфигурации корректен"
    else
        echo "❌ Ошибка в синтаксисе nginx конфигурации"
        nginx -t -c /tmp/nginx_test.conf
        exit 1
    fi
else
    echo "⚠️  Nginx не найден в системе, пропускаем проверку синтаксиса"
fi

# Проверяем содержимое конфигурации
echo "📋 Проверка содержимого конфигурации..."

# Проверяем, что API docs настроены правильно
if grep -q "location /api/ololo/docs" nginx/conf.d/agb-etp.conf; then
    echo "✅ API docs настроены по адресу /api/ololo/docs"
else
    echo "❌ API docs не настроены правильно"
    exit 1
fi

if grep -q "location /api/ololo/redoc" nginx/conf.d/agb-etp.conf; then
    echo "✅ ReDoc настроен по адресу /api/ololo/redoc"
else
    echo "❌ ReDoc не настроен правильно"
    exit 1
fi

if grep -q "location /api/ololo/openapi.json" nginx/conf.d/agb-etp.conf; then
    echo "✅ OpenAPI схема настроена по адресу /api/ololo/openapi.json"
else
    echo "❌ OpenAPI схема не настроена правильно"
    exit 1
fi

# Проверяем, что frontend настроен как основной
if grep -q "location / {" nginx/conf.d/agb-etp.conf; then
    echo "✅ Frontend настроен как основное приложение (location /)"
else
    echo "❌ Frontend не настроен как основное приложение"
    exit 1
fi

# Очищаем временный файл
rm -f /tmp/nginx_test.conf

echo "🎉 Конфигурация nginx проверена успешно!"
echo ""
echo "📱 После деплоя приложение будет доступно:"
echo "   Основное приложение: http://yourdomain.com/"
echo "   API документация: http://yourdomain.com/api/ololo/docs"
echo "   ReDoc: http://yourdomain.com/api/ololo/redoc"
echo "   OpenAPI схема: http://yourdomain.com/api/ololo/openapi.json"
