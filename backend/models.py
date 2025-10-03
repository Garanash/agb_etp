from sqlalchemy import Column, Integer, String, DateTime, Text, Boolean, ForeignKey, Enum, Numeric
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base
import enum


class UserRole(str, enum.Enum):
    ADMIN = "admin"
    CONTRACT_MANAGER = "contract_manager"
    MANAGER = "manager"
    SUPPLIER = "supplier"


class LegalForm(str, enum.Enum):
    IP = "ip"  # ИП
    OOO = "ooo"  # ООО
    OAO = "oao"  # ОАО
    ZAO = "zao"  # ЗАО
    PAO = "pao"  # ПАО
    OTHER = "other"  # Другое


class TenderStatus(str, enum.Enum):
    DRAFT = "draft"
    PUBLISHED = "published"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    phone = Column(String)
    role = Column(Enum(UserRole), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Связи
    supplier_profile = relationship("SupplierProfile", back_populates="user", uselist=False)
    applications = relationship("TenderApplication", back_populates="supplier")


class SupplierProfile(Base):
    __tablename__ = "supplier_profiles"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    legal_form = Column(Enum(LegalForm), nullable=False)
    company_name = Column(String, nullable=False)
    inn = Column(String, unique=True, nullable=False)
    kpp = Column(String)
    ogrn = Column(String)
    legal_address = Column(Text)
    actual_address = Column(Text)
    bank_name = Column(String)
    bank_account = Column(String)
    correspondent_account = Column(String)
    bic = Column(String)
    contact_person = Column(String)
    contact_phone = Column(String)
    contact_email = Column(String)
    is_verified = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Связи
    user = relationship("User", back_populates="supplier_profile")


class Tender(Base):
    __tablename__ = "tenders"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    notice_number = Column(String, unique=True)  # Номер извещения
    initial_price = Column(Numeric(15, 2))
    currency = Column(String, default="RUB")
    status = Column(Enum(TenderStatus), default=TenderStatus.DRAFT)
    publication_date = Column(DateTime(timezone=True))
    deadline = Column(DateTime(timezone=True))
    okpd_code = Column(String)  # Код ОКПД2
    okved_code = Column(String)  # Код ОКВЭД2
    region = Column(String)
    procurement_method = Column(String, default="auction")  # Способ закупки
    created_by = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Связи
    applications = relationship("TenderApplication", back_populates="tender")
    lots = relationship("TenderLot", back_populates="tender")
    documents = relationship("TenderDocument", back_populates="tender")
    organizers = relationship("TenderOrganizer", back_populates="tender")


class TenderLot(Base):
    __tablename__ = "tender_lots"
    
    id = Column(Integer, primary_key=True, index=True)
    tender_id = Column(Integer, ForeignKey("tenders.id"))
    lot_number = Column(Integer, nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text)
    initial_price = Column(Numeric(15, 2))
    currency = Column(String, default="RUB")
    security_amount = Column(Numeric(15, 2))  # Размер обеспечения заявки
    delivery_place = Column(Text)  # Место поставки
    payment_terms = Column(Text)  # Условия оплаты
    quantity = Column(String)  # Количество
    unit_of_measure = Column(String)  # Единица измерения
    okpd_code = Column(String)  # Код ОКПД2 для лота
    okved_code = Column(String)  # Код ОКВЭД2 для лота
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Связи
    tender = relationship("Tender", back_populates="lots")
    products = relationship("TenderProduct", back_populates="lot")


class TenderProduct(Base):
    __tablename__ = "tender_products"
    
    id = Column(Integer, primary_key=True, index=True)
    lot_id = Column(Integer, ForeignKey("tender_lots.id"))
    position_number = Column(Integer)  # Номер позиции
    name = Column(String, nullable=False)  # Наименование товара
    quantity = Column(String)  # Количество
    unit_of_measure = Column(String)  # Единица измерения
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Связи
    lot = relationship("TenderLot", back_populates="products")


class TenderDocument(Base):
    __tablename__ = "tender_documents"
    
    id = Column(Integer, primary_key=True, index=True)
    tender_id = Column(Integer, ForeignKey("tenders.id"))
    title = Column(String, nullable=False)
    file_path = Column(String, nullable=False)
    file_size = Column(Integer)
    file_type = Column(String)
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Связи
    tender = relationship("Tender", back_populates="documents")


class TenderOrganizer(Base):
    __tablename__ = "tender_organizers"
    
    id = Column(Integer, primary_key=True, index=True)
    tender_id = Column(Integer, ForeignKey("tenders.id"))
    organization_name = Column(String, nullable=False)
    legal_address = Column(Text)
    postal_address = Column(Text)
    email = Column(String)
    phone = Column(String)
    contact_person = Column(String)
    inn = Column(String)
    kpp = Column(String)
    ogrn = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Связи
    tender = relationship("Tender", back_populates="organizers")


class TenderProcedureStage(Base):
    __tablename__ = "tender_procedure_stages"
    
    id = Column(Integer, primary_key=True, index=True)
    tender_id = Column(Integer, ForeignKey("tenders.id"))
    stage_name = Column(String, nullable=False)  # Название этапа
    stage_date = Column(DateTime(timezone=True))  # Дата этапа
    stage_description = Column(Text)  # Описание этапа
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Связи
    tender = relationship("Tender")


class TenderApplication(Base):
    __tablename__ = "tender_applications"
    
    id = Column(Integer, primary_key=True, index=True)
    tender_id = Column(Integer, ForeignKey("tenders.id"))
    supplier_id = Column(Integer, ForeignKey("users.id"))
    proposed_price = Column(Numeric(15, 2))
    comment = Column(Text)
    status = Column(String, default="submitted")  # submitted, accepted, rejected
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Связи
    tender = relationship("Tender", back_populates="applications")
    supplier = relationship("User", back_populates="applications")
