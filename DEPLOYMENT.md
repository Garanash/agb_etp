# 🚀 Инструкция по развертыванию Алмазгеобур ЭТП

## 📋 Обзор архитектуры

- **PostgreSQL** - в Docker контейнере
- **Backend (FastAPI)** - нативно на сервере
- **Frontend (Next.js)** - нативно на сервере

## 🔧 Требования

### Системные требования:
- Ubuntu 20.04+ или Debian 10+
- Python 3.8+
- Node.js 18+
- Docker и Docker Compose
- PostgreSQL клиент

### Порты:
- **3000** - Frontend
- **8000** - Backend API
- **5432** - PostgreSQL

## 📦 Установка зависимостей

### 1. Обновление системы
```bash
sudo apt update && sudo apt upgrade -y
```

### 2. Установка Python и зависимостей
```bash
sudo apt install -y python3 python3-pip python3-venv python3-dev
```

### 3. Установка Node.js
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs npm
```

### 4. Установка Docker
```bash
sudo apt install -y docker.io docker-compose
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker $USER
```

### 5. Установка PostgreSQL клиента
```bash
sudo apt install -y postgresql-client
```

## 🚀 Развертывание

### 1. Клонирование репозитория
```bash
git clone https://github.com/Garanash/agb_etp.git
cd agb_etp
```

### 2. Установка зависимостей проекта
```bash
# Backend зависимости
cd backend
pip3 install --break-system-packages -r requirements.txt
cd ..

# Frontend зависимости
cd frontend
npm install
cd ..
```

### 3. Запуск приложения
```bash
# Сделать скрипты исполняемыми
chmod +x start.sh stop.sh

# Запустить приложение
./start.sh
```

## 🔍 Проверка работы

### Проверка сервисов:
```bash
# PostgreSQL (Docker)
docker ps | grep postgres

# Backend API
curl http://localhost:8000/health

# Frontend
curl http://localhost:3000
```

### Доступ к приложению:
- **Frontend**: http://your-server-ip:3000
- **Backend API**: http://your-server-ip:8000
- **API документация**: http://your-server-ip:8000/docs

## 🛠 Управление

### Запуск:
```bash
./start.sh
```

### Остановка:
```bash
./stop.sh
```

### Перезапуск:
```bash
./stop.sh
./start.sh
```

## 📊 Мониторинг

### Логи:
```bash
# Backend логи
tail -f logs/backend.log

# Frontend логи
tail -f logs/frontend.log

# PostgreSQL логи
docker logs agb_etp_postgres
```

### Статус процессов:
```bash
# Все процессы
ps aux | grep -E "(python3|node)" | grep -v grep

# Docker контейнеры
docker ps
```

## 🔧 Настройка

### Переменные окружения (.env):
```bash
# База данных
POSTGRES_USER=agb_etp
POSTGRES_PASSWORD=your_secure_password
POSTGRES_DB=agb_etp
POSTGRES_HOST=localhost
POSTGRES_PORT=5432

# Безопасность
SECRET_KEY=your_very_secure_secret_key
DEBUG=False

# CORS
CORS_ORIGINS=["http://localhost:3000", "http://your-server-ip:3000", "http://your-server-ip:8000"]

# Frontend
NEXT_PUBLIC_API_URL=http://your-server-ip:8000
```

### Изменение портов:
1. Отредактируйте `.env` файл
2. Измените порты в `start.sh`
3. Перезапустите приложение

## 🐛 Устранение неполадок

### Backend не запускается:
```bash
# Проверить логи
cat logs/backend.log

# Проверить зависимости
pip3 list | grep fastapi

# Переустановить зависимости
pip3 install --break-system-packages -r backend/requirements.txt
```

### Frontend не запускается:
```bash
# Проверить логи
cat logs/frontend.log

# Проверить зависимости
npm list

# Переустановить зависимости
cd frontend
npm install
npm run build
```

### PostgreSQL не запускается:
```bash
# Проверить логи
docker logs agb_etp_postgres

# Перезапустить
docker-compose -f docker-compose.db.yml restart
```

### Проблемы с портами:
```bash
# Проверить занятые порты
netstat -tlnp | grep -E ":(3000|8000|5432)"

# Освободить порты
sudo fuser -k 3000/tcp
sudo fuser -k 8000/tcp
```

## 🔒 Безопасность

### Рекомендации:
1. Измените пароли в `.env` файле
2. Настройте файрвол
3. Используйте HTTPS в продакшене
4. Регулярно обновляйте зависимости

### Файрвол:
```bash
# Разрешить порты
sudo ufw allow 3000
sudo ufw allow 8000
sudo ufw allow 5432

# Включить файрвол
sudo ufw enable
```

## 📈 Производительность

### Оптимизация:
1. Используйте reverse proxy (nginx)
2. Настройте кэширование
3. Мониторьте использование ресурсов
4. Настройте логирование

### Мониторинг ресурсов:
```bash
# CPU и память
htop

# Дисковое пространство
df -h

# Сетевые соединения
netstat -tlnp
```

## 🔄 Обновление

### Обновление кода:
```bash
# Остановить приложение
./stop.sh

# Обновить код
git pull

# Перезапустить
./start.sh
```

### Обновление зависимостей:
```bash
# Backend
cd backend
pip3 install --break-system-packages -r requirements.txt --upgrade

# Frontend
cd frontend
npm update
npm run build
```

## 📞 Поддержка

При возникновении проблем:
1. Проверьте логи
2. Убедитесь, что все зависимости установлены
3. Проверьте доступность портов
4. Перезапустите приложение

---

**Примечание**: Эта инструкция предназначена для развертывания на сервере Ubuntu/Debian. Для других операционных систем могут потребоваться дополнительные настройки.
