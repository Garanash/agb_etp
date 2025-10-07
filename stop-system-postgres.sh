#!/bin/bash

# 🛑 Остановка системного PostgreSQL (если мешает)

echo "🛑 Остановка системного PostgreSQL..."

# Остановка системного PostgreSQL
systemctl stop postgresql 2>/dev/null || true
systemctl disable postgresql 2>/dev/null || true

# Убиваем процессы PostgreSQL
pkill -f postgres 2>/dev/null || true

echo "✅ Системный PostgreSQL остановлен"
echo "💾 Текущее использование памяти:"
free -h
