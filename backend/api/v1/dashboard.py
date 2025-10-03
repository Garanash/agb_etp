from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from database import get_db
from models import Tender, TenderApplication, User as UserModel, UserRole, TenderStatus
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
        "published_tenders": db.query(func.count(Tender.id))
            .filter(Tender.status == TenderStatus.PUBLISHED)
            .scalar(),
        "in_progress_tenders": db.query(func.count(Tender.id))
            .filter(Tender.status == TenderStatus.IN_PROGRESS)
            .scalar()
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

@router.get("/recent-activity")
async def get_recent_activity(
    current_user: UserModel = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Получение последних действий для дашборда"""
    
    if current_user.role == UserRole.SUPPLIER:
        # Последние тендеры, в которых участвовал поставщик
        recent_applications = (
            db.query(TenderApplication)
            .join(Tender)
            .filter(TenderApplication.supplier_id == current_user.id)
            .order_by(TenderApplication.created_at.desc())
            .limit(5)
            .all()
        )
        
        return {
            "recent_applications": [
                {
                    "id": app.id,
                    "tender_id": app.tender_id,
                    "tender_title": app.tender.title,
                    "status": app.status,
                    "created_at": app.created_at
                }
                for app in recent_applications
            ]
        }
    
    else:
        # Последние тендеры для менеджера/админа
        recent_tenders = (
            db.query(Tender)
            .order_by(Tender.created_at.desc())
            .limit(5)
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