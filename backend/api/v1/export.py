from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Tender, TenderLot, TenderProduct, TenderDocument, TenderOrganizer, User as UserModel, UserRole
from auth import get_current_active_user, require_any_role
from datetime import datetime
import pandas as pd
from io import BytesIO
from fastapi.responses import StreamingResponse

router = APIRouter()

@router.get("/tender/{tender_id}")
async def export_tender(
    tender_id: int,
    current_user: UserModel = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Экспорт данных тендера в Excel"""
    tender = db.query(Tender).filter(Tender.id == tender_id).first()
    if not tender:
        raise HTTPException(status_code=404, detail="Тендер не найден")
    
    # Загружаем связанные данные
    tender.lots = db.query(TenderLot).filter(TenderLot.tender_id == tender.id).all()
    tender.documents = db.query(TenderDocument).filter(TenderDocument.tender_id == tender.id).all()
    tender.organizers = db.query(TenderOrganizer).filter(TenderOrganizer.tender_id == tender.id).all()
    
    # Загружаем товары для каждого лота
    for lot in tender.lots:
        lot.products = db.query(TenderProduct).filter(TenderProduct.lot_id == lot.id).all()
    
    # Создаем Excel файл
    output = BytesIO()
    with pd.ExcelWriter(output, engine='openpyxl') as writer:
        # Основная информация о тендере
        tender_data = {
            'Поле': [
                'ID тендера',
                'Название',
                'Описание',
                'Начальная цена',
                'Валюта',
                'Статус',
                'Дата публикации',
                'Срок подачи заявок',
                'Код ОКПД2',
                'Код ОКВЭД2',
                'Регион',
                'Способ закупки',
                'Дата создания'
            ],
            'Значение': [
                tender.id,
                tender.title,
                tender.description,
                float(tender.initial_price) if tender.initial_price else None,
                tender.currency,
                tender.status,
                tender.publication_date.strftime('%d.%m.%Y %H:%M') if tender.publication_date else None,
                tender.deadline.strftime('%d.%m.%Y %H:%M') if tender.deadline else None,
                tender.okpd_code,
                tender.okved_code,
                tender.region,
                tender.procurement_method,
                tender.created_at.strftime('%d.%m.%Y %H:%M')
            ]
        }
        df_tender = pd.DataFrame(tender_data)
        df_tender.to_excel(writer, sheet_name='Основная информация', index=False)
        
        # Организаторы
        organizers_data = []
        for org in tender.organizers:
            organizers_data.append({
                'ID': org.id,
                'Название организации': org.organization_name,
                'Юридический адрес': org.legal_address,
                'Почтовый адрес': org.postal_address,
                'Email': org.email,
                'Телефон': org.phone,
                'Контактное лицо': org.contact_person,
                'ИНН': org.inn,
                'КПП': org.kpp,
                'ОГРН': org.ogrn
            })
        if organizers_data:
            df_organizers = pd.DataFrame(organizers_data)
            df_organizers.to_excel(writer, sheet_name='Организаторы', index=False)
        
        # Лоты и товары
        lots_data = []
        products_data = []
        for lot in tender.lots:
            lots_data.append({
                'ID лота': lot.id,
                'Номер лота': lot.lot_number,
                'Название': lot.title,
                'Описание': lot.description,
                'Начальная цена': float(lot.initial_price) if lot.initial_price else None,
                'Валюта': lot.currency,
                'Обеспечение заявки': float(lot.security_amount) if lot.security_amount else None,
                'Место поставки': lot.delivery_place,
                'Условия оплаты': lot.payment_terms,
                'Количество': lot.quantity,
                'Единица измерения': lot.unit_of_measure,
                'Код ОКПД2': lot.okpd_code,
                'Код ОКВЭД2': lot.okved_code
            })
            for product in lot.products:
                products_data.append({
                    'ID лота': lot.id,
                    'Номер лота': lot.lot_number,
                    'ID товара': product.id,
                    'Номер позиции': product.position_number,
                    'Наименование': product.name,
                    'Количество': product.quantity,
                    'Единица измерения': product.unit_of_measure
                })
        
        if lots_data:
            df_lots = pd.DataFrame(lots_data)
            df_lots.to_excel(writer, sheet_name='Лоты', index=False)
        
        if products_data:
            df_products = pd.DataFrame(products_data)
            df_products.to_excel(writer, sheet_name='Товары', index=False)
        
        # Документы
        documents_data = []
        for doc in tender.documents:
            documents_data.append({
                'ID': doc.id,
                'Название': doc.title,
                'Путь к файлу': doc.file_path,
                'Размер файла': doc.file_size,
                'Тип файла': doc.file_type,
                'Дата загрузки': doc.uploaded_at.strftime('%d.%m.%Y %H:%M')
            })
        if documents_data:
            df_documents = pd.DataFrame(documents_data)
            df_documents.to_excel(writer, sheet_name='Документы', index=False)
    
    output.seek(0)
    
    filename = f"tender_{tender_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.xlsx"
    
    return StreamingResponse(
        BytesIO(output.read()),
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

@router.get("/tenders")
async def export_tenders(
    current_user: UserModel = Depends(require_any_role([UserRole.ADMIN, UserRole.CONTRACT_MANAGER])),
    db: Session = Depends(get_db)
):
    """Экспорт списка всех тендеров в Excel"""
    # Получаем все тендеры
    query = db.query(Tender)
    
    # Для контрактного управляющего - только его тендеры
    if current_user.role == UserRole.CONTRACT_MANAGER:
        query = query.filter(Tender.created_by == current_user.id)
    
    tenders = query.all()
    
    # Создаем Excel файл
    output = BytesIO()
    with pd.ExcelWriter(output, engine='openpyxl') as writer:
        tenders_data = []
        for tender in tenders:
            tenders_data.append({
                'ID': tender.id,
                'Название': tender.title,
                'Описание': tender.description,
                'Начальная цена': float(tender.initial_price) if tender.initial_price else None,
                'Валюта': tender.currency,
                'Статус': tender.status,
                'Дата публикации': tender.publication_date.strftime('%d.%m.%Y %H:%M') if tender.publication_date else None,
                'Срок подачи заявок': tender.deadline.strftime('%d.%m.%Y %H:%M') if tender.deadline else None,
                'Код ОКПД2': tender.okpd_code,
                'Код ОКВЭД2': tender.okved_code,
                'Регион': tender.region,
                'Способ закупки': tender.procurement_method,
                'Дата создания': tender.created_at.strftime('%d.%m.%Y %H:%M')
            })
        
        df_tenders = pd.DataFrame(tenders_data)
        df_tenders.to_excel(writer, sheet_name='Тендеры', index=False)
    
    output.seek(0)
    
    filename = f"tenders_export_{datetime.now().strftime('%Y%m%d_%H%M%S')}.xlsx"
    
    return StreamingResponse(
        BytesIO(output.read()),
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )
