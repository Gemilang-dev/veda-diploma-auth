from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from datetime import datetime, timedelta # [BARU] Untuk mengatur waktu kedaluwarsa token
from jose import jwt # [BARU] Library pembuat token JWT
import models
import schemas
from database import get_db

# Inisialisasi Router
router = APIRouter()

# Inisialisasi sistem Hashing Password menggunakan algoritma Bcrypt
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# ==========================================
# KONFIGURASI JWT (JSON Web Token)
# ==========================================
# Ganti dengan kunci rahasia yang acak dan panjang untuk skripsi Anda nanti
SECRET_KEY = "VEDA_SKRIPSI_RAHASIA_SUPER_KUAT_123!@#" 
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30 # Token hangus dalam 30 menit

# Fungsi pembantu untuk membuat Token JWT
def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# Fungsi pembantu untuk membandingkan password asli vs password acak di database
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

# Fungsi pembantu untuk mengenkripsi password (hashing)
def get_password_hash(password: str):
    return pwd_context.hash(password)

# ==========================================
# ENDPOINT: REGISTER ADMIN 
# ==========================================
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

# ==========================================
# ENDPOINT: LOGIN ADMIN
# ==========================================
@router.post("/login", response_model=schemas.Token)
def login_admin(admin_credentials: schemas.AdminLogin, db: Session = Depends(get_db)):
    # 1. Cari user di database berdasarkan username
    admin = db.query(models.Admin).filter(models.Admin.username == admin_credentials.username).first()
    
    # 2. Jika user tidak ada ATAU password salah
    if not admin or not verify_password(admin_credentials.password, admin.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Username atau password salah!",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # 3. Jika benar, buatkan Token JWT yang berisi ID dan Username
    access_token = create_access_token(
        data={"sub": admin.username, "id_admin": admin.id_admin}
    )
    
    # 4. Kembalikan token ke Frontend
    return {"access_token": access_token, "token_type": "bearer"}