# 🌐 Настройка Nginx для Алмазгеобур ЭТП

## 📋 Обзор конфигурации

После деплоя приложение будет доступно по следующим адресам:

### 🏠 Основное приложение
- **HTTP**: `http://yourdomain.com/`
- **HTTPS**: `https://yourdomain.com/`

### 📚 API Документация
- **Swagger UI**: `http://yourdomain.com/api/ololo/docs`
- **ReDoc**: `http://yourdomain.com/api/ololo/redoc`
- **OpenAPI схема**: `http://yourdomain.com/api/ololo/openapi.json`

### 🔌 API Эндпоинты
- **API**: `http://yourdomain.com/api/`

## 🚀 Деплой

### На сервере выполните:

```bash
# Обновить код
git pull

# Запустить тест конфигурации
./test-nginx-config.sh

# Деплой в продакшен
./deploy.sh --prod
```

## 🔧 Проверка работы

После деплоя проверьте:

1. **Основное приложение**: Откройте `http://yourdomain.com/`
2. **API документация**: Откройте `http://yourdomain.com/api/ololo/docs`
3. **API эндпоинты**: Проверьте `http://yourdomain.com/api/health`

## 📁 Структура конфигурации

```
nginx/
├── nginx.conf              # Основная конфигурация nginx
└── conf.d/
    └── agb-etp.conf        # Конфигурация виртуального хоста
```

## 🔒 SSL Сертификаты

Для продакшена замените самоподписанные сертификаты на валидные:

```bash
# Замените файлы в директории ssl/
ssl/cert.pem    # Ваш SSL сертификат
ssl/key.pem     # Ваш приватный ключ
```

## 🛠 Отладка

Если что-то не работает:

1. Проверьте логи nginx: `docker-compose logs nginx`
2. Проверьте статус контейнеров: `docker-compose ps`
3. Перезапустите nginx: `docker-compose restart nginx`

## 📊 Мониторинг

- **Health check**: `http://yourdomain.com/health`
- **Статус контейнеров**: `docker-compose ps`
- **Логи**: `docker-compose logs -f`
