from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from typing import List, Optional
from database import get_db
from models import Tender, TenderStatus, User as UserModel, UserRole, TenderLot, TenderProduct, TenderDocument, TenderOrganizer, TenderProcedureStage
from schemas import Tender as TenderSchema, TenderCreate, TenderUpdate, PaginatedResponse
from auth import get_current_active_user, require_role, require_any_role
from datetime import datetime

router = APIRouter()


@router.get("/", response_model=PaginatedResponse)
async def get_tenders(
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    status: Optional[TenderStatus] = None,
    region: Optional[str] = None,
    okpd_code: Optional[str] = None,
    okved_code: Optional[str] = None,
    search: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    currency: Optional[str] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    procurement_method: Optional[str] = None,
    organizer_inn: Optional[str] = None,
    sort: str = Query(
        "by_published_desc",
        regex="^(by_published_desc|by_published_asc|by_deadline_asc|by_deadline_desc|by_price_asc|by_price_desc)$"
    ),
    db: Session = Depends(get_db)
):
    """Получение списка тендеров с расширенной фильтрацией и пагинацией"""
    
    # Базовый запрос с подключением связанных таблиц
    query = db.query(Tender).outerjoin(TenderOrganizer)
    
    # Фильтры
    if status:
        query = query.filter(Tender.status == status)
    
    if region:
        query = query.filter(Tender.region.ilike(f"%{region}%"))
    
    if okpd_code:
        query = query.filter(
            or_(
                Tender.okpd_code.ilike(f"%{okpd_code}%"),
                TenderLot.okpd_code.ilike(f"%{okpd_code}%")
            )
        )
    
    if okved_code:
        query = query.filter(
            or_(
                Tender.okved_code.ilike(f"%{okved_code}%"),
                TenderLot.okved_code.ilike(f"%{okved_code}%")
            )
        )
    
    if search:
        query = query.filter(
            or_(
                Tender.title.ilike(f"%{search}%"),
                Tender.description.ilike(f"%{search}%"),
                TenderLot.title.ilike(f"%{search}%"),
                TenderLot.description.ilike(f"%{search}%"),
                TenderProduct.name.ilike(f"%{search}%")
            )
        )
    
    if min_price is not None:
        query = query.filter(Tender.initial_price >= min_price)
    
    if max_price is not None:
        query = query.filter(Tender.initial_price <= max_price)
    
    if currency:
        query = query.filter(Tender.currency == currency)
    
    if start_date:
        query = query.filter(Tender.publication_date >= start_date)
    
    if end_date:
        query = query.filter(Tender.publication_date <= end_date)
    
    if procurement_method:
        query = query.filter(Tender.procurement_method == procurement_method)
    
    if organizer_inn:
        query = query.filter(TenderOrganizer.inn == organizer_inn)
    
    # Сортировка
    if sort == "by_published_desc":
        query = query.order_by(Tender.publication_date.desc())
    elif sort == "by_published_asc":
        query = query.order_by(Tender.publication_date.asc())
    elif sort == "by_deadline_asc":
        query = query.order_by(Tender.deadline.asc())
    elif sort == "by_deadline_desc":
        query = query.order_by(Tender.deadline.desc())
    elif sort == "by_price_asc":
        query = query.order_by(Tender.initial_price.asc())
    elif sort == "by_price_desc":
        query = query.order_by(Tender.initial_price.desc())
    
    # Подсчет общего количества
    total = query.count()
    
    # Пагинация
    offset = (page - 1) * size
    tenders = query.offset(offset).limit(size).all()
    
    # Преобразование в словари для ответа
    items = []
    for tender in tenders:
        # Загружаем связанные данные
        tender.lots = db.query(TenderLot).filter(TenderLot.tender_id == tender.id).all()
        tender.documents = db.query(TenderDocument).filter(TenderDocument.tender_id == tender.id).all()
        tender.organizers = db.query(TenderOrganizer).filter(TenderOrganizer.tender_id == tender.id).all()
        
        # Загружаем товары для каждого лота
        for lot in tender.lots:
            lot.products = db.query(TenderProduct).filter(TenderProduct.lot_id == lot.id).all()
        
        item = {
            "id": tender.id,
            "title": tender.title,
            "description": tender.description,
            "initial_price": float(tender.initial_price) if tender.initial_price else None,
            "currency": tender.currency,
            "status": tender.status,
            "publication_date": tender.publication_date,
            "deadline": tender.deadline,
            "okpd_code": tender.okpd_code,
            "okved_code": tender.okved_code,
            "region": tender.region,
            "procurement_method": tender.procurement_method,
            "created_at": tender.created_at,
            "lots": [
                {
                    "id": lot.id,
                    "lot_number": lot.lot_number,
                    "title": lot.title,
                    "initial_price": float(lot.initial_price) if lot.initial_price else None,
                    "currency": lot.currency,
                    "products_count": len(lot.products)
                } for lot in tender.lots
            ],
            "documents_count": len(tender.documents),
            "organizers": [
                {
                    "id": org.id,
                    "organization_name": org.organization_name,
                    "inn": org.inn
                } for org in tender.organizers
            ]
        }
        items.append(item)
    
    pages = (total + size - 1) // size
    
    return PaginatedResponse(
        items=items,
        total=total,
        page=page,
        size=size,
        pages=pages
    )


