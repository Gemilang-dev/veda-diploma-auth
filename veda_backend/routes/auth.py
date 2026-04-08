from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from passlib.context import CryptContext
import models
import schemas
from database import get_db

# Inisialisasi Router
router = APIRouter()

# Inisialisasi sistem Hashing Password menggunakan algoritma Bcrypt
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Fungsi pembantu untuk mengenkripsi password (hashing)
def get_password_hash(password: str):
    return pwd_context.hash(password)

# ENDPOINT: Register Super Admin Pertama
@router.post("/register_admin", response_model=schemas.AdminResponse, status_code=status.HTTP_201_CREATED)
def register_admin(admin: schemas.AdminCreate, db: Session = Depends(get_db)):
    # 1. Cek apakah username sudah dipakai
    existing_admin = db.query(models.Admin).filter(models.Admin.username == admin.username).first()
    if existing_admin:
        raise HTTPException(status_code=400, detail="Username sudah terdaftar!")

    # 2. Enkripsi (Hash) password dari Frontend
    hashed_password = get_password_hash(admin.password)

    # 3. Siapkan data untuk dimasukkan ke database
    new_admin = models.Admin(
        username=admin.username,
        password_hash=hashed_password
    )

    # 4. Simpan ke database MySQL
    db.add(new_admin)
    db.commit()
    db.refresh(new_admin)

    return new_admin