from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from typing import List, Optional
from database import get_db
from models import User as UserModel, UserRole, SupplierProfile
from schemas import User as UserSchema, UserCreate, UserUpdate
from auth import get_current_active_user, require_role, get_password_hash
from datetime import datetime
import secrets
import string

router = APIRouter()


def generate_password(length: int = 12) -> str:
    """Генерация случайного пароля"""
    alphabet = string.ascii_letters + string.digits + "!@#$%^&*"
    password = ''.join(secrets.choice(alphabet) for _ in range(length))
    return password


@router.get("/", response_model=List[UserSchema])
async def get_users(
    role: Optional[UserRole] = Query(None, description="Фильтр по роли"),
    search: Optional[str] = Query(None, description="Поиск по имени или email"),
    page: int = Query(1, ge=1, description="Номер страницы"),
    size: int = Query(20, ge=1, le=100, description="Размер страницы"),
    current_user: UserModel = Depends(require_role(UserRole.ADMIN)),
    db: Session = Depends(get_db)
):
    """Получение списка пользователей (только для администраторов)"""
    query = db.query(UserModel)
    
    if role:
        query = query.filter(UserModel.role == role)
    
    if search:
        query = query.filter(
            or_(
                UserModel.full_name.ilike(f"%{search}%"),
                UserModel.email.ilike(f"%{search}%")
            )
        )
    
    users = query.offset((page - 1) * size).limit(size).all()
    return users


@router.get("/{user_id}", response_model=UserSchema)
async def get_user(
    user_id: int,
    current_user: UserModel = Depends(require_role(UserRole.ADMIN)),
    db: Session = Depends(get_db)
):
    """Получение информации о пользователе (только для администраторов)"""
    user = db.query(UserModel).filter(UserModel.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")
    return user


@router.post("/", response_model=UserSchema)
async def create_user(
    user_data: UserCreate,
    current_user: UserModel = Depends(require_role(UserRole.ADMIN)),
    db: Session = Depends(get_db)
):
    """Создание нового пользователя (только для администраторов)"""
    # Проверяем, что пользователь с таким email не существует
    existing_user = db.query(UserModel).filter(UserModel.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Пользователь с таким email уже существует"
        )
    
    # Генерируем случайный пароль
    password = generate_password()
    hashed_password = get_password_hash(password)
    
    db_user = UserModel(
        email=user_data.email,
        hashed_password=hashed_password,
        full_name=user_data.full_name,
        phone=user_data.phone,
        role=user_data.role
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    # Возвращаем пользователя с сгенерированным паролем для передачи администратору
    user_dict = db_user.__dict__.copy()
    user_dict['generated_password'] = password
    return user_dict


@router.put("/{user_id}", response_model=UserSchema)
async def update_user(
    user_id: int,
    user_update: UserUpdate,
    current_user: UserModel = Depends(require_role(UserRole.ADMIN)),
    db: Session = Depends(get_db)
):
    """Обновление информации о пользователе (только для администраторов)"""
    user = db.query(UserModel).filter(UserModel.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")
    
    for field, value in user_update.dict(exclude_unset=True).items():
        setattr(user, field, value)
    
    user.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(user)
    return user


@router.post("/{user_id}/reset-password")
async def reset_user_password(
    user_id: int,
    current_user: UserModel = Depends(require_role(UserRole.ADMIN)),
    db: Session = Depends(get_db)
):
    """Сброс пароля пользователя (только для администраторов)"""
    user = db.query(UserModel).filter(UserModel.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")
    
    # Генерируем новый пароль
    new_password = generate_password()
    hashed_password = get_password_hash(new_password)
    
    user.hashed_password = hashed_password
    user.updated_at = datetime.utcnow()
    db.commit()
    
    return {
        "message": "Пароль успешно сброшен",
        "new_password": new_password,
        "user_email": user.email
    }


@router.delete("/{user_id}", status_code=204)
async def delete_user(
    user_id: int,
    current_user: UserModel = Depends(require_role(UserRole.ADMIN)),
    db: Session = Depends(get_db)
):
    """Удаление пользователя (только для администраторов)"""
    user = db.query(UserModel).filter(UserModel.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")
    
    # Нельзя удалить самого себя
    if user.id == current_user.id:
        raise HTTPException(
            status_code=400, 
            detail="Нельзя удалить собственный аккаунт"
        )
    
    db.delete(user)
    db.commit()
    return {"message": "Пользователь успешно удален"}


@router.get("/{user_id}/supplier-profile")
async def get_user_supplier_profile(
    user_id: int,
    current_user: UserModel = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Получение профиля поставщика пользователя"""
    user = db.query(UserModel).filter(UserModel.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")
    
    # Пользователь может видеть только свой профиль, админ - любой
    if current_user.role != UserRole.ADMIN and current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Недостаточно прав доступа")
    
    if user.role != UserRole.SUPPLIER:
        raise HTTPException(status_code=400, detail="Пользователь не является поставщиком")
    
    supplier_profile = db.query(SupplierProfile).filter(
        SupplierProfile.user_id == user_id
    ).first()
    
    if not supplier_profile:
        raise HTTPException(status_code=404, detail="Профиль поставщика не найден")
    
    return supplier_profile


@router.put("/{user_id}/supplier-profile")
async def update_user_supplier_profile(
    user_id: int,
    profile_data: dict,
    current_user: UserModel = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Обновление профиля поставщика пользователя"""
    user = db.query(UserModel).filter(UserModel.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")
    
    # Пользователь может обновлять только свой профиль, админ - любой
    if current_user.role != UserRole.ADMIN and current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Недостаточно прав доступа")
    
    if user.role != UserRole.SUPPLIER:
        raise HTTPException(status_code=400, detail="Пользователь не является поставщиком")
    
    supplier_profile = db.query(SupplierProfile).filter(
        SupplierProfile.user_id == user_id
    ).first()
    
    if not supplier_profile:
        raise HTTPException(status_code=404, detail="Профиль поставщика не найден")
    
    # Обновляем поля профиля
    for field, value in profile_data.items():
        if hasattr(supplier_profile, field):
            setattr(supplier_profile, field, value)
    
    supplier_profile.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(supplier_profile)
    
    return supplier_profile