@router.get("/{tender_id}", response_model=TenderSchema)
async def get_tender(
    tender_id: int,
    db: Session = Depends(get_db)
):
    """Получение детальной информации о тендере"""
    tender = db.query(Tender).filter(Tender.id == tender_id).first()
    if not tender:
        raise HTTPException(
            status_code=404,
            detail="Тендер не найден"
        )
    
    # Загружаем связанные данные
    try:
        tender.lots = db.query(TenderLot).filter(TenderLot.tender_id == tender_id).all()
        tender.documents = db.query(TenderDocument).filter(TenderDocument.tender_id == tender_id).all()
        tender.organizers = db.query(TenderOrganizer).filter(TenderOrganizer.tender_id == tender_id).all()
        tender.stages = db.query(TenderProcedureStage).filter(TenderProcedureStage.tender_id == tender_id).all()
        
        # Загружаем товары для каждого лота
        for lot in tender.lots:
            lot.products = db.query(TenderProduct).filter(TenderProduct.lot_id == lot.id).all()
    except Exception as e:
        # Если есть ошибка с загрузкой связанных данных, возвращаем пустые списки
        tender.lots = []
        tender.documents = []
        tender.organizers = []
        tender.stages = []
    
    return tender


@router.get("/{tender_id}/products")
async def get_tender_products(
    tender_id: int,
    db: Session = Depends(get_db)
):
    """Получение списка товаров тендера для подачи заявки"""
    # Проверяем, что тендер существует
    tender = db.query(Tender).filter(Tender.id == tender_id).first()
    if not tender:
        raise HTTPException(
            status_code=404,
            detail="Тендер не найден"
        )
    
    # Получаем все лоты тендера
    lots = db.query(TenderLot).filter(TenderLot.tender_id == tender_id).all()
    
    # Собираем все товары из всех лотов
    products = []
    for lot in lots:
        lot_products = db.query(TenderProduct).filter(TenderProduct.lot_id == lot.id).all()
        for product in lot_products:
            products.append({
                "id": product.id,
                "lot_id": product.lot_id,
                "lot_number": lot.lot_number,
                "lot_title": lot.title,
                "position_number": product.position_number,
                "name": product.name,
                "quantity": product.quantity,
                "unit_of_measure": product.unit_of_measure,
            })
    
    return products


