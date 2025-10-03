"""
Скрипт для создания тестовых пользователей с разными ролями
"""

from sqlalchemy.orm import Session
from database import SessionLocal, engine
from models import User, UserRole
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def create_test_users():
    db = SessionLocal()
    
    try:
        # Проверяем существующих пользователей
        existing_users = db.query(User).all()
        print(f"Существующих пользователей: {len(existing_users)}")
        
        test_users = [
            {
                "email": "manager@almazgeobur.ru",
                "password": "manager123",
                "full_name": "Иван Менеджер",
                "role": UserRole.MANAGER,
                "is_active": True
            },
            {
                "email": "contract@almazgeobur.ru",
                "password": "contract123",
                "full_name": "Петр Контрактный",
                "role": UserRole.CONTRACT_MANAGER,
                "is_active": True
            },
            {
                "email": "supplier1@example.com",
                "password": "supplier123",
                "full_name": "ООО Поставщик-1",
                "role": UserRole.SUPPLIER,
                "is_active": True
            },
            {
                "email": "supplier2@example.com",
                "password": "supplier123",
                "full_name": "ООО Поставщик-2",
                "role": UserRole.SUPPLIER,
                "is_active": True
            }
        ]
        
        created_count = 0
        
        for user_data in test_users:
            # Проверяем, существует ли пользователь
            existing = db.query(User).filter(User.email == user_data["email"]).first()
            
            if existing:
                print(f"Пользователь {user_data['email']} уже существует")
                continue
            
            # Создаем нового пользователя
            user = User(
                email=user_data["email"],
                hashed_password=pwd_context.hash(user_data["password"]),
                full_name=user_data["full_name"],
                role=user_data["role"],
                is_active=user_data["is_active"]
            )
            
            db.add(user)
            created_count += 1
            
            print(f"✓ Создан пользователь:")
            print(f"  Email: {user_data['email']}")
            print(f"  Пароль: {user_data['password']}")
            print(f"  Роль: {user_data['role'].value}")
            print()
        
        db.commit()
        
        print(f"\n{'='*50}")
        print(f"Создано новых пользователей: {created_count}")
        print(f"Всего пользователей в системе: {db.query(User).count()}")
        print(f"{'='*50}")
        
        # Выводим список всех пользователей
        print("\nВсе пользователи в системе:")
        all_users = db.query(User).all()
        for user in all_users:
            print(f"  {user.email} - {user.role.value} - {user.full_name}")
        
    except Exception as e:
        print(f"Ошибка: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    print("Создание тестовых пользователей...\n")
    create_test_users()

