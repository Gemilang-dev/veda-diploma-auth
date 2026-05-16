from sqlalchemy import Column, Integer, String, Enum, ForeignKey
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime
from sqlalchemy import DateTime # Ensure DateTime is imported from sqlalchemy

# 1. Super Admin Table (Entity that registers universities)
class Admin(Base):
    __tablename__ = "tbl_admin"

    id_admin = Column(Integer, primary_key=True, index=True, autoincrement=True)
    username = Column(String(50), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)

# 2. Issuer Table (University entities)
class Issuer(Base):
    __tablename__ = "tbl_issuer"

    id_issuer = Column(Integer, primary_key=True, index=True, autoincrement=True)
    
    # Foreign Key to tbl_admin
    created_by = Column(
        Integer, 
        ForeignKey("tbl_admin.id_admin", ondelete="RESTRICT", onupdate="CASCADE"), 
        nullable=False
    )
    
    university_name = Column(String(150), nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    wallet_address = Column(String(42), nullable=False) # Web3 Ethereum Address (0x...)
    
    # ENUM type for active/inactive status
    status = Column(Enum('Active', 'Inactive', name="issuer_status_enum"), default='Active')

# ==========================================
# 3. DIPLOMA INDEX TABLE (Zero-Data Storage)
# ==========================================
class DiplomaRecord(Base):
    __tablename__ = "tbl_diploma_record"

    id = Column(Integer, primary_key=True, index=True)
    
    # Cryptographic Identity
    diploma_hash = Column(String(100), unique=True, index=True)  # Stores the SHA-256 Hash
    tx_hash = Column(String(100), nullable=True)               # Stores the Blockchain Transaction Hash
    
    # 1. Institution Data
    national_diploma_number = Column(String(50), nullable=True)
    university_name = Column(String(150), nullable=True)
    university_id_code = Column(String(50), nullable=True)
    higher_education_program = Column(String(100), nullable=True)
    study_program_name = Column(String(100), nullable=True)
    study_program_id = Column(String(50), nullable=True)
    
    # 2. Graduate Data
    student_name = Column(String(150), nullable=True)
    place_of_birth = Column(String(100), nullable=True)
    date_of_birth = Column(String(50), nullable=True)
    student_id = Column(String(50), nullable=True) # Student ID (NIM)
    academic_degree = Column(String(100), nullable=True)
    gpa = Column(String(10), nullable=True)
    graduation_date = Column(String(50), nullable=True)
    
    # 3. Issuance Data
    issuance_location = Column(String(100), nullable=True)
    issuance_date = Column(String(50), nullable=True)
    signatory_name = Column(String(150), nullable=True)
    signatory_title = Column(String(100), nullable=True)

    # System Status & Relations
    status = Column(String(20), default="Pending") # Pending, Success, Revoked
    issued_by = Column(Integer, ForeignKey("tbl_issuer.id_issuer"))
    issued_at = Column(DateTime, default=datetime.utcnow)

    # Relationship to Issuer table
    issuer = relationship("Issuer")