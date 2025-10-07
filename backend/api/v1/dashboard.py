from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from database import get_db
from models import Tender, TenderApplication, User as UserModel, UserRole, TenderStatus, TenderProduct
from auth import get_current_active_user

router = APIRouter()

@router.get("/stats")
async def get_dashboard_stats(
    current_user: UserModel = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Получение статистики для дашборда"""
    
    # Базовая статистика для всех пользователей
    stats = {
        "total_tenders": db.query(func.count(Tender.id)).scalar(),
        "active_tenders": db.query(func.count(Tender.id))
            .filter(Tender.status.in_([TenderStatus.PUBLISHED, TenderStatus.IN_PROGRESS]))
            .scalar(),
        "total_applications": db.query(func.count(TenderApplication.id)).scalar(),
        "total_suppliers": db.query(func.count(UserModel.id))
            .filter(UserModel.role == UserRole.SUPPLIER)
            .scalar(),
        "total_users": db.query(func.count(UserModel.id)).scalar(),
        "total_products": db.query(func.count()).select_from(TenderProduct).scalar(),
        "total_amount": db.query(func.sum(Tender.initial_price)).scalar() or 0
    }
    
    if current_user.role == UserRole.SUPPLIER:
        # Статистика для поставщика
        stats.update({
            "my_applications": db.query(func.count(TenderApplication.id))
                .filter(TenderApplication.supplier_id == current_user.id)
                .scalar(),
            "active_applications": db.query(func.count(TenderApplication.id))
                .join(Tender)
                .filter(
                    TenderApplication.supplier_id == current_user.id,
                    Tender.status.in_([TenderStatus.PUBLISHED, TenderStatus.IN_PROGRESS])
                )
                .scalar(),
            "won_applications": db.query(func.count(TenderApplication.id))
                .filter(
                    TenderApplication.supplier_id == current_user.id,
                    TenderApplication.status == "won"
                )
                .scalar()
        })
    
    elif current_user.role in [UserRole.CONTRACT_MANAGER, UserRole.ADMIN]:
        # Статистика для менеджера контрактов и администратора
        stats.update({
            "draft_tenders": db.query(func.count(Tender.id))
                .filter(Tender.status == TenderStatus.DRAFT)
                .scalar(),
            "completed_tenders": db.query(func.count(Tender.id))
                .filter(Tender.status == TenderStatus.COMPLETED)
                .scalar(),
            "cancelled_tenders": db.query(func.count(Tender.id))
                .filter(Tender.status == TenderStatus.CANCELLED)
                .scalar(),
            "total_applications": db.query(func.count(TenderApplication.id)).scalar(),
            "total_suppliers": db.query(func.count(UserModel.id))
                .filter(UserModel.role == UserRole.SUPPLIER)
                .scalar()
        })
        
        if current_user.role == UserRole.CONTRACT_MANAGER:
            # Дополнительная статистика для менеджера контрактов
            stats.update({
                "my_tenders": db.query(func.count(Tender.id))
                    .filter(Tender.created_by == current_user.id)
                    .scalar(),
                "my_active_tenders": db.query(func.count(Tender.id))
                    .filter(
                        Tender.created_by == current_user.id,
                        Tender.status.in_([TenderStatus.PUBLISHED, TenderStatus.IN_PROGRESS])
                    )
                    .scalar()
            })
    
    return stats

@router.get("/recent-tenders")
async def get_recent_tenders(
    current_user: UserModel = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Получение последних тендеров для дашборда в зависимости от роли пользователя"""
    
    if current_user.role == UserRole.SUPPLIER:
        # Для поставщика - последние тендеры, в которых он участвовал
        recent_applications = (
            db.query(TenderApplication)
            .join(Tender)
            .filter(TenderApplication.supplier_id == current_user.id)
            .order_by(TenderApplication.created_at.desc())
            .limit(10)
            .all()
        )
        
        return {
            "recent_tenders": [
                {
                    "id": app.tender.id,
                    "title": app.tender.title,
                    "status": app.tender.status,
                    "created_at": app.tender.created_at,
                    "my_application_status": app.status,
                    "my_proposed_price": float(app.proposed_price) if app.proposed_price else None
                }
                for app in recent_applications
            ]
        }
    
    elif current_user.role == UserRole.MANAGER:
        # Для менеджера - тендеры, которые он создал
        recent_tenders = (
            db.query(Tender)
            .filter(Tender.created_by == current_user.id)
            .order_by(Tender.created_at.desc())
            .limit(10)
            .all()
        )
        
        return {
            "recent_tenders": [
                {
                    "id": tender.id,
                    "title": tender.title,
                    "status": tender.status,
                    "created_at": tender.created_at,
                    "applications_count": len(tender.applications)
                }
                for tender in recent_tenders
            ]
        }
    
    else:
        # Для админа и контрактного управляющего - все тендеры
        recent_tenders = (
            db.query(Tender)
            .order_by(Tender.created_at.desc())
            .limit(10)
            .all()
        )
        
        return {
            "recent_tenders": [
                {
                    "id": tender.id,
                    "title": tender.title,
                    "status": tender.status,
                    "created_at": tender.created_at,
                    "applications_count": len(tender.applications),
                    "created_by": tender.created_by
                }
                for tender in recent_tenders
            ]
        }