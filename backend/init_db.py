#!/usr/bin/env python3
"""
Скрипт для инициализации базы данных и создания администратора
"""

from sqlalchemy.orm import Session
from database import SessionLocal, engine
from models import Base, User, UserRole
from auth import get_password_hash
import sys

def create_tables():
    """Создание всех таблиц в базе данных"""
    print("Создание таблиц в базе данных...")
    Base.metadata.create_all(bind=engine)
    print("Таблицы созданы успешно!")

def create_admin():
    """Создание администратора по умолчанию"""
    db = SessionLocal()
    try:
        # Проверяем, есть ли уже администратор
        admin = db.query(User).filter(User.email == "admin@almazgeobur.ru").first()
        if admin:
            print("Администратор уже существует!")
            return
        
        # Создаем администратора
        admin_user = User(
            email="admin@almazgeobur.ru",
            hashed_password=get_password_hash("admin123"[:72]),  # Ограничиваем длину пароля для bcrypt
            full_name="Администратор системы",
            role=UserRole.ADMIN,
            is_active=True
        )
        
        db.add(admin_user)
        db.commit()
        print("Администратор создан успешно!")
        print("Email: admin@almazgeobur.ru")
        print("Пароль: admin123")
        
    except Exception as e:
        print(f"Ошибка при создании администратора: {e}")
        db.rollback()
    finally:
        db.close()

def main():
    """Основная функция"""
    print("Инициализация базы данных...")
    
    try:
        create_tables()
        create_admin()
        print("\nИнициализация завершена успешно!")
        print("Теперь вы можете запустить сервер командой: uvicorn main:app --reload")
        
    except Exception as e:
        print(f"Ошибка при инициализации: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
