from fastapi import APIRouter, Depends, HTTPException, status, Form
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from datetime import datetime, timedelta # [BARU] Untuk mengatur waktu kedaluwarsa token
from jose import jwt # [BARU] Library pembuat token JWT
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError

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


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


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

# FUNGSI SATPAM: Mengecek dan membongkar isi Token JWT dari Frontend
def get_current_admin(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Token tidak valid atau sudah kedaluwarsa",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        # Membongkar koper token dengan Kunci Rahasia
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    # Memastikan orangnya benar-benar ada di database
    admin = db.query(models.Admin).filter(models.Admin.username == username).first()
    if admin is None:
        raise credentials_exception
    
    return admin

# ==========================================
# ENDPOINT 1: REGISTER ADMIN 
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
def login_admin(
    username: str = Form(...), 
    password: str = Form(...), 
    db: Session = Depends(get_db)
):
    # Cari di database
    admin = db.query(models.Admin).filter(models.Admin.username == username).first()
    
    # Cek kecocokan password
    if not admin or not verify_password(password, admin.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Username atau password salah!",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Buat dan kembalikan token
    access_token = create_access_token(
        data={"sub": admin.username, "id_admin": admin.id_admin}
    )
    
    return {"access_token": access_token, "token_type": "bearer"}