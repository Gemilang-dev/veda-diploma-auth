from pydantic import BaseModel
from datetime import datetime
from fastapi import Body

# Schema untuk Frontend saat mengirim data pendaftaran Super Admin
class AdminCreate(BaseModel):
    username: str
    password: str

#Schema khusus untuk Login
class AdminLogin(BaseModel):
    username: str
    password: str


# Schema untuk respon sukses pendaftaran (agar password tidak ikut terkirim balik)
class AdminResponse(BaseModel):
    id_admin: int
    username: str

    class Config:
        from_attributes = True

# Schema untuk token JWT (Nanti digunakan untuk Login)
class Token(BaseModel):
    access_token: str
    token_type: str

# ==========================================
# SCHEMAS UNTUK ISSUER (KAMPUS)
# ==========================================
class IssuerCreate(BaseModel):
    university_name: str
    email: str
    password: str
    wallet_address: str

class IssuerLogin(BaseModel):
    email: str
    password: str

class IssuerResponse(BaseModel):
    id_issuer: int
    created_by: int
    university_name: str
    email: str
    wallet_address: str
    status: str

    class Config:
        from_attributes = True


# ==========================================
# SCHEMAS UNTUK DIPLOMA (IJAZAH)
# ==========================================
class DiplomaCreate(BaseModel):
    diploma_id: str   # [BARU] Nomor Ijazah resmi dari pihak kampus
    student_id: str
    student_name: str 
    univ_name: str
    gpa: float

class DiplomaPrepareRequest(BaseModel):
    diploma_number: str      # Nomor Ijazah (PIN)
    student_name: str        # Nama Mahasiswa
    student_id: str          # NIM
    gpa: str                 # IPK
    degree: str              # Gelar
    id_issuer: int           # ID Kampus

# Data yang dikembalikan oleh peladen setelah berhasil dicetak
class DiplomaResponse(BaseModel):
    id: int
    diploma_id: str
    student_id: str
    tx_hash: str
    issued_by: int
    issued_at: datetime

    class Config:
        from_attributes = True