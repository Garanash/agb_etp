from sqlalchemy.orm import Session
from database import SessionLocal, engine, Base
from models import User, UserRole
from auth import get_password_hash

def create_admin_user():
    db = SessionLocal()
    try:
        # Проверяем, существует ли уже админ
        admin = db.query(User).filter(User.email == "admin@agb.com").first()
        if not admin:
            admin = User(
                email="admin@agb.com",
                hashed_password=get_password_hash("admin123"),
                full_name="Администратор",
                role=UserRole.ADMIN,
                is_active=True
            )
            db.add(admin)
            db.commit()
            print("Администратор успешно создан")
        else:
            print("Администратор уже существует")
    finally:
        db.close()

if __name__ == "__main__":
    Base.metadata.create_all(bind=engine)
    create_admin_user()
