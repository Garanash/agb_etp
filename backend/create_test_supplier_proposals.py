#!/usr/bin/env python3
"""
Создание тестовых предложений поставщиков
"""

from sqlalchemy.orm import Session
from sqlalchemy import func
from database import SessionLocal, engine
from models import (
    User, UserRole, SupplierProfile, LegalForm,
    Tender, TenderStatus, TenderLot, TenderProduct,
    SupplierProposal, ProposalItem
)
from decimal import Decimal
from datetime import datetime, timedelta
import random

def create_test_supplier_proposals():
    """Создание тестовых предложений поставщиков"""
    db = SessionLocal()
    
    try:
        # Получаем поставщиков
        suppliers = db.query(User).filter(User.role == UserRole.SUPPLIER).all()
        if not suppliers:
            print("❌ Нет поставщиков в системе. Сначала создайте тестовых пользователей.")
            return
        
        # Получаем опубликованные тендеры
        tenders = db.query(Tender).filter(Tender.status == TenderStatus.PUBLISHED).all()
        if not tenders:
            print("❌ Нет опубликованных тендеров. Сначала создайте тестовые тендеры.")
            return
        
        print(f"📊 Создаем предложения для {len(suppliers)} поставщиков и {len(tenders)} тендеров...")
        
        created_proposals = 0
        
        for tender in tenders:
            # Получаем товары тендера
            products = []
            for lot in tender.lots:
                products.extend(lot.products)
            
            if not products:
                continue
            
            # Для каждого тендера создаем предложения от случайных поставщиков
            num_suppliers = random.randint(1, min(3, len(suppliers)))
            selected_suppliers = random.sample(suppliers, num_suppliers)
            
            for supplier in selected_suppliers:
                # Проверяем, нет ли уже предложения от этого поставщика
                existing_proposal = db.query(SupplierProposal).filter(
                    SupplierProposal.tender_id == tender.id,
                    SupplierProposal.supplier_id == supplier.id
                ).first()
                
                if existing_proposal:
                    continue
                
                # Создаем предложение
                proposal = SupplierProposal(
                    tender_id=tender.id,
                    supplier_id=supplier.id,
                    prepayment_percent=Decimal(str(random.choice([0, 10, 20, 30]))),
                    currency=random.choice(['RUB', 'USD', 'EUR']),
                    vat_percent=Decimal(str(random.choice([0, 10, 20]))),
                    general_comment=f"Предложение от {supplier.full_name}",
                    status=random.choice(['draft', 'submitted', 'accepted', 'rejected'])
                )
                
                db.add(proposal)
                db.flush()  # Получаем ID предложения
                
                # Создаем элементы предложения для каждого товара
                for product in products:
                    # Случайно решаем, включать ли товар в предложение
                    if random.random() < 0.8:  # 80% вероятность включения товара
                        proposal_item = ProposalItem(
                            proposal_id=proposal.id,
                            product_id=product.id,
                            is_available=random.choice([True, True, True, False]),  # 75% вероятность наличия
                            is_analog=random.choice([True, False, False, False]),  # 25% вероятность аналога
                            price_per_unit=Decimal(str(random.uniform(100, 10000))).quantize(Decimal('0.01')),
                            delivery_days=random.randint(1, 90),
                            comment=random.choice([
                                None,
                                "Товар в наличии",
                                "Возможна поставка аналога",
                                "Требуется предоплата",
                                "Быстрая доставка"
                            ])
                        )
                        
                        db.add(proposal_item)
                
                created_proposals += 1
        
        db.commit()
        print(f"✅ Создано {created_proposals} предложений поставщиков")
        
        # Выводим статистику
        total_proposals = db.query(SupplierProposal).count()
        total_items = db.query(ProposalItem).count()
        
        print(f"📈 Статистика:")
        print(f"   - Всего предложений: {total_proposals}")
        print(f"   - Всего позиций в предложениях: {total_items}")
        
        # Статистика по статусам
        status_counts = db.query(
            SupplierProposal.status,
            func.count(SupplierProposal.id)
        ).group_by(SupplierProposal.status).all()
        
        print(f"   - По статусам:")
        for status, count in status_counts:
            print(f"     * {status}: {count}")
        
    except Exception as e:
        print(f"❌ Ошибка при создании тестовых предложений: {e}")
        db.rollback()
        raise
    finally:
        db.close()

def main():
    """Основная функция"""
    print("🚀 Создание тестовых предложений поставщиков...")
    create_test_supplier_proposals()
    print("🎉 Готово!")

if __name__ == "__main__":
    main()
