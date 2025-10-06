#!/usr/bin/env python3
"""
Миграция для создания таблиц предложений поставщиков
"""

from sqlalchemy import create_engine, text
from database import Base, engine
from models import SupplierProposal, ProposalItem
import logging

# Настройка логирования
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def create_tables():
    """Создание новых таблиц"""
    try:
        logger.info("Создание таблиц для предложений поставщиков...")
        
        # Создаем таблицы
        SupplierProposal.__table__.create(engine, checkfirst=True)
        ProposalItem.__table__.create(engine, checkfirst=True)
        
        logger.info("Таблицы успешно созданы!")
        
    except Exception as e:
        logger.error(f"Ошибка при создании таблиц: {e}")
        raise

def verify_tables():
    """Проверка создания таблиц"""
    try:
        with engine.connect() as conn:
            # Проверяем таблицу supplier_proposals
            result = conn.execute(text("""
                SELECT COUNT(*) FROM information_schema.tables 
                WHERE table_name = 'supplier_proposals'
            """))
            supplier_proposals_exists = result.scalar() > 0
            
            # Проверяем таблицу proposal_items
            result = conn.execute(text("""
                SELECT COUNT(*) FROM information_schema.tables 
                WHERE table_name = 'proposal_items'
            """))
            proposal_items_exists = result.scalar() > 0
            
            if supplier_proposals_exists and proposal_items_exists:
                logger.info("✅ Все таблицы успешно созданы!")
                return True
            else:
                logger.error("❌ Не все таблицы были созданы")
                return False
                
    except Exception as e:
        logger.error(f"Ошибка при проверке таблиц: {e}")
        return False

def main():
    """Основная функция миграции"""
    logger.info("Начинаем миграцию для предложений поставщиков...")
    
    try:
        # Создаем таблицы
        create_tables()
        
        # Проверяем результат
        if verify_tables():
            logger.info("🎉 Миграция успешно завершена!")
        else:
            logger.error("❌ Миграция завершилась с ошибками")
            return 1
            
    except Exception as e:
        logger.error(f"Критическая ошибка миграции: {e}")
        return 1
    
    return 0

if __name__ == "__main__":
    exit(main())


