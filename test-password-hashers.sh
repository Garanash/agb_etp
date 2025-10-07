#!/bin/bash

# 🔍 Проверка хешера паролей

echo "🔍 Проверка хешера паролей..."

# Создаем тестовый скрипт Python
cat > test_password_hash.py << 'EOF'
from passlib.context import CryptContext
import sys

# Тестируем разные хешеры
hashers = ["bcrypt", "sha256_crypt", "pbkdf2_sha256"]

for scheme in hashers:
    try:
        print(f"\n🔧 Тестирование {scheme}:")
        pwd_context = CryptContext(schemes=[scheme], deprecated="auto")
        
        # Хешируем пароль
        password = "admin"
        hashed = pwd_context.hash(password)
        print(f"   Хеш: {hashed}")
        
        # Проверяем пароль
        is_valid = pwd_context.verify(password, hashed)
        print(f"   Проверка: {'✅ Успешно' if is_valid else '❌ Ошибка'}")
        
    except Exception as e:
        print(f"   ❌ Ошибка: {e}")

print("\n✅ Тестирование завершено")
EOF

# Запускаем тест
echo "🧪 Запуск теста хешеров..."
cd backend
python3 ../test_password_hash.py
cd ..

# Удаляем тестовый файл
rm -f test_password_hash.py

echo "✅ Проверка хешеров завершена"
