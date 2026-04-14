from sqlalchemy import Column, Integer, String, Enum, ForeignKey
from database import Base
import datetime # Pastikan ini ada di bagian atas file jika belum ada
from sqlalchemy import DateTime # Pastikan DateTime juga diimpor dari sqlalchemy

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

# ==========================================
# 3. TABEL INDEKS IJAZAH (Zero-Data Storage)
# ==========================================
class DiplomaRecord(Base):
    __tablename__ = "tbl_diploma_record"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    
    # KOREKSI 1: String(66)
    # Hash ijazah (SHA-256) ditambah awalan '0x' memiliki panjang persis 66 karakter.
    # Jika menggunakan String(50), database akan menolak (Data too long for column).
    diploma_id = Column(String(66), unique=True, index=True, nullable=False) 
    
    student_id = Column(String(50), nullable=False)
    
    # KOREKSI 2: nullable=True
    # Saat Backend baru membuat Hash (status Pending), transaksi ke Blockchain belum terjadi.
    # Jadi tx_hash ini harus boleh kosong (NULL) pada awalnya, dan baru diisi 
    # setelah MetaMask berhasil mengirim transaksi.
    tx_hash = Column(String(100), nullable=True, unique=True) 
    
    # Relasi ke tabel kampus
    issued_by = Column(
        Integer, 
        ForeignKey("tbl_issuer.id_issuer", ondelete="RESTRICT", onupdate="CASCADE"),
        nullable=False
    )
    issued_at = Column(DateTime, default=datetime.datetime.utcnow)

    # TAMBAHAN: Status untuk melacak proses mempool Blockchain
    status = Column(Enum('Pending', 'Success', 'Failed', name="diploma_status_enum"), default='Pending')

    # (Opsional tapi disarankan) Relasi balik ke Issuer agar query lebih mudah
    # issuer = relationship("Issuer", back_populates="diploma_records")