from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func, desc, asc
from typing import List, Optional, Dict, Any
from database import get_db
from models import (
    Tender, TenderStatus, User as UserModel, UserRole, 
    SupplierProposal, ProposalItem, TenderProduct, TenderLot
)
from auth import get_current_active_user, require_any_role
from datetime import datetime, timedelta
from decimal import Decimal

router = APIRouter()


@router.get("/tenders/summary")
async def get_tenders_analytics_summary(
    current_user: UserModel = Depends(require_any_role([UserRole.ADMIN, UserRole.CONTRACT_MANAGER, UserRole.MANAGER])),
    db: Session = Depends(get_db)
):
    """Общая аналитика по тендерам"""
    
    # Общее количество тендеров по статусам
    status_counts = db.query(
        Tender.status,
        func.count(Tender.id).label('count')
    ).group_by(Tender.status).all()
    
    # Общее количество предложений
    total_proposals = db.query(SupplierProposal).count()
    
    # Количество уникальных поставщиков
    unique_suppliers = db.query(func.count(func.distinct(SupplierProposal.supplier_id))).scalar()
    
    # Средняя цена предложений
    avg_proposal_price = db.query(func.avg(ProposalItem.price_per_unit)).filter(
        ProposalItem.price_per_unit.isnot(None)
    ).scalar()
    
    # Тендеры за последние 30 дней
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    recent_tenders = db.query(Tender).filter(
        Tender.created_at >= thirty_days_ago
    ).count()
    
    return {
        "status_counts": {status: count for status, count in status_counts},
        "total_proposals": total_proposals,
        "unique_suppliers": unique_suppliers,
        "avg_proposal_price": float(avg_proposal_price) if avg_proposal_price else 0,
        "recent_tenders_30_days": recent_tenders
    }


@router.get("/suppliers/performance")
async def get_suppliers_analytics(
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    sort_by: str = Query("proposals_count", regex="^(proposals_count|avg_price|success_rate)$"),
    sort_order: str = Query("desc", regex="^(asc|desc)$"),
    current_user: UserModel = Depends(require_any_role([UserRole.ADMIN, UserRole.CONTRACT_MANAGER, UserRole.MANAGER])),
    db: Session = Depends(get_db)
):
    """Аналитика по поставщикам"""
    
    # Базовый запрос для аналитики поставщиков
    query = db.query(
        UserModel.id,
        UserModel.full_name,
        UserModel.email,
        func.count(SupplierProposal.id).label('proposals_count'),
        func.avg(ProposalItem.price_per_unit).label('avg_price'),
        func.count(
            func.case(
                [(SupplierProposal.status == 'accepted', 1)],
                else_=None
            )
        ).label('accepted_proposals'),
        func.min(SupplierProposal.created_at).label('first_proposal'),
        func.max(SupplierProposal.created_at).label('last_proposal')
    ).join(
        SupplierProposal, UserModel.id == SupplierProposal.supplier_id
    ).join(
        ProposalItem, SupplierProposal.id == ProposalItem.proposal_id
    ).filter(
        UserModel.role == UserRole.SUPPLIER
    ).group_by(
        UserModel.id, UserModel.full_name, UserModel.email
    )
    
    # Сортировка
    if sort_by == "proposals_count":
        if sort_order == "desc":
            query = query.order_by(desc('proposals_count'))
        else:
            query = query.order_by(asc('proposals_count'))
    elif sort_by == "avg_price":
        if sort_order == "desc":
            query = query.order_by(desc('avg_price'))
        else:
            query = query.order_by(asc('avg_price'))
    elif sort_by == "success_rate":
        # Вычисляем success rate как accepted_proposals / proposals_count
        query = query.order_by(desc('accepted_proposals'))
    
    # Подсчет общего количества
    total = query.count()
    
    # Пагинация
    offset = (page - 1) * size
    suppliers = query.offset(offset).limit(size).all()
    
    # Формируем результат
    items = []
    for supplier in suppliers:
        success_rate = 0
        if supplier.proposals_count > 0:
            success_rate = (supplier.accepted_proposals / supplier.proposals_count) * 100
        
        items.append({
            "supplier_id": supplier.id,
            "supplier_name": supplier.full_name,
            "supplier_email": supplier.email,
            "proposals_count": supplier.proposals_count,
            "accepted_proposals": supplier.accepted_proposals,
            "success_rate": round(success_rate, 2),
            "avg_price": float(supplier.avg_price) if supplier.avg_price else 0,
            "first_proposal": supplier.first_proposal,
            "last_proposal": supplier.last_proposal
        })
    
    pages = (total + size - 1) // size
    
    return {
        "items": items,
        "total": total,
        "page": page,
        "size": size,
        "pages": pages
    }


