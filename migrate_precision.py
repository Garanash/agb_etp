#!/usr/bin/env python3
"""
Миграция для увеличения точности полей с ценами
"""

import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
import sys

def migrate_database():
    """Выполняет миграцию базы данных для увеличения точности полей с ценами"""
    
    # Параметры подключения к базе данных
    db_params = {
        'host': 'localhost',
        'port': 5433,
        'database': 'agb_etp',
        'user': 'agb_etp',
        'password': 'agb_secure_password_2024'
    }
    
    try:
        # Подключение к базе данных
        print("🔌 Подключение к базе данных...")
        conn = psycopg2.connect(**db_params)
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        cursor = conn.cursor()
        
        print("✅ Подключение установлено")
        
        # SQL команды для изменения точности полей
        migrations = [
            # Изменение точности initial_price в таблице tenders
            "ALTER TABLE tenders ALTER COLUMN initial_price TYPE NUMERIC(20,2);",
            
            # Изменение точности initial_price в таблице tender_lots
            "ALTER TABLE tender_lots ALTER COLUMN initial_price TYPE NUMERIC(20,2);",
            
            # Изменение точности security_amount в таблице tender_lots
            "ALTER TABLE tender_lots ALTER COLUMN security_amount TYPE NUMERIC(20,2);",
            
            # Изменение точности proposed_price в таблице supplier_proposals
            "ALTER TABLE supplier_proposals ALTER COLUMN proposed_price TYPE NUMERIC(20,2);",
            
            # Изменение точности price_per_unit в таблице tender_products
            "ALTER TABLE tender_products ALTER COLUMN price_per_unit TYPE NUMERIC(20,2);"
        ]
        
        print("🔄 Выполнение миграций...")
        
        for i, migration in enumerate(migrations, 1):
            try:
                print(f"  {i}. Выполнение миграции...")
                cursor.execute(migration)
                print(f"  ✅ Миграция {i} выполнена успешно")
            except psycopg2.Error as e:
                if "does not exist" in str(e) or "column" in str(e).lower():
                    print(f"  ⚠️  Миграция {i} пропущена (колонка не существует): {e}")
                else:
                    print(f"  ❌ Ошибка в миграции {i}: {e}")
                    raise
        
        print("✅ Все миграции выполнены успешно!")
        
        # Проверяем изменения
        print("🔍 Проверка изменений...")
        cursor.execute("""
            SELECT column_name, data_type, numeric_precision, numeric_scale 
            FROM information_schema.columns 
            WHERE table_name IN ('tenders', 'tender_lots', 'supplier_proposals', 'tender_products')
            AND column_name IN ('initial_price', 'security_amount', 'proposed_price', 'price_per_unit')
            ORDER BY table_name, column_name;
        """)
        
        results = cursor.fetchall()
        print("📊 Результаты проверки:")
        for row in results:
            print(f"  {row[0]} ({row[1]}): precision={row[2]}, scale={row[3]}")
        
        cursor.close()
        conn.close()
        
        print("🎉 Миграция завершена успешно!")
        return True
        
    except psycopg2.Error as e:
        print(f"❌ Ошибка базы данных: {e}")
        return False
    except Exception as e:
        print(f"❌ Неожиданная ошибка: {e}")
        return False

if __name__ == "__main__":
    print("🚀 Запуск миграции базы данных...")
    success = migrate_database()
    sys.exit(0 if success else 1)
