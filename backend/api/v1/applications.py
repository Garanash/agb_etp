from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import and_
from typing import List
from database import get_db
from models import TenderApplication, User as UserModel, UserRole, Tender, SupplierProfile, TenderLot, TenderProduct, TenderDocument, TenderOrganizer, TenderProcedureStage
from schemas import TenderApplication as TenderApplicationSchema, TenderApplicationCreate, TenderApplicationUpdate
from auth import get_current_active_user, require_any_role
from datetime import datetime

router = APIRouter()


@router.post("/", response_model=TenderApplicationSchema)
async def create_application(
    application_data: TenderApplicationCreate,
    current_user: UserModel = Depends(require_any_role([UserRole.SUPPLIER])),
    db: Session = Depends(get_db)
):
    """Создание заявки на лот тендера (только для поставщиков)"""
    # Проверяем, что лот существует
    lot = db.query(TenderLot).filter(TenderLot.id == application_data.lot_id).first()
    if not lot:
        raise HTTPException(status_code=404, detail="Лот не найден")
    
    # Получаем тендер
    tender = db.query(Tender).filter(Tender.id == lot.tender_id).first()
    if not tender:
        raise HTTPException(status_code=404, detail="Тендер не найден")
    
    if tender.status != "published":
        raise HTTPException(status_code=400, detail="Заявки можно подавать только на опубликованные тендеры")
    
    # Проверяем, что пользователь уже не подавал заявку на этот лот
    existing_application = db.query(TenderApplication).filter(
        and_(
            TenderApplication.lot_id == application_data.lot_id,
            TenderApplication.supplier_id == current_user.id
        )
    ).first()
    
    if existing_application:
        raise HTTPException(status_code=400, detail="Вы уже подавали заявку на этот лот")
    
    # Создаем заявку
    db_application = TenderApplication(
        tender_id=tender.id,
        lot_id=application_data.lot_id,
        supplier_id=current_user.id,
        proposed_price=application_data.proposed_price,
        comment=application_data.comment,
        status="submitted"
    )
    db.add(db_application)
    db.commit()
    db.refresh(db_application)
    return db_application


@router.get("/my", response_model=List[TenderApplicationSchema])
async def get_my_applications(
    current_user: UserModel = Depends(require_any_role([UserRole.SUPPLIER])),
    db: Session = Depends(get_db)
):
    """Получение заявок текущего поставщика"""
    applications = db.query(TenderApplication).filter(
        TenderApplication.supplier_id == current_user.id
    ).all()
    return applications


@router.get("/tender/{tender_id}", response_model=List[TenderApplicationSchema])
async def get_tender_applications(
    tender_id: int,
    current_user: UserModel = Depends(require_any_role([UserRole.ADMIN, UserRole.CONTRACT_MANAGER, UserRole.MANAGER])),
    db: Session = Depends(get_db)
):
    """Получение всех заявок на тендер (для администраторов и менеджеров)"""
    # Проверяем, что тендер существует
    tender = db.query(Tender).filter(Tender.id == tender_id).first()
    if not tender:
        raise HTTPException(status_code=404, detail="Тендер не найден")
    
    # Проверяем права доступа
    if current_user.role != UserRole.ADMIN and tender.created_by != current_user.id:
        raise HTTPException(status_code=403, detail="Недостаточно прав для просмотра заявок на этот тендер")
    
    applications = db.query(TenderApplication).filter(
        TenderApplication.tender_id == tender_id
    ).all()
    return applications


@router.put("/{application_id}", response_model=TenderApplicationSchema)
async def update_application(
    application_id: int,
    application_data: TenderApplicationUpdate,
    current_user: UserModel = Depends(require_any_role([UserRole.ADMIN, UserRole.CONTRACT_MANAGER])),
    db: Session = Depends(get_db)
):
    """Обновление заявки (для администраторов и контрактных управляющих)"""
    application = db.query(TenderApplication).filter(TenderApplication.id == application_id).first()
    if not application:
        raise HTTPException(status_code=404, detail="Заявка не найдена")
    
    # Проверяем права доступа
    tender = db.query(Tender).filter(Tender.id == application.tender_id).first()
    if current_user.role != UserRole.ADMIN and tender.created_by != current_user.id:
        raise HTTPException(status_code=403, detail="Недостаточно прав для редактирования этой заявки")
    
    update_data = application_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(application, field, value)
    
    db.commit()
    db.refresh(application)
    return application


