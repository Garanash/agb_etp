#!/bin/bash

# 🔍 Тестирование Backend

echo "🔍 Тестирование Backend..."

# Переходим в папку backend
cd backend

# Проверяем, что файл main.py существует
if [ ! -f "main.py" ]; then
    echo "❌ Файл main.py не найден"
    exit 1
fi

echo "✅ Файл main.py найден"

# Проверяем синтаксис Python
echo "🔍 Проверка синтаксиса Python..."
python3 -m py_compile main.py
if [ $? -eq 0 ]; then
    echo "✅ Синтаксис Python корректен"
else
    echo "❌ Ошибка синтаксиса Python"
    exit 1
fi

# Проверяем импорты
echo "🔍 Проверка импортов..."
python3 -c "
import sys
sys.path.append('.')
try:
    from main import app
    print('✅ Импорт app успешен')
except Exception as e:
    print(f'❌ Ошибка импорта app: {e}')
    exit(1)
"

if [ $? -ne 0 ]; then
    echo "❌ Ошибка импорта"
    exit 1
fi

# Запускаем Backend в режиме отладки
echo "🚀 Запуск Backend в режиме отладки..."
echo "Нажмите Ctrl+C для остановки"
python3 main.py
