"""
Скрипт для создания тестовых тендеров
"""

from sqlalchemy.orm import Session
from database import SessionLocal
from models import Tender, TenderLot, TenderProduct, TenderDocument, TenderOrganizer, TenderStatus, User
from datetime import datetime, timedelta

def create_test_tenders():
    db = SessionLocal()
    
    try:
        # Получаем администратора или контрактного управляющего
        admin = db.query(User).filter(User.email == "admin@almazgeobur.ru").first()
        contract_manager = db.query(User).filter(User.email == "contract@almazgeobur.ru").first()
        
        if not admin and not contract_manager:
            print("Не найден пользователь для создания тендеров")
            return
        
        creator = admin if admin else contract_manager
        
        # Проверяем существующие тендеры
        existing_tenders = db.query(Tender).all()
        if existing_tenders:
            print(f"В системе уже есть {len(existing_tenders)} тендеров")
            return
        
        # Тендер 1: Поставка бурового оборудования
        tender1 = Tender(
            title="Поставка бурового оборудования для геологоразведочных работ",
            description="Требуется поставка современного бурового оборудования для проведения геологоразведочных работ на месторождениях. Оборудование должно соответствовать всем техническим требованиям и стандартам безопасности.",
            initial_price=5000000.00,
            currency="RUB",
            status=TenderStatus.PUBLISHED,
            publication_date=datetime.utcnow(),
            deadline=datetime.utcnow() + timedelta(days=30),
            okpd_code="28.92.10.000",
            okved_code="28.92",
            region="Республика Саха (Якутия)",
            procurement_method="auction",
            created_by=creator.id
        )
        db.add(tender1)
        db.flush()
        
        # Организатор для тендера 1
        org1 = TenderOrganizer(
            tender_id=tender1.id,
            organization_name="АО 'АлмазГеоБур'",
            legal_address="677000, Республика Саха (Якутия), г. Якутск, ул. Ленина, д. 1",
            postal_address="677000, Республика Саха (Якутия), г. Якутск, ул. Ленина, д. 1",
            email="tender@almazgeobur.ru",
            phone="+7 (4112) 12-34-56",
            contact_person="Иванов Иван Иванович",
            inn="1435123456",
            kpp="143501001",
            ogrn="1021400123456"
        )
        db.add(org1)
        
        # Лот 1 для тендера 1
        lot1_1 = TenderLot(
            tender_id=tender1.id,
            lot_number=1,
            title="Буровая установка УКБ-12",
            description="Буровая установка УКБ-12 для колонкового бурения с комплектом инструмента",
            initial_price=3000000.00,
            currency="RUB",
            security_amount=300000.00,
            delivery_place="г. Якутск, промзона 'Покровский тракт'",
            payment_terms="100% предоплата после подписания договора",
            quantity="1",
            unit_of_measure="шт",
            okpd_code="28.92.10.110",
            okved_code="28.92"
        )
        db.add(lot1_1)
        db.flush()
        
        # Товары для лота 1.1
        product1_1_1 = TenderProduct(
            lot_id=lot1_1.id,
            position_number=1,
            name="Буровая установка УКБ-12 (основной агрегат)",
            quantity="1",
            unit_of_measure="шт"
        )
        product1_1_2 = TenderProduct(
            lot_id=lot1_1.id,
            position_number=2,
            name="Комплект бурового инструмента",
            quantity="1",
            unit_of_measure="компл"
        )
        db.add_all([product1_1_1, product1_1_2])
        
        # Лот 2 для тендера 1
        lot1_2 = TenderLot(
            tender_id=tender1.id,
            lot_number=2,
            title="Буровые насосы и компрессоры",
            description="Насосное оборудование для промывки скважин и компрессорные установки",
            initial_price=2000000.00,
            currency="RUB",
            security_amount=200000.00,
            delivery_place="г. Якутск, промзона 'Покровский тракт'",
            payment_terms="50% предоплата, 50% по факту поставки",
            quantity="1",
            unit_of_measure="компл",
            okpd_code="28.13.11.000",
            okved_code="28.13"
        )
        db.add(lot1_2)
        db.flush()
        
        # Товары для лота 1.2
        product1_2_1 = TenderProduct(
            lot_id=lot1_2.id,
            position_number=1,
            name="Буровой насос НБ-125",
            quantity="2",
            unit_of_measure="шт"
        )
        product1_2_2 = TenderProduct(
            lot_id=lot1_2.id,
            position_number=2,
            name="Компрессор ЗИФ-55",
            quantity="1",
            unit_of_measure="шт"
        )
        db.add_all([product1_2_1, product1_2_2])
        
        # Документы для тендера 1
        doc1_1 = TenderDocument(
            tender_id=tender1.id,
            title="Техническое задание",
            file_path="/uploads/tender_1_tz.pdf",
            file_size=256000,
            file_type="application/pdf"
        )
        doc1_2 = TenderDocument(
            tender_id=tender1.id,
            title="Проект договора",
            file_path="/uploads/tender_1_contract.pdf",
            file_size=128000,
            file_type="application/pdf"
        )
        db.add_all([doc1_1, doc1_2])
        
        # Тендер 2: Поставка расходных материалов
        tender2 = Tender(
            title="Поставка расходных материалов для буровых работ",
            description="Требуется поставка расходных материалов для проведения буровых работ: буровые коронки, трубы, промывочная жидкость и др.",
            initial_price=1500000.00,
            currency="RUB",
            status=TenderStatus.PUBLISHED,
            publication_date=datetime.utcnow(),
            deadline=datetime.utcnow() + timedelta(days=20),
            okpd_code="20.59.59.000",
            okved_code="20.59",
            region="Республика Саха (Якутия)",
            procurement_method="auction",
            created_by=creator.id
        )
        db.add(tender2)
        db.flush()
        
        # Организатор для тендера 2
        org2 = TenderOrganizer(
            tender_id=tender2.id,
            organization_name="АО 'АлмазГеоБур'",
            legal_address="677000, Республика Саха (Якутия), г. Якутск, ул. Ленина, д. 1",
            postal_address="677000, Республика Саха (Якутия), г. Якутск, ул. Ленина, д. 1",
            email="tender@almazgeobur.ru",
            phone="+7 (4112) 12-34-56",
            contact_person="Петров Петр Петрович",
            inn="1435123456",
            kpp="143501001",
            ogrn="1021400123456"
        )
        db.add(org2)
        
        # Лот 1 для тендера 2
        lot2_1 = TenderLot(
            tender_id=tender2.id,
            lot_number=1,
            title="Буровые коронки алмазные",
            description="Алмазные буровые коронки различных диаметров для колонкового бурения",
            initial_price=800000.00,
            currency="RUB",
            security_amount=80000.00,
            delivery_place="г. Якутск, склад АлмазГеоБур",
            payment_terms="Оплата в течение 30 дней после поставки",
            quantity="50",
            unit_of_measure="шт",
            okpd_code="25.73.40.110",
            okved_code="25.73"
        )
        db.add(lot2_1)
        db.flush()
        
        # Товары для лота 2.1
        product2_1_1 = TenderProduct(
            lot_id=lot2_1.id,
            position_number=1,
            name="Коронка алмазная КД-76",
            quantity="20",
            unit_of_measure="шт"
        )
        product2_1_2 = TenderProduct(
            lot_id=lot2_1.id,
            position_number=2,
            name="Коронка алмазная КД-93",
            quantity="20",
            unit_of_measure="шт"
        )
        product2_1_3 = TenderProduct(
            lot_id=lot2_1.id,
            position_number=3,
            name="Коронка алмазная КД-112",
            quantity="10",
            unit_of_measure="шт"
        )
        db.add_all([product2_1_1, product2_1_2, product2_1_3])
        
        # Лот 2 для тендера 2
        lot2_2 = TenderLot(
            tender_id=tender2.id,
            lot_number=2,
            title="Буровые трубы и промывочная жидкость",
            description="Буровые трубы и промывочная жидкость для проведения буровых работ",
            initial_price=700000.00,
            currency="RUB",
            security_amount=70000.00,
            delivery_place="г. Якутск, склад АлмазГеоБур",
            payment_terms="Оплата в течение 30 дней после поставки",
            quantity="1",
            unit_of_measure="компл",
            okpd_code="24.20.14.000",
            okved_code="24.20"
        )
        db.add(lot2_2)
        db.flush()
        
        # Товары для лота 2.2
        product2_2_1 = TenderProduct(
            lot_id=lot2_2.id,
            position_number=1,
            name="Трубы буровые НКТ-73",
            quantity="100",
            unit_of_measure="м"
        )
        product2_2_2 = TenderProduct(
            lot_id=lot2_2.id,
            position_number=2,
            name="Промывочная жидкость ПЖ-1",
            quantity="5000",
            unit_of_measure="л"
        )
        db.add_all([product2_2_1, product2_2_2])
        
        # Документы для тендера 2
        doc2_1 = TenderDocument(
            tender_id=tender2.id,
            title="Спецификация материалов",
            file_path="/uploads/tender_2_spec.pdf",
            file_size=180000,
            file_type="application/pdf"
        )
        doc2_2 = TenderDocument(
            tender_id=tender2.id,
            title="Условия поставки",
            file_path="/uploads/tender_2_terms.pdf",
            file_size=95000,
            file_type="application/pdf"
        )
        db.add_all([doc2_1, doc2_2])
        
        db.commit()
        
        print("\n" + "="*60)
        print("✓ Создано 2 тестовых тендера:")
        print("="*60)
        print(f"\n1. {tender1.title}")
        print(f"   Начальная цена: {tender1.initial_price:,.2f} {tender1.currency}")
        print(f"   Статус: {tender1.status.value}")
        print(f"   Срок подачи заявок: {tender1.deadline.strftime('%d.%m.%Y')}")
        print(f"   Количество лотов: 2")
        print(f"      Лот 1: {lot1_1.title} - {lot1_1.initial_price:,.2f} RUB")
        print(f"      Лот 2: {lot1_2.title} - {lot1_2.initial_price:,.2f} RUB")
        
        print(f"\n2. {tender2.title}")
        print(f"   Начальная цена: {tender2.initial_price:,.2f} {tender2.currency}")
        print(f"   Статус: {tender2.status.value}")
        print(f"   Срок подачи заявок: {tender2.deadline.strftime('%d.%m.%Y')}")
        print(f"   Количество лотов: 2")
        print(f"      Лот 1: {lot2_1.title} - {lot2_1.initial_price:,.2f} RUB")
        print(f"      Лот 2: {lot2_2.title} - {lot2_2.initial_price:,.2f} RUB")
        
        print("\n" + "="*60)
        print("Тендеры успешно созданы и опубликованы!")
        print("Поставщики могут просматривать тендеры и подавать заявки на лоты.")
        print("="*60 + "\n")
        
    except Exception as e:
        print(f"Ошибка: {e}")
        db.rollback()
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    print("Создание тестовых тендеров...\n")
    create_test_tenders()

