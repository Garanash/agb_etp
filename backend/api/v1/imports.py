from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from database import get_db
from models import (
    Tender, TenderLot, TenderProduct, TenderDocument, TenderOrganizer,
    User as UserModel, UserRole, TenderStatus
)
from auth import get_current_active_user, require_any_role
from datetime import datetime
import pandas as pd
from io import BytesIO
from decimal import Decimal

router = APIRouter()

@router.post("/tender")
async def import_tender(
    file: UploadFile = File(...),
    current_user: UserModel = Depends(require_any_role([UserRole.ADMIN, UserRole.CONTRACT_MANAGER])),
    db: Session = Depends(get_db)
):
    """Импорт данных тендера из Excel"""
    if not file.filename.endswith('.xlsx'):
        raise HTTPException(
            status_code=400,
            detail="Файл должен быть в формате Excel (.xlsx)"
        )
    
    try:
        # Читаем Excel файл
        contents = await file.read()
        excel_file = BytesIO(contents)
        
        # Читаем основную информацию о тендере
        df_tender = pd.read_excel(excel_file, sheet_name='Основная информация')
        tender_data = df_tender.set_index('Поле')['Значение'].to_dict()
        
        # Создаем тендер
        tender = Tender(
            title=tender_data.get('Название', ''),
            description=tender_data.get('Описание', ''),
            initial_price=Decimal(str(tender_data['Начальная цена'])) if pd.notna(tender_data.get('Начальная цена')) else None,
            currency=tender_data.get('Валюта', 'RUB'),
            status=TenderStatus(tender_data.get('Статус', 'draft')),
            publication_date=pd.to_datetime(tender_data.get('Дата публикации')) if pd.notna(tender_data.get('Дата публикации')) else None,
            deadline=pd.to_datetime(tender_data.get('Срок подачи заявок')) if pd.notna(tender_data.get('Срок подачи заявок')) else None,
            okpd_code=tender_data.get('Код ОКПД2'),
            okved_code=tender_data.get('Код ОКВЭД2'),
            region=tender_data.get('Регион'),
            procurement_method=tender_data.get('Способ закупки', 'auction'),
            created_by=current_user.id
        )
        db.add(tender)
        db.flush()  # Получаем ID тендера
        
        # Читаем и создаем организаторов
        try:
            df_organizers = pd.read_excel(excel_file, sheet_name='Организаторы')
            for _, row in df_organizers.iterrows():
                organizer = TenderOrganizer(
                    tender_id=tender.id,
                    organization_name=row['Название организации'],
                    legal_address=row['Юридический адрес'] if pd.notna(row.get('Юридический адрес')) else None,
                    postal_address=row['Почтовый адрес'] if pd.notna(row.get('Почтовый адрес')) else None,
                    email=row['Email'] if pd.notna(row.get('Email')) else None,
                    phone=row['Телефон'] if pd.notna(row.get('Телефон')) else None,
                    contact_person=row['Контактное лицо'] if pd.notna(row.get('Контактное лицо')) else None,
                    inn=row['ИНН'] if pd.notna(row.get('ИНН')) else None,
                    kpp=row['КПП'] if pd.notna(row.get('КПП')) else None,
                    ogrn=row['ОГРН'] if pd.notna(row.get('ОГРН')) else None
                )
                db.add(organizer)
        except ValueError:
            # Если лист с организаторами не найден
            pass
        
        # Читаем и создаем лоты
        try:
            df_lots = pd.read_excel(excel_file, sheet_name='Лоты')
            for _, row in df_lots.iterrows():
                lot = TenderLot(
                    tender_id=tender.id,
                    lot_number=row['Номер лота'],
                    title=row['Название'],
                    description=row['Описание'] if pd.notna(row.get('Описание')) else None,
                    initial_price=Decimal(str(row['Начальная цена'])) if pd.notna(row.get('Начальная цена')) else None,
                    currency=row['Валюта'] if pd.notna(row.get('Валюта')) else 'RUB',
                    security_amount=Decimal(str(row['Обеспечение заявки'])) if pd.notna(row.get('Обеспечение заявки')) else None,
                    delivery_place=row['Место поставки'] if pd.notna(row.get('Место поставки')) else None,
                    payment_terms=row['Условия оплаты'] if pd.notna(row.get('Условия оплаты')) else None,
                    quantity=row['Количество'] if pd.notna(row.get('Количество')) else None,
                    unit_of_measure=row['Единица измерения'] if pd.notna(row.get('Единица измерения')) else None,
                    okpd_code=row['Код ОКПД2'] if pd.notna(row.get('Код ОКПД2')) else None,
                    okved_code=row['Код ОКВЭД2'] if pd.notna(row.get('Код ОКВЭД2')) else None
                )
                db.add(lot)
                db.flush()  # Получаем ID лота
                
                # Читаем и создаем товары для лота
                try:
                    df_products = pd.read_excel(excel_file, sheet_name='Товары')
                    lot_products = df_products[df_products['ID лота'] == row['ID лота']]
                    for _, product_row in lot_products.iterrows():
                        product = TenderProduct(
                            lot_id=lot.id,
                            position_number=product_row['Номер позиции'],
                            name=product_row['Наименование'],
                            quantity=product_row['Количество'] if pd.notna(product_row.get('Количество')) else None,
                            unit_of_measure=product_row['Единица измерения'] if pd.notna(product_row.get('Единица измерения')) else None
                        )
                        db.add(product)
                except ValueError:
                    # Если лист с товарами не найден
                    pass
        except ValueError:
            # Если лист с лотами не найден
            pass
        
        # Читаем и создаем документы
        try:
            df_documents = pd.read_excel(excel_file, sheet_name='Документы')
            for _, row in df_documents.iterrows():
                document = TenderDocument(
                    tender_id=tender.id,
                    title=row['Название'],
                    file_path=row['Путь к файлу'],
                    file_size=row['Размер файла'] if pd.notna(row.get('Размер файла')) else None,
                    file_type=row['Тип файла'] if pd.notna(row.get('Тип файла')) else None,
                    uploaded_at=datetime.now()
                )
                db.add(document)
        except ValueError:
            # Если лист с документами не найден
            pass
        
        db.commit()
        
        return {
            "message": "Тендер успешно импортирован",
            "tender_id": tender.id
        }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=400,
            detail=f"Ошибка импорта данных: {str(e)}"
        )
