# 🚀 Алмазгеобур ЭТП - Оптимизированная версия для сервера с 4GB RAM

## 📋 Описание

Оптимизированная версия системы для серверов с ограниченными ресурсами (4GB RAM):
- **Backend + Frontend**: работают нативно (без Docker)
- **PostgreSQL**: в Docker с ограничениями ресурсов
- **Минимальное потребление памяти**

## 🛠 Установка

### 1. Установка зависимостей
```bash
# Установка системных зависимостей
./install-dependencies.sh
```

### 2. Запуск системы
```bash
# Запуск всей системы одной командой
./run-optimized.sh
```

### 3. Остановка системы
```bash
# Остановка всех сервисов
./stop-optimized.sh
```

### 4. Мониторинг
```bash
# Проверка статуса системы
./monitor.sh
```

## 📊 Архитектура

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   PostgreSQL    │
│   (Next.js)     │    │   (FastAPI)     │    │   (Docker)      │
│   Port: 3000    │    │   Port: 8000    │    │   Port: 5432    │
│   Нативно       │    │   Нативно       │    │   Docker        │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 💾 Использование ресурсов

- **PostgreSQL**: 512MB RAM (ограничено)
- **Backend**: ~200-300MB RAM
- **Frontend**: ~100-200MB RAM
- **Общее**: ~1-1.5GB RAM

## 🔧 Конфигурация

### Переменные окружения
Скрипт автоматически создает `.env` файл с настройками:
- База данных: PostgreSQL в Docker
- CORS: настроен для всех необходимых доменов
- Безопасность: JWT токены

### Порты
- **Frontend**: 3000
- **Backend API**: 8000
- **PostgreSQL**: 5433

## 🚀 Быстрый старт

```bash
# 1. Клонировать репозиторий
git clone <repository-url>
cd agb_etp

# 2. Установить зависимости
./install-dependencies.sh

# 3. Запустить систему
./run-optimized.sh

# 4. Открыть в браузере
# Frontend: http://your-server-ip:3000
# API: http://your-server-ip:8000/docs
```

## 🔍 Мониторинг

### Проверка статуса
```bash
./monitor.sh
```

### Логи
```bash
# Backend
tail -f logs/backend.log

# Frontend
tail -f logs/frontend.log

# PostgreSQL
docker logs agb-postgres
```

### Использование памяти
```bash
free -h
```

## 🛠 Устранение неполадок

### Проблема: Не хватает памяти
```bash
# Очистить систему
./stop-optimized.sh
sync
echo 3 > /proc/sys/vm/drop_caches
./run-optimized.sh
```

### Проблема: PostgreSQL не запускается
```bash
# Проверить Docker
docker ps -a
docker logs agb-postgres

# Перезапустить PostgreSQL
docker-compose -f docker-compose.postgres.yml restart
```

### Проблема: Backend не отвечает
```bash
# Проверить логи
tail -f logs/backend.log

# Проверить порт
netstat -tlnp | grep 8000
```

## 📝 Особенности

1. **Автоматическое создание .env файлов**
2. **Оптимизация памяти для Node.js**
3. **Минимальный набор Python зависимостей**
4. **Ограничения ресурсов для PostgreSQL**
5. **Автоматическая инициализация базы данных**

## 🎯 Результат

После успешного запуска:
- ✅ Frontend: `http://your-server-ip:3000`
- ✅ Backend API: `http://your-server-ip:8000`
- ✅ API документация: `http://your-server-ip:8000/docs`
- ✅ PostgreSQL: `localhost:5433`

## 🔄 Обновление

```bash
# Обновить код
git pull

# Перезапустить систему
./stop-optimized.sh
./run-optimized.sh
```