@router.post("/{tender_id}/proposals")
async def create_tender_proposal(
    tender_id: int,
    proposal_data: dict,
    current_user: UserModel = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Создание предложения по тендеру (доступно всем пользователям)"""
    
    # Проверяем, что пользователь - поставщик
    if current_user.role != UserRole.SUPPLIER:
        raise HTTPException(
            status_code=403,
            detail="Только поставщики могут подавать заявки на тендеры"
        )
    
    # Проверяем, что тендер существует и опубликован
    tender = db.query(Tender).filter(Tender.id == tender_id).first()
    if not tender:
        raise HTTPException(
            status_code=404,
            detail="Тендер не найден"
        )
    
    if tender.status != TenderStatus.PUBLISHED:
        raise HTTPException(
            status_code=400,
            detail="Нельзя подавать предложения на неопубликованные тендеры"
        )
    
    # Импортируем необходимые модели
    from models import SupplierProposal, ProposalItem
    
    # Проверяем, что у поставщика еще нет предложения на этот тендер
    existing_proposal = db.query(SupplierProposal).filter(
        and_(
            SupplierProposal.tender_id == tender_id,
            SupplierProposal.supplier_id == current_user.id
        )
    ).first()
    
    if existing_proposal:
        raise HTTPException(
            status_code=400,
            detail="У вас уже есть предложение по этому тендеру"
        )
    
    # Создаем предложение
    proposal = SupplierProposal(
        tender_id=tender_id,
        supplier_id=current_user.id,
        prepayment_percent=proposal_data.get('prepayment_percent', 0),
        currency=proposal_data.get('currency', 'RUB'),
        vat_percent=proposal_data.get('vat_percent', 20),
        general_comment=proposal_data.get('general_comment', ''),
        status='draft'
    )
    
    db.add(proposal)
    db.flush()  # Получаем ID предложения
    
    # Создаем элементы предложения
    for item_data in proposal_data.get('proposal_items', []):
        proposal_item = ProposalItem(
            proposal_id=proposal.id,
            product_id=item_data['product_id'],
            is_available=item_data.get('is_available', True),
            is_analog=item_data.get('is_analog', False),
            price_per_unit=item_data.get('price_per_unit'),
            delivery_days=item_data.get('delivery_days'),
            comment=item_data.get('comment', '')
        )
        db.add(proposal_item)
    
    db.commit()
    db.refresh(proposal)
    
    return {"id": proposal.id, "status": "created"}


@router.get("/proposals")
async def get_proposals(
    current_user: UserModel = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Получение предложений в зависимости от роли пользователя"""
    
    # Импортируем необходимые модели
    from models import SupplierProposal, ProposalItem, Tender
    
    # Определяем какие предложения показывать в зависимости от роли
    if current_user.role == UserRole.SUPPLIER:
        # Поставщики видят только свои предложения
        proposals = db.query(SupplierProposal).filter(
            SupplierProposal.supplier_id == current_user.id
        ).all()
    elif current_user.role in [UserRole.ADMIN, UserRole.CONTRACT_MANAGER, UserRole.MANAGER]:
        # Админы, контрактные управляющие и менеджеры видят все предложения
        proposals = db.query(SupplierProposal).all()
    else:
        raise HTTPException(
            status_code=403,
            detail="У вас нет прав для просмотра предложений"
        )
    
    # Загружаем связанные данные
    result = []
    for proposal in proposals:
        # Получаем информацию о тендере
        tender = db.query(Tender).filter(Tender.id == proposal.tender_id).first()
        
        # Получаем информацию о поставщике
        supplier = db.query(UserModel).filter(UserModel.id == proposal.supplier_id).first()
        
        proposal_data = {
            "id": proposal.id,
            "tender_id": proposal.tender_id,
            "supplier_id": proposal.supplier_id,
            "prepayment_percent": proposal.prepayment_percent,
            "currency": proposal.currency,
            "vat_percent": proposal.vat_percent,
            "general_comment": proposal.general_comment,
            "status": proposal.status,
            "created_at": proposal.created_at.isoformat() if proposal.created_at else None,
            "updated_at": proposal.updated_at.isoformat() if proposal.updated_at else None,
            "proposal_items": [],
            # Дополнительная информация для админов/менеджеров
            "tender_info": {
                "title": tender.title if tender else "Тендер не найден",
                "status": tender.status if tender else "unknown",
                "initial_price": float(tender.initial_price) if tender and tender.initial_price else None,
                "currency": tender.currency if tender else None,
                "deadline": tender.deadline.isoformat() if tender and tender.deadline else None,
            } if current_user.role in [UserRole.ADMIN, UserRole.CONTRACT_MANAGER, UserRole.MANAGER] else None,
            "supplier_info": {
                "full_name": supplier.full_name if supplier else "Поставщик не найден",
                "email": supplier.email if supplier else None,
                "phone": supplier.phone if supplier else None,
            } if current_user.role in [UserRole.ADMIN, UserRole.CONTRACT_MANAGER, UserRole.MANAGER] else None,
        }
        
        # Загружаем элементы предложения
        items = db.query(ProposalItem).filter(
            ProposalItem.proposal_id == proposal.id
        ).all()
        
        for item in items:
            proposal_data["proposal_items"].append({
                "id": item.id,
                "proposal_id": item.proposal_id,
                "product_id": item.product_id,
                "is_available": item.is_available,
                "is_analog": item.is_analog,
                "price_per_unit": float(item.price_per_unit) if item.price_per_unit else None,
                "delivery_days": item.delivery_days,
                "comment": item.comment,
                "created_at": item.created_at.isoformat() if item.created_at else None,
                "updated_at": item.updated_at.isoformat() if item.updated_at else None,
            })
        
        result.append(proposal_data)
    
    return result


@router.post("/", response_model=TenderSchema)
async def create_tender(
    tender_data: TenderCreate,
    current_user: UserModel = Depends(require_any_role([UserRole.ADMIN, UserRole.CONTRACT_MANAGER])),
    db: Session = Depends(get_db)
):
    """Создание нового тендера"""
    # Проверяем обязательные поля
    if not tender_data.organizers:
        raise HTTPException(
            status_code=400, 
            detail="Необходимо указать хотя бы одного организатора"
        )
    
    if not tender_data.lots:
        raise HTTPException(
            status_code=400, 
            detail="Необходимо создать хотя бы один лот"
        )
    
    if not tender_data.documents:
        raise HTTPException(
            status_code=400, 
            detail="Необходимо загрузить хотя бы один документ"
        )
    
    # Создаем тендер
    db_tender = Tender(
        title=tender_data.title,
        description=tender_data.description,
        initial_price=tender_data.initial_price,
        currency=tender_data.currency,
        deadline=tender_data.deadline,
        okpd_code=tender_data.okpd_code,
        region=tender_data.region,
        created_by=current_user.id,
        publication_date=datetime.utcnow(),
        status=TenderStatus.PUBLISHED # По умолчанию публикуем сразу
    )
    db.add(db_tender)
    db.commit()
    db.refresh(db_tender)
    
    # Создаем организаторов
    for organizer_data in tender_data.organizers:
        db_organizer = TenderOrganizer(
            tender_id=db_tender.id,
            organization_name=organizer_data.organization_name,
            legal_address=organizer_data.legal_address,
            postal_address=organizer_data.postal_address,
            email=organizer_data.email,
            phone=organizer_data.phone,
            contact_person=organizer_data.contact_person,
            inn=organizer_data.inn,
            kpp=organizer_data.kpp,
            ogrn=organizer_data.ogrn
        )
        db.add(db_organizer)
    
    # Создаем лоты
    for lot_data in tender_data.lots:
        db_lot = TenderLot(
            tender_id=db_tender.id,
            lot_number=lot_data.lot_number,
            title=lot_data.title,
            description=lot_data.description,
            initial_price=lot_data.initial_price,
            currency=lot_data.currency,
            security_amount=lot_data.security_amount,
            delivery_place=lot_data.delivery_place,
            payment_terms=lot_data.payment_terms,
            quantity=lot_data.quantity,
            unit_of_measure=lot_data.unit_of_measure,
            okpd_code=lot_data.okpd_code,
            okved_code=lot_data.okved_code
        )
        db.add(db_lot)
        db.flush()  # Получаем ID лота
        
        # Создаем товары для лота, если они есть
        if hasattr(lot_data, 'products') and lot_data.products:
            for product_data in lot_data.products:
                db_product = TenderProduct(
                    lot_id=db_lot.id,
                    position_number=product_data.position_number,
                    name=product_data.name,
                    quantity=product_data.quantity,
                    unit_of_measure=product_data.unit_of_measure
                )
                db.add(db_product)
    
    # Создаем документы
    for document_data in tender_data.documents:
        db_document = TenderDocument(
            tender_id=db_tender.id,
            title=document_data.title,
            file_path=document_data.file_path,
            file_size=document_data.file_size,
            file_type=document_data.file_type
        )
        db.add(db_document)
    
    db.commit()
    db.refresh(db_tender)
    return db_tender


@router.put("/{tender_id}", response_model=TenderSchema)
async def update_tender(
    tender_id: int,
    tender_data: TenderUpdate,
    current_user: UserModel = Depends(require_any_role([UserRole.ADMIN, UserRole.CONTRACT_MANAGER])),
    db: Session = Depends(get_db)
):
    """Обновление тендера"""
    tender = db.query(Tender).filter(Tender.id == tender_id).first()
    if not tender:
        raise HTTPException(
            status_code=404,
            detail="Тендер не найден"
        )
    
    # Проверяем права доступа
    if current_user.role != UserRole.ADMIN and tender.created_by != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="Недостаточно прав для редактирования этого тендера"
        )
    
    # Проверяем обязательные поля
    if not tender_data.organizers:
        raise HTTPException(
            status_code=400, 
            detail="Необходимо указать хотя бы одного организатора"
        )
    
    if not tender_data.lots:
        raise HTTPException(
            status_code=400, 
            detail="Необходимо создать хотя бы один лот"
        )
    
    if not tender_data.documents:
        raise HTTPException(
            status_code=400, 
            detail="Необходимо загрузить хотя бы один документ"
        )
    
    # Обновляем основные поля тендера
    update_data = tender_data.dict(exclude_unset=True, exclude={'organizers', 'lots', 'documents'})
    for field, value in update_data.items():
        setattr(tender, field, value)
    
    # Обновляем организаторов
    db.query(TenderOrganizer).filter(TenderOrganizer.tender_id == tender_id).delete()
    for organizer_data in tender_data.organizers:
        db_organizer = TenderOrganizer(
            tender_id=tender.id,
            organization_name=organizer_data.organization_name,
            legal_address=organizer_data.legal_address,
            postal_address=organizer_data.postal_address,
            email=organizer_data.email,
            phone=organizer_data.phone,
            contact_person=organizer_data.contact_person,
            inn=organizer_data.inn,
            kpp=organizer_data.kpp,
            ogrn=organizer_data.ogrn
        )
        db.add(db_organizer)
    
    # Обновляем лоты
    # Сначала удаляем все товары для каждого лота
    old_lots = db.query(TenderLot).filter(TenderLot.tender_id == tender_id).all()
    for lot in old_lots:
        db.query(TenderProduct).filter(TenderProduct.lot_id == lot.id).delete()
    # Затем удаляем сами лоты
    db.query(TenderLot).filter(TenderLot.tender_id == tender_id).delete()
    
    # Создаем новые лоты и товары
    for lot_data in tender_data.lots:
        db_lot = TenderLot(
            tender_id=tender.id,
            lot_number=lot_data.lot_number,
            title=lot_data.title,
            description=lot_data.description,
            initial_price=lot_data.initial_price,
            currency=lot_data.currency,
            security_amount=lot_data.security_amount,
            delivery_place=lot_data.delivery_place,
            payment_terms=lot_data.payment_terms,
            quantity=lot_data.quantity,
            unit_of_measure=lot_data.unit_of_measure,
            okpd_code=lot_data.okpd_code,
            okved_code=lot_data.okved_code
        )
        db.add(db_lot)
        db.flush()  # Получаем ID лота
        
        # Создаем товары для лота
        if hasattr(lot_data, 'products') and lot_data.products:
            for product_data in lot_data.products:
                db_product = TenderProduct(
                    lot_id=db_lot.id,
                    position_number=product_data.position_number,
                    name=product_data.name,
                    quantity=product_data.quantity,
                    unit_of_measure=product_data.unit_of_measure
                )
                db.add(db_product)
    
    # Обновляем документы
    db.query(TenderDocument).filter(TenderDocument.tender_id == tender_id).delete()
    for document_data in tender_data.documents:
        db_document = TenderDocument(
            tender_id=tender.id,
            title=document_data.title,
            file_path=document_data.file_path,
            file_size=document_data.file_size,
            file_type=document_data.file_type
        )
        db.add(db_document)
    
    tender.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(tender)
    
    # Загружаем связанные данные для ответа
    tender.lots = db.query(TenderLot).filter(TenderLot.tender_id == tender.id).all()
    tender.documents = db.query(TenderDocument).filter(TenderDocument.tender_id == tender.id).all()
    tender.organizers = db.query(TenderOrganizer).filter(TenderOrganizer.tender_id == tender.id).all()
    
    # Загружаем товары для каждого лота
    for lot in tender.lots:
        lot.products = db.query(TenderProduct).filter(TenderProduct.lot_id == lot.id).all()
    
    return tender


@router.post("/{tender_id}/publish")
async def publish_tender(
    tender_id: int,
    current_user: UserModel = Depends(require_any_role([UserRole.ADMIN, UserRole.CONTRACT_MANAGER])),
    db: Session = Depends(get_db)
):
    """Публикация тендера"""
    tender = db.query(Tender).filter(Tender.id == tender_id).first()
    if not tender:
        raise HTTPException(
            status_code=404,
            detail="Тендер не найден"
        )
    
    if tender.status != TenderStatus.DRAFT:
        raise HTTPException(
            status_code=400,
            detail="Можно публиковать только тендеры в статусе 'Черновик'"
        )
    
    tender.status = TenderStatus.PUBLISHED
    tender.publication_date = datetime.utcnow()
    
    db.commit()
    return {"message": "Тендер успешно опубликован"}
