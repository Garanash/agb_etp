#!/bin/bash

# 🔍 Диагностика системы Алмазгеобур ЭТП

echo "🔍 Диагностика системы Алмазгеобур ЭТП..."
echo "================================================"

# Проверяем PostgreSQL
echo "🐘 Проверка PostgreSQL:"
if systemctl is-active --quiet postgresql; then
    echo "✅ PostgreSQL запущен"
    echo "📊 Статус: $(systemctl is-active postgresql)"
else
    echo "❌ PostgreSQL не запущен"
fi

# Проверяем подключение к БД
echo ""
echo "🔌 Проверка подключения к базе данных:"
if sudo -u postgres psql -d agb_etp -c "SELECT 1;" > /dev/null 2>&1; then
    echo "✅ Подключение к БД успешно"
else
    echo "❌ Не удается подключиться к БД"
fi

# Проверяем Python
echo ""
echo "🐍 Проверка Python:"
echo "Версия: $(python3 --version)"
echo "Путь: $(which python3)"

# Проверяем Python модули
echo ""
echo "📦 Проверка Python модулей:"
python3 -c "
modules = ['fastapi', 'uvicorn', 'sqlalchemy', 'psycopg2', 'pydantic']
for module in modules:
    try:
        __import__(module)
        print(f'✅ {module}')
    except ImportError as e:
        print(f'❌ {module}: {e}')
"

# Проверяем Node.js
echo ""
echo "📦 Проверка Node.js:"
echo "Версия: $(node --version)"
echo "npm версия: $(npm --version)"

# Проверяем процессы
echo ""
echo "🔄 Проверка процессов:"
echo "Backend процессы:"
ps aux | grep "python3 main.py" | grep -v grep || echo "❌ Backend не запущен"

echo ""
echo "Frontend процессы:"
ps aux | grep "npm start" | grep -v grep || echo "❌ Frontend не запущен"

# Проверяем порты
echo ""
echo "🌐 Проверка портов:"
echo "Порт 8000 (Backend):"
netstat -tlnp | grep :8000 || echo "❌ Порт 8000 не занят"

echo "Порт 3000 (Frontend):"
netstat -tlnp | grep :3000 || echo "❌ Порт 3000 не занят"

echo "Порт 5432 (PostgreSQL):"
netstat -tlnp | grep :5432 || echo "❌ Порт 5432 не занят"

# Проверяем API
echo ""
echo "🔌 Проверка API:"
if curl -s http://localhost:8000/health > /dev/null; then
    echo "✅ Backend API отвечает"
else
    echo "❌ Backend API не отвечает"
fi

if curl -s http://localhost:3000 > /dev/null; then
    echo "✅ Frontend отвечает"
else
    echo "❌ Frontend не отвечает"
fi

# Проверяем логи
echo ""
echo "📋 Проверка логов:"
if [ -f "logs/backend.log" ]; then
    echo "✅ Лог Backend существует"
    echo "📊 Размер: $(wc -l < logs/backend.log) строк"
    echo "🔍 Последние 5 строк:"
    tail -5 logs/backend.log
else
    echo "❌ Лог Backend не найден"
fi

echo ""
if [ -f "logs/frontend.log" ]; then
    echo "✅ Лог Frontend существует"
    echo "📊 Размер: $(wc -l < logs/frontend.log) строк"
    echo "🔍 Последние 5 строк:"
    tail -5 logs/frontend.log
else
    echo "❌ Лог Frontend не найден"
fi

echo ""
echo "================================================"
echo "🔍 Диагностика завершена"
