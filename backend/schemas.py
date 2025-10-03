from typing import Optional, List
from pydantic import BaseModel, EmailStr
from models import UserRole, TenderStatus
from datetime import datetime
from decimal import Decimal

# User schemas
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

# Tender Product schemas
class TenderProductBase(BaseModel):
    position_number: Optional[int] = None
    name: str
    quantity: Optional[str] = None
    unit_of_measure: Optional[str] = None

class TenderProductCreate(TenderProductBase):
    pass

class TenderProduct(TenderProductBase):
    id: int
    lot_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

# Tender Lot schemas
class TenderLotBase(BaseModel):
    lot_number: int
    title: str
    description: Optional[str] = None
    initial_price: Optional[Decimal] = None
    currency: str = "RUB"
    security_amount: Optional[Decimal] = None
    delivery_place: Optional[str] = None
    payment_terms: Optional[str] = None
    quantity: Optional[str] = None
    unit_of_measure: Optional[str] = None
    okpd_code: Optional[str] = None
    okved_code: Optional[str] = None

class TenderLotCreate(TenderLotBase):
    products: Optional[List[TenderProductCreate]] = []

class TenderLot(TenderLotBase):
    id: int
    tender_id: int
    created_at: datetime
    products: List[TenderProduct] = []
    
    class Config:
        from_attributes = True

# Tender Document schemas
class TenderDocumentBase(BaseModel):
    title: str
    file_path: str
    file_size: Optional[int] = None
    file_type: Optional[str] = None

class TenderDocumentCreate(TenderDocumentBase):
    pass

class TenderDocument(TenderDocumentBase):
    id: int
    tender_id: int
    uploaded_at: datetime
    
    class Config:
        from_attributes = True

# Tender Organizer schemas
class TenderOrganizerBase(BaseModel):
    organization_name: str
    legal_address: Optional[str] = None
    postal_address: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    contact_person: Optional[str] = None
    inn: Optional[str] = None
    kpp: Optional[str] = None
    ogrn: Optional[str] = None

class TenderOrganizerCreate(TenderOrganizerBase):
    pass

class TenderOrganizer(TenderOrganizerBase):
    id: int
    tender_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

# Tender schemas
class TenderBase(BaseModel):
    title: str
    description: str
    initial_price: Optional[Decimal] = None
    currency: str = "RUB"
    deadline: Optional[datetime] = None
    okpd_code: Optional[str] = None
    okved_code: Optional[str] = None
    region: Optional[str] = None
    procurement_method: str = "auction"

class TenderCreate(TenderBase):
    lots: List[TenderLotCreate] = []
    documents: List[TenderDocumentCreate] = []
    organizers: List[TenderOrganizerCreate] = []

class TenderUpdate(TenderBase):
    title: Optional[str] = None
    description: Optional[str] = None
    initial_price: Optional[Decimal] = None
    deadline: Optional[datetime] = None
    lots: Optional[List[TenderLotCreate]] = []
    documents: Optional[List[TenderDocumentCreate]] = []
    organizers: Optional[List[TenderOrganizerCreate]] = []

class Tender(TenderBase):
    id: int
    status: TenderStatus
    publication_date: Optional[datetime] = None
    created_by: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    lots: List[TenderLot] = []
    documents: List[TenderDocument] = []
    organizers: List[TenderOrganizer] = []

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
    tender_id: Optional[int] = None
    lot_id: Optional[int] = None
    proposed_price: Decimal
    comment: Optional[str] = None

class TenderApplicationCreate(TenderApplicationBase):
    lot_id: int

class TenderApplicationUpdate(BaseModel):
    proposed_price: Optional[Decimal] = None
    comment: Optional[str] = None

class TenderApplication(TenderApplicationBase):
    id: int
    supplier_id: int
    status: str
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True