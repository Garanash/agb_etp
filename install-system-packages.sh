#!/bin/bash

# Скрипт для установки Python пакетов через системные пакеты
echo "🔧 Установка Python пакетов через системные пакеты..."

# Обновляем систему
echo "📦 Обновление системы..."
apt-get update

# Устанавливаем Python пакеты через apt
echo "🐍 Установка Python пакетов через apt..."
apt-get install -y python3-fastapi python3-uvicorn python3-sqlalchemy python3-psycopg2 python3-pydantic python3-passlib python3-bcrypt python3-pandas python3-numpy python3-openpyxl

# Устанавливаем дополнительные пакеты через pip
echo "📦 Установка дополнительных пакетов через pip..."
pip3 install --break-system-packages python-jose python-multipart pydantic-settings email-validator

echo "✅ Python пакеты установлены успешно!"
