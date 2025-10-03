from typing import Optional, List
from pydantic import BaseModel, EmailStr
from models import UserRole, TenderStatus
from datetime import datetime

class UserBase(BaseModel):
    email: EmailStr
    full_name: str

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    role: UserRole
    is_active: bool

    class Config:
        from_attributes = True

# Alias for compatibility
User = UserResponse
UserUpdate = UserCreate

# Tender schemas
class TenderBase(BaseModel):
    title: str
    description: str
    start_date: datetime
    end_date: datetime
    budget: Optional[float] = None
    currency: str = "RUB"
    status: TenderStatus = TenderStatus.DRAFT

class TenderCreate(TenderBase):
    pass

class TenderUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    budget: Optional[float] = None
    currency: Optional[str] = None
    status: Optional[TenderStatus] = None

class Tender(TenderBase):
    id: int
    created_at: datetime
    updated_at: datetime
    created_by: int

    class Config:
        from_attributes = True

class PaginatedResponse(BaseModel):
    items: List[dict]
    total: int
    page: int
    size: int
    pages: int

# Tender Application schemas
class TenderApplicationBase(BaseModel):
    tender_id: int
    supplier_id: int
    price: float
    currency: str = "RUB"
    description: Optional[str] = None

class TenderApplicationCreate(TenderApplicationBase):
    pass

class TenderApplicationUpdate(BaseModel):
    price: Optional[float] = None
    currency: Optional[str] = None
    description: Optional[str] = None

class TenderApplication(TenderApplicationBase):
    id: int
    created_at: datetime
    updated_at: datetime
    status: str = "pending"

    class Config:
        from_attributes = True