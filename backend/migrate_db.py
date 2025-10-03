"""
Скрипт для миграции базы данных - добавление колонки lot_id в tender_applications
"""

from sqlalchemy import text
from database import engine

def migrate_database():
    """Добавляет колонку lot_id в таблицу tender_applications"""
    
    with engine.connect() as conn:
        try:
            # Проверяем, существует ли колонка lot_id
            result = conn.execute(text("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = 'tender_applications' 
                AND column_name = 'lot_id'
            """))
            
            if result.fetchone():
                print("Колонка lot_id уже существует в таблице tender_applications")
                return
            
            # Добавляем колонку lot_id
            conn.execute(text("""
                ALTER TABLE tender_applications 
                ADD COLUMN lot_id INTEGER REFERENCES tender_lots(id)
            """))
            
            conn.commit()
            print("✓ Колонка lot_id успешно добавлена в таблицу tender_applications")
            
        except Exception as e:
            print(f"Ошибка при миграции: {e}")
            conn.rollback()
            raise

if __name__ == "__main__":
    print("Выполнение миграции базы данных...")
    migrate_database()
    print("Миграция завершена!")
