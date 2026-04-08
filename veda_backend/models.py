from sqlalchemy import Column, Integer, String, Enum, ForeignKey
from database import Base

# 1. Tabel Super Admin (Pihak yang mendaftarkan kampus)
class Admin(Base):
    __tablename__ = "tbl_admin"

    id_admin = Column(Integer, primary_key=True, index=True, autoincrement=True)
    username = Column(String(50), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)

# 2. Tabel Issuer (Pihak Kampus)
class Issuer(Base):
    __tablename__ = "tbl_issuer"

    id_issuer = Column(Integer, primary_key=True, index=True, autoincrement=True)
    
    # Foreign Key ke tbl_admin (Sesuai constraint Anda: RESTRICT dan CASCADE)
    created_by = Column(
        Integer, 
        ForeignKey("tbl_admin.id_admin", ondelete="RESTRICT", onupdate="CASCADE"), 
        nullable=False
    )
    
    university_name = Column(String(150), nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    wallet_address = Column(String(42), nullable=False) # Alamat Web3 Ethereum (0x...)
    
    # Tipe ENUM untuk status aktif/inaktif
    status = Column(Enum('Active', 'Inactive', name="issuer_status_enum"), default='Active')