@router.get("/tenders/{tender_id}/proposals")
async def get_tender_proposals_analytics(
    tender_id: int,
    current_user: UserModel = Depends(require_any_role([UserRole.ADMIN, UserRole.CONTRACT_MANAGER, UserRole.MANAGER])),
    db: Session = Depends(get_db)
):
    """Аналитика предложений по конкретному тендеру"""
    
    # Проверяем, что тендер существует
    tender = db.query(Tender).filter(Tender.id == tender_id).first()
    if not tender:
        raise HTTPException(
            status_code=404,
            detail="Тендер не найден"
        )
    
    # Получаем все предложения по тендеру
    proposals = db.query(SupplierProposal).filter(
        SupplierProposal.tender_id == tender_id
    ).all()
    
    # Аналитика по предложениям
    proposals_data = []
    for proposal in proposals:
        # Получаем информацию о поставщике
        supplier = db.query(UserModel).filter(UserModel.id == proposal.supplier_id).first()
        
        # Получаем элементы предложения
        proposal_items = db.query(ProposalItem).filter(
            ProposalItem.proposal_id == proposal.id
        ).all()
        
        # Вычисляем общую стоимость предложения
        total_price = 0
        available_items = 0
        analog_items = 0
        
        for item in proposal_items:
            if item.price_per_unit and item.is_available:
                total_price += float(item.price_per_unit)
                available_items += 1
            if item.is_analog:
                analog_items += 1
        
        proposals_data.append({
            "proposal_id": proposal.id,
            "supplier_id": proposal.supplier_id,
            "supplier_name": supplier.full_name if supplier else "Неизвестно",
            "supplier_email": supplier.email if supplier else "",
            "status": proposal.status,
            "prepayment_percent": float(proposal.prepayment_percent),
            "currency": proposal.currency,
            "vat_percent": float(proposal.vat_percent),
            "total_price": total_price,
            "available_items": available_items,
            "analog_items": analog_items,
            "total_items": len(proposal_items),
            "created_at": proposal.created_at,
            "updated_at": proposal.updated_at
        })
    
    # Сортируем по общей стоимости
    proposals_data.sort(key=lambda x: x['total_price'], reverse=True)
    
    return {
        "tender_id": tender_id,
        "tender_title": tender.title,
        "proposals_count": len(proposals_data),
        "proposals": proposals_data
    }


@router.get("/products/price-analysis")
async def get_products_price_analysis(
    product_name: Optional[str] = None,
    limit: int = Query(50, ge=1, le=200),
    current_user: UserModel = Depends(require_any_role([UserRole.ADMIN, UserRole.CONTRACT_MANAGER, UserRole.MANAGER])),
    db: Session = Depends(get_db)
):
    """Анализ цен по товарам"""
    
    # Базовый запрос для анализа цен
    query = db.query(
        TenderProduct.id,
        TenderProduct.name,
        TenderProduct.position_number,
        func.count(ProposalItem.id).label('proposals_count'),
        func.avg(ProposalItem.price_per_unit).label('avg_price'),
        func.min(ProposalItem.price_per_unit).label('min_price'),
        func.max(ProposalItem.price_per_unit).label('max_price'),
        func.stddev(ProposalItem.price_per_unit).label('price_stddev')
    ).join(
        ProposalItem, TenderProduct.id == ProposalItem.product_id
    ).filter(
        ProposalItem.price_per_unit.isnot(None),
        ProposalItem.is_available == True
    )
    
    if product_name:
        query = query.filter(TenderProduct.name.ilike(f"%{product_name}%"))
    
    query = query.group_by(
        TenderProduct.id, TenderProduct.name, TenderProduct.position_number
    ).having(
        func.count(ProposalItem.id) >= 2  # Только товары с минимум 2 предложениями
    ).order_by(
        desc('proposals_count')
    ).limit(limit)
    
    results = query.all()
    
    # Формируем результат
    items = []
    for result in results:
        items.append({
            "product_id": result.id,
            "product_name": result.name,
            "position_number": result.position_number,
            "proposals_count": result.proposals_count,
            "avg_price": float(result.avg_price) if result.avg_price else 0,
            "min_price": float(result.min_price) if result.min_price else 0,
            "max_price": float(result.max_price) if result.max_price else 0,
            "price_stddev": float(result.price_stddev) if result.price_stddev else 0,
            "price_range": float(result.max_price - result.min_price) if result.max_price and result.min_price else 0
        })
    
    return {
        "items": items,
        "total": len(items)
    }


@router.get("/suppliers/{supplier_id}/statistics")
async def get_supplier_statistics(
    supplier_id: int,
    current_user: UserModel = Depends(require_any_role([UserRole.ADMIN, UserRole.CONTRACT_MANAGER, UserRole.MANAGER])),
    db: Session = Depends(get_db)
):
    """Детальная статистика по конкретному поставщику"""
    
    # Проверяем, что поставщик существует
    supplier = db.query(UserModel).filter(
        and_(
            UserModel.id == supplier_id,
            UserModel.role == UserRole.SUPPLIER
        )
    ).first()
    
    if not supplier:
        raise HTTPException(
            status_code=404,
            detail="Поставщик не найден"
        )
    
    # Общая статистика
    total_proposals = db.query(SupplierProposal).filter(
        SupplierProposal.supplier_id == supplier_id
    ).count()
    
    accepted_proposals = db.query(SupplierProposal).filter(
        and_(
            SupplierProposal.supplier_id == supplier_id,
            SupplierProposal.status == 'accepted'
        )
    ).count()
    
    # Статистика по ценам
    price_stats = db.query(
        func.avg(ProposalItem.price_per_unit).label('avg_price'),
        func.min(ProposalItem.price_per_unit).label('min_price'),
        func.max(ProposalItem.price_per_unit).label('max_price'),
        func.count(ProposalItem.id).label('total_items')
    ).join(
        SupplierProposal, ProposalItem.proposal_id == SupplierProposal.id
    ).filter(
        and_(
            SupplierProposal.supplier_id == supplier_id,
            ProposalItem.price_per_unit.isnot(None),
            ProposalItem.is_available == True
        )
    ).first()
    
    # Статистика по срокам поставки
    delivery_stats = db.query(
        func.avg(ProposalItem.delivery_days).label('avg_delivery'),
        func.min(ProposalItem.delivery_days).label('min_delivery'),
        func.max(ProposalItem.delivery_days).label('max_delivery')
    ).join(
        SupplierProposal, ProposalItem.proposal_id == SupplierProposal.id
    ).filter(
        and_(
            SupplierProposal.supplier_id == supplier_id,
            ProposalItem.delivery_days.isnot(None)
        )
    ).first()
    
    # Статистика по аналогам
    analog_stats = db.query(
        func.count(
            func.case(
                [(ProposalItem.is_analog == True, 1)],
                else_=None
            )
        ).label('analog_count'),
        func.count(ProposalItem.id).label('total_items')
    ).join(
        SupplierProposal, ProposalItem.proposal_id == SupplierProposal.id
    ).filter(
        SupplierProposal.supplier_id == supplier_id
    ).first()
    
    # Последние предложения
    recent_proposals = db.query(SupplierProposal).filter(
        SupplierProposal.supplier_id == supplier_id
    ).order_by(SupplierProposal.created_at.desc()).limit(5).all()
    
    recent_proposals_data = []
    for proposal in recent_proposals:
        tender = db.query(Tender).filter(Tender.id == proposal.tender_id).first()
        recent_proposals_data.append({
            "proposal_id": proposal.id,
            "tender_id": proposal.tender_id,
            "tender_title": tender.title if tender else "Неизвестно",
            "status": proposal.status,
            "created_at": proposal.created_at
        })
    
    return {
        "supplier": {
            "id": supplier.id,
            "name": supplier.full_name,
            "email": supplier.email
        },
        "statistics": {
            "total_proposals": total_proposals,
            "accepted_proposals": accepted_proposals,
            "success_rate": round((accepted_proposals / total_proposals * 100), 2) if total_proposals > 0 else 0,
            "price_statistics": {
                "avg_price": float(price_stats.avg_price) if price_stats.avg_price else 0,
                "min_price": float(price_stats.min_price) if price_stats.min_price else 0,
                "max_price": float(price_stats.max_price) if price_stats.max_price else 0,
                "total_items": price_stats.total_items or 0
            },
            "delivery_statistics": {
                "avg_delivery_days": float(delivery_stats.avg_delivery) if delivery_stats.avg_delivery else 0,
                "min_delivery_days": delivery_stats.min_delivery or 0,
                "max_delivery_days": delivery_stats.max_delivery or 0
            },
            "analog_statistics": {
                "analog_items": analog_stats.analog_count or 0,
                "total_items": analog_stats.total_items or 0,
                "analog_percentage": round((analog_stats.analog_count / analog_stats.total_items * 100), 2) if analog_stats.total_items and analog_stats.total_items > 0 else 0
            }
        },
        "recent_proposals": recent_proposals_data
    }


