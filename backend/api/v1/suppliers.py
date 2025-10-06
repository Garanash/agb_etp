from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func
from typing import List, Optional
from database import get_db
from models import (
    Tender, TenderStatus, User as UserModel, UserRole, 
    TenderLot, TenderProduct, TenderDocument, TenderOrganizer,
    SupplierProposal, ProposalItem
)
from schemas import (
    Tender as TenderSchema, SupplierProposal as SupplierProposalSchema,
    SupplierProposalCreate, SupplierProposalUpdate, SupplierProposalWithTender,
    ProposalItemCreate, ProposalItemUpdate, PaginatedResponse
)
from auth import get_current_active_user, require_role
from datetime import datetime
from decimal import Decimal

router = APIRouter()


@router.get("/tenders", response_model=PaginatedResponse)
async def get_tenders_for_suppliers(
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    status: Optional[TenderStatus] = None,
    region: Optional[str] = None,
    search: Optional[str] = None,
    sort: str = Query(
        "by_deadline_asc",
        regex="^(by_deadline_asc|by_deadline_desc|by_published_desc|by_published_asc)$"
    ),
    current_user: UserModel = Depends(require_role([UserRole.SUPPLIER])),
    db: Session = Depends(get_db)
):
    """Получение списка тендеров для поставщиков"""
    
    # Базовый запрос
    query = db.query(Tender)
    
    # Фильтры
    if status:
        query = query.filter(Tender.status == status)
    else:
        # По умолчанию показываем только опубликованные тендеры
        query = query.filter(Tender.status == TenderStatus.PUBLISHED)
    
    if region:
        query = query.filter(Tender.region.ilike(f"%{region}%"))
    
    if search:
        query = query.filter(
            or_(
                Tender.title.ilike(f"%{search}%"),
                Tender.description.ilike(f"%{search}%")
            )
        )
    
    # Сортировка
    if sort == "by_deadline_asc":
        query = query.order_by(Tender.deadline.asc())
    elif sort == "by_deadline_desc":
        query = query.order_by(Tender.deadline.desc())
    elif sort == "by_published_desc":
        query = query.order_by(Tender.publication_date.desc())
    elif sort == "by_published_asc":
        query = query.order_by(Tender.publication_date.asc())
    
    # Подсчет общего количества
    total = query.count()
    
    # Пагинация
    offset = (page - 1) * size
    tenders = query.offset(offset).limit(size).all()
    
    # Преобразование в словари для ответа
    items = []
    for tender in tenders:
        # Проверяем, есть ли уже предложение от этого поставщика
        existing_proposal = db.query(SupplierProposal).filter(
            and_(
                SupplierProposal.tender_id == tender.id,
                SupplierProposal.supplier_id == current_user.id
            )
        ).first()
        
        # Подсчитываем количество предложений
        proposals_count = db.query(SupplierProposal).filter(
            SupplierProposal.tender_id == tender.id
        ).count()
        
        item = {
            "id": tender.id,
            "title": tender.title,
            "description": tender.description,
            "initial_price": float(tender.initial_price) if tender.initial_price else None,
            "currency": tender.currency,
            "status": tender.status,
            "publication_date": tender.publication_date,
            "deadline": tender.deadline,
            "region": tender.region,
            "procurement_method": tender.procurement_method,
            "created_at": tender.created_at,
            "has_proposal": existing_proposal is not None,
            "proposal_status": existing_proposal.status if existing_proposal else None,
            "proposals_count": proposals_count
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


@router.get("/tenders/{tender_id}", response_model=TenderSchema)
async def get_tender_for_supplier(
    tender_id: int,
    current_user: UserModel = Depends(require_role([UserRole.SUPPLIER])),
    db: Session = Depends(get_db)
):
    """Получение детальной информации о тендере для поставщика"""
    tender = db.query(Tender).filter(Tender.id == tender_id).first()
    if not tender:
        raise HTTPException(
            status_code=404,
            detail="Тендер не найден"
        )
    
    # Проверяем, что тендер опубликован
    if tender.status != TenderStatus.PUBLISHED:
        raise HTTPException(
            status_code=403,
            detail="Тендер недоступен для просмотра"
        )
    
    # Загружаем связанные данные
    try:
        tender.lots = db.query(TenderLot).filter(TenderLot.tender_id == tender_id).all()
        tender.documents = db.query(TenderDocument).filter(TenderDocument.tender_id == tender_id).all()
        tender.organizers = db.query(TenderOrganizer).filter(TenderOrganizer.tender_id == tender_id).all()
        
        # Загружаем товары для каждого лота
        for lot in tender.lots:
            lot.products = db.query(TenderProduct).filter(TenderProduct.lot_id == lot.id).all()
    except Exception as e:
        tender.lots = []
        tender.documents = []
        tender.organizers = []
    
    return tender


@router.get("/proposals", response_model=List[SupplierProposalWithTender])
async def get_supplier_proposals(
    status: Optional[str] = None,
    current_user: UserModel = Depends(require_role([UserRole.SUPPLIER])),
    db: Session = Depends(get_db)
):
    """Получение предложений поставщика"""
    
    query = db.query(SupplierProposal).filter(
        SupplierProposal.supplier_id == current_user.id
    )
    
    if status:
        query = query.filter(SupplierProposal.status == status)
    
    proposals = query.order_by(SupplierProposal.created_at.desc()).all()
    
    # Загружаем связанные данные
    result = []
    for proposal in proposals:
        proposal.tender = db.query(Tender).filter(Tender.id == proposal.tender_id).first()
        proposal.proposal_items = db.query(ProposalItem).filter(
            ProposalItem.proposal_id == proposal.id
        ).all()
        
        # Загружаем информацию о товарах
        for item in proposal.proposal_items:
            item.product = db.query(TenderProduct).filter(
                TenderProduct.id == item.product_id
            ).first()
        
        result.append(proposal)
    
    return result


@router.get("/proposals/{proposal_id}", response_model=SupplierProposalSchema)
async def get_supplier_proposal(
    proposal_id: int,
    current_user: UserModel = Depends(require_role([UserRole.SUPPLIER])),
    db: Session = Depends(get_db)
):
    """Получение детальной информации о предложении поставщика"""
    
    proposal = db.query(SupplierProposal).filter(
        and_(
            SupplierProposal.id == proposal_id,
            SupplierProposal.supplier_id == current_user.id
        )
    ).first()
    
    if not proposal:
        raise HTTPException(
            status_code=404,
            detail="Предложение не найдено"
        )
    
    # Загружаем элементы предложения
    proposal.proposal_items = db.query(ProposalItem).filter(
        ProposalItem.proposal_id == proposal.id
    ).all()
    
    # Загружаем информацию о товарах
    for item in proposal.proposal_items:
        item.product = db.query(TenderProduct).filter(
            TenderProduct.id == item.product_id
        ).first()
    
    return proposal


@router.post("/proposals", response_model=SupplierProposalSchema)
async def create_supplier_proposal(
    proposal_data: SupplierProposalCreate,
    current_user: UserModel = Depends(require_role([UserRole.SUPPLIER])),
    db: Session = Depends(get_db)
):
    """Создание нового предложения поставщика"""
    
    # Проверяем, что тендер существует и опубликован
    tender = db.query(Tender).filter(Tender.id == proposal_data.tender_id).first()
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
    
    # Проверяем, что у поставщика еще нет предложения на этот тендер
    existing_proposal = db.query(SupplierProposal).filter(
        and_(
            SupplierProposal.tender_id == proposal_data.tender_id,
            SupplierProposal.supplier_id == current_user.id
        )
    ).first()
    
    if existing_proposal:
        raise HTTPException(
            status_code=400,
            detail="У вас уже есть предложение на этот тендер"
        )
    
    # Создаем предложение
    db_proposal = SupplierProposal(
        tender_id=proposal_data.tender_id,
        supplier_id=current_user.id,
        prepayment_percent=proposal_data.prepayment_percent,
        currency=proposal_data.currency,
        vat_percent=proposal_data.vat_percent,
        general_comment=proposal_data.general_comment,
        status="draft"
    )
    db.add(db_proposal)
    db.flush()  # Получаем ID предложения
    
    # Создаем элементы предложения
    for item_data in proposal_data.proposal_items:
        # Проверяем, что товар существует
        product = db.query(TenderProduct).filter(TenderProduct.id == item_data.product_id).first()
        if not product:
            raise HTTPException(
                status_code=400,
                detail=f"Товар с ID {item_data.product_id} не найден"
            )
        
        db_item = ProposalItem(
            proposal_id=db_proposal.id,
            product_id=item_data.product_id,
            is_available=item_data.is_available,
            is_analog=item_data.is_analog,
            price_per_unit=item_data.price_per_unit,
            delivery_days=item_data.delivery_days,
            comment=item_data.comment
        )
        db.add(db_item)
    
    db.commit()
    db.refresh(db_proposal)
    
    # Загружаем элементы предложения для ответа
    db_proposal.proposal_items = db.query(ProposalItem).filter(
        ProposalItem.proposal_id == db_proposal.id
    ).all()
    
    return db_proposal


@router.put("/proposals/{proposal_id}", response_model=SupplierProposalSchema)
async def update_supplier_proposal(
    proposal_id: int,
    proposal_data: SupplierProposalUpdate,
    current_user: UserModel = Depends(require_role([UserRole.SUPPLIER])),
    db: Session = Depends(get_db)
):
    """Обновление предложения поставщика"""
    
    proposal = db.query(SupplierProposal).filter(
        and_(
            SupplierProposal.id == proposal_id,
            SupplierProposal.supplier_id == current_user.id
        )
    ).first()
    
    if not proposal:
        raise HTTPException(
            status_code=404,
            detail="Предложение не найдено"
        )
    
    # Проверяем, что предложение можно редактировать
    if proposal.status == "submitted":
        raise HTTPException(
            status_code=400,
            detail="Нельзя редактировать отправленное предложение"
        )
    
    # Обновляем основные поля
    update_data = proposal_data.dict(exclude_unset=True, exclude={'proposal_items'})
    for field, value in update_data.items():
        setattr(proposal, field, value)
    
    # Обновляем элементы предложения, если они переданы
    if proposal_data.proposal_items is not None:
        # Удаляем старые элементы
        db.query(ProposalItem).filter(ProposalItem.proposal_id == proposal_id).delete()
        
        # Создаем новые элементы
        for item_data in proposal_data.proposal_items:
            # Проверяем, что товар существует
            product = db.query(TenderProduct).filter(TenderProduct.id == item_data.product_id).first()
            if not product:
                raise HTTPException(
                    status_code=400,
                    detail=f"Товар с ID {item_data.product_id} не найден"
                )
            
            db_item = ProposalItem(
                proposal_id=proposal_id,
                product_id=item_data.product_id,
                is_available=item_data.is_available,
                is_analog=item_data.is_analog,
                price_per_unit=item_data.price_per_unit,
                delivery_days=item_data.delivery_days,
                comment=item_data.comment
            )
            db.add(db_item)
    
    proposal.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(proposal)
    
    # Загружаем элементы предложения для ответа
    proposal.proposal_items = db.query(ProposalItem).filter(
        ProposalItem.proposal_id == proposal.id
    ).all()
    
    return proposal


@router.post("/proposals/{proposal_id}/submit")
async def submit_supplier_proposal(
    proposal_id: int,
    current_user: UserModel = Depends(require_role([UserRole.SUPPLIER])),
    db: Session = Depends(get_db)
):
    """Отправка предложения поставщика"""
    
    proposal = db.query(SupplierProposal).filter(
        and_(
            SupplierProposal.id == proposal_id,
            SupplierProposal.supplier_id == current_user.id
        )
    ).first()
    
    if not proposal:
        raise HTTPException(
            status_code=404,
            detail="Предложение не найдено"
        )
    
    if proposal.status != "draft":
        raise HTTPException(
            status_code=400,
            detail="Можно отправлять только черновики"
        )
    
    # Проверяем, что есть хотя бы один элемент предложения
    items_count = db.query(ProposalItem).filter(ProposalItem.proposal_id == proposal_id).count()
    if items_count == 0:
        raise HTTPException(
            status_code=400,
            detail="Нельзя отправлять пустое предложение"
        )
    
    proposal.status = "submitted"
    proposal.updated_at = datetime.utcnow()
    db.commit()
    
    return {"message": "Предложение успешно отправлено"}


@router.get("/tenders/{tender_id}/products")
async def get_tender_products_for_proposal(
    tender_id: int,
    current_user: UserModel = Depends(require_role([UserRole.SUPPLIER])),
    db: Session = Depends(get_db)
):
    """Получение списка товаров тендера для создания предложения"""
    
    # Проверяем, что тендер существует и опубликован
    tender = db.query(Tender).filter(Tender.id == tender_id).first()
    if not tender:
        raise HTTPException(
            status_code=404,
            detail="Тендер не найден"
        )
    
    if tender.status != TenderStatus.PUBLISHED:
        raise HTTPException(
            status_code=403,
            detail="Тендер недоступен для просмотра"
        )
    
    # Получаем все лоты тендера
    lots = db.query(TenderLot).filter(TenderLot.tender_id == tender_id).all()
    
    # Получаем все товары для всех лотов
    products = []
    for lot in lots:
        lot_products = db.query(TenderProduct).filter(TenderProduct.lot_id == lot.id).all()
        for product in lot_products:
            products.append({
                "id": product.id,
                "lot_id": lot.id,
                "lot_number": lot.lot_number,
                "lot_title": lot.title,
                "position_number": product.position_number,
                "name": product.name,
                "quantity": product.quantity,
                "unit_of_measure": product.unit_of_measure
            })
    
    return products
