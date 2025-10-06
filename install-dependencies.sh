#!/bin/bash

# Скрипт для установки всех необходимых зависимостей
echo "🔧 Установка зависимостей для запуска без Docker..."

# Обновляем систему
echo "📦 Обновление системы..."
apt-get update

# Устанавливаем Python и зависимости
echo "🐍 Установка Python и зависимостей..."
apt-get install -y python3 python3-pip python3-venv python3-dev

# Устанавливаем Node.js
echo "📦 Установка Node.js..."
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs npm

# Устанавливаем PostgreSQL
echo "🐘 Установка PostgreSQL..."
apt-get install -y postgresql postgresql-contrib

# Устанавливаем дополнительные зависимости
echo "📦 Установка дополнительных зависимостей..."
apt-get install -y curl wget git build-essential

# Запускаем PostgreSQL
echo "🚀 Запуск PostgreSQL..."
systemctl start postgresql
systemctl enable postgresql

# Настраиваем PostgreSQL
echo "🔧 Настройка PostgreSQL..."
sudo -u postgres psql -c "CREATE USER agb_etp WITH PASSWORD 'agb_secure_password_2024';" 2>/dev/null || true
sudo -u postgres psql -c "CREATE DATABASE agb_etp OWNER agb_etp;" 2>/dev/null || true
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE agb_etp TO agb_etp;" 2>/dev/null || true

# Создаем папку для логов
echo "📁 Создание папки для логов..."
mkdir -p logs

# Проверяем установку
echo "🔍 Проверка установки..."
echo "Python version: $(python3 --version)"
echo "Node.js version: $(node --version)"
echo "npm version: $(npm --version)"
echo "PostgreSQL version: $(psql --version)"

echo "✅ Зависимости установлены успешно!"
echo "Теперь можно запустить: ./run-without-docker.sh"