@router.get("/{application_id}")
async def get_application_detail(
    application_id: int,
    current_user: UserModel = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Получение детальной информации о заявке"""
    # Получаем заявку с информацией о поставщике и тендере
    application = db.query(TenderApplication).filter(TenderApplication.id == application_id).first()
    if not application:
        raise HTTPException(status_code=404, detail="Заявка не найдена")
    
    # Проверяем права доступа
    if current_user.role == UserRole.SUPPLIER and application.supplier_id != current_user.id:
        raise HTTPException(status_code=403, detail="Недостаточно прав для просмотра этой заявки")
    
    if current_user.role == UserRole.CONTRACT_MANAGER:
        tender = db.query(Tender).filter(Tender.id == application.tender_id).first()
        if tender.created_by != current_user.id:
            raise HTTPException(status_code=403, detail="Недостаточно прав для просмотра этой заявки")
    
    # Получаем информацию о поставщике
    supplier = db.query(UserModel).filter(UserModel.id == application.supplier_id).first()
    supplier_profile = db.query(SupplierProfile).filter(
        SupplierProfile.user_id == application.supplier_id
    ).first()
    
    # Получаем информацию о тендере с связанными данными
    tender = db.query(Tender).filter(Tender.id == application.tender_id).first()
    
    # Загружаем связанные данные тендера
    tender.lots = db.query(TenderLot).filter(TenderLot.tender_id == tender.id).all()
    tender.documents = db.query(TenderDocument).filter(TenderDocument.tender_id == tender.id).all()
    tender.organizers = db.query(TenderOrganizer).filter(TenderOrganizer.tender_id == tender.id).all()
    
    # Загружаем товары для каждого лота
    for lot in tender.lots:
        lot.products = db.query(TenderProduct).filter(TenderProduct.lot_id == lot.id).all()
    
    # Формируем ответ
    response_data = {
        "id": application.id,
        "tender_id": application.tender_id,
        "supplier_id": application.supplier_id,
        "proposed_price": application.proposed_price,
        "comment": application.comment,
        "status": application.status,
        "created_at": application.created_at.isoformat(),
        "updated_at": application.updated_at.isoformat() if application.updated_at else None,
        "supplier": {
            "id": supplier.id,
            "email": supplier.email,
            "full_name": supplier.full_name,
            "phone": supplier.phone,
            "role": supplier.role.value,
            "supplier_profile": {
                "id": supplier_profile.id,
                "company_name": supplier_profile.company_name,
                "inn": supplier_profile.inn,
                "kpp": supplier_profile.kpp,
                "ogrn": supplier_profile.ogrn,
                "legal_address": supplier_profile.legal_address,
                "actual_address": supplier_profile.actual_address,
                "bank_name": supplier_profile.bank_name,
                "bank_account": supplier_profile.bank_account,
                "correspondent_account": supplier_profile.correspondent_account,
                "bic": supplier_profile.bic,
                "contact_person": supplier_profile.contact_person,
                "contact_phone": supplier_profile.contact_phone,
                "contact_email": supplier_profile.contact_email,
                "is_verified": supplier_profile.is_verified
            } if supplier_profile else None
        },
        "tender": {
            "id": tender.id,
            "title": tender.title,
            "description": tender.description,
            "initial_price": float(tender.initial_price) if tender.initial_price else None,
            "currency": tender.currency,
            "status": tender.status.value,
            "publication_date": tender.publication_date.isoformat() if tender.publication_date else None,
            "deadline": tender.deadline.isoformat() if tender.deadline else None,
            "okpd_code": tender.okpd_code,
            "region": tender.region,
            "procurement_method": tender.procurement_method,
            "created_by": tender.created_by,
            "created_at": tender.created_at.isoformat(),
            "lots": [
                {
                    "id": lot.id,
                    "lot_number": lot.lot_number,
                    "title": lot.title,
                    "description": lot.description,
                    "initial_price": float(lot.initial_price) if lot.initial_price else None,
                    "currency": lot.currency,
                    "security_amount": float(lot.security_amount) if lot.security_amount else None,
                    "delivery_place": lot.delivery_place,
                    "payment_terms": lot.payment_terms,
                    "quantity": lot.quantity,
                    "unit_of_measure": lot.unit_of_measure,
                    "okpd_code": lot.okpd_code,
                    "okved_code": lot.okved_code,
                    "products": [
                        {
                            "id": product.id,
                            "position_number": product.position_number,
                            "name": product.name,
                            "quantity": product.quantity,
                            "unit_of_measure": product.unit_of_measure
                        } for product in lot.products
                    ]
                } for lot in tender.lots
            ],
            "organizers": [
                {
                    "id": org.id,
                    "organization_name": org.organization_name,
                    "legal_address": org.legal_address,
                    "postal_address": org.postal_address,
                    "email": org.email,
                    "phone": org.phone,
                    "contact_person": org.contact_person,
                    "inn": org.inn,
                    "kpp": org.kpp,
                    "ogrn": org.ogrn
                } for org in tender.organizers
            ],
            "documents": [
                {
                    "id": doc.id,
                    "title": doc.title,
                    "file_path": doc.file_path,
                    "file_size": doc.file_size,
                    "file_type": doc.file_type,
                    "uploaded_at": doc.uploaded_at.isoformat()
                } for doc in tender.documents
            ]
        }
    }
    
    return response_data


@router.get("/export/tender/{tender_id}")
async def export_tender_applications(
    tender_id: int,
    current_user: UserModel = Depends(require_any_role([UserRole.ADMIN, UserRole.CONTRACT_MANAGER])),
    db: Session = Depends(get_db)
):
    """Экспорт заявок на тендер в Excel (для администраторов и контрактных управляющих)"""
    try:
        import pandas as pd
        from io import BytesIO
        from fastapi.responses import StreamingResponse
    except ImportError:
        raise HTTPException(status_code=500, detail="Библиотеки для экспорта в Excel не установлены")
    
    # Проверяем, что тендер существует
    tender = db.query(Tender).filter(Tender.id == tender_id).first()
    if not tender:
        raise HTTPException(status_code=404, detail="Тендер не найден")
    
    # Проверяем права доступа
    if current_user.role != UserRole.ADMIN and tender.created_by != current_user.id:
        raise HTTPException(status_code=403, detail="Недостаточно прав для экспорта заявок на этот тендер")
    
    # Получаем заявки с информацией о поставщиках
    applications = db.query(TenderApplication, UserModel, SupplierProfile).join(
        UserModel, TenderApplication.supplier_id == UserModel.id
    ).outerjoin(
        SupplierProfile, UserModel.id == SupplierProfile.user_id
    ).filter(TenderApplication.tender_id == tender_id).all()
    
    # Подготавливаем данные для Excel
    data = []
    for app, user, profile in applications:
        data.append({
            'ID заявки': app.id,
            'Поставщик': user.full_name,
            'Email': user.email,
            'Компания': profile.company_name if profile else 'Не указано',
            'ИНН': profile.inn if profile else 'Не указано',
            'Предложенная цена': float(app.proposed_price) if app.proposed_price else None,
            'Комментарий': app.comment,
            'Статус': app.status,
            'Дата подачи': app.created_at.strftime('%d.%m.%Y %H:%M')
        })
    
    # Создаем DataFrame и Excel файл
    df = pd.DataFrame(data)
    output = BytesIO()
    with pd.ExcelWriter(output, engine='openpyxl') as writer:
        df.to_excel(writer, sheet_name='Заявки', index=False)
    
    output.seek(0)
    
    # Возвращаем файл
    return StreamingResponse(
        BytesIO(output.read()),
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f"attachment; filename=tender_{tender_id}_applications.xlsx"}
    )
