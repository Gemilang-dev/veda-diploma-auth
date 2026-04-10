from fastapi import APIRouter, Depends, HTTPException, status, Form # <-- Tambahkan Form di sini
from sqlalchemy.orm import Session
import models
import schemas
from database import get_db
# Impor satpam dan alat pembuat hash dari auth.py
from routes.auth import get_current_admin, get_password_hash, verify_password, create_access_token
router = APIRouter()

# ==========================================
# ENDPOINT: REGISTER KAMPUS (HANYA BISA DIAKSES ADMIN)
# ==========================================
@router.post("/register", response_model=schemas.IssuerResponse, status_code=status.HTTP_201_CREATED)
def register_issuer(
    issuer: schemas.IssuerCreate, 
    db: Session = Depends(get_db),
    # BARIS INI ADALAH GEMBOKNYA! 👇
    current_admin: models.Admin = Depends(get_current_admin) 
):
    # 1. Cek apakah email kampus sudah terdaftar
    existing_issuer = db.query(models.Issuer).filter(models.Issuer.email == issuer.email).first()
    if existing_issuer:
        raise HTTPException(status_code=400, detail="Email kampus sudah terdaftar!")

    # 2. Hash password kampus
    hashed_password = get_password_hash(issuer.password)

    # 3. Siapkan data baru (Perhatikan: created_by diambil otomatis dari satpam token!)
    new_issuer = models.Issuer(
        created_by=current_admin.id_admin, 
        university_name=issuer.university_name,
        email=issuer.email,
        password_hash=hashed_password,
        wallet_address=issuer.wallet_address
    )

    # 4. Simpan ke database
    db.add(new_issuer)
    db.commit()
    db.refresh(new_issuer)
    return new_issuer

# ==========================================
# ENDPOINT: LOGIN KAMPUS (Menerima Form Data dari Swagger UI)
# ==========================================
@router.post("/login", response_model=schemas.Token)
def login_issuer(
    # Swagger UI selalu mengirim variabel bernama 'username', 
    # jadi kita tangkap 'username' tapi kita anggap sebagai email
    username: str = Form(...), 
    password: str = Form(...), 
    db: Session = Depends(get_db)
):
    # 1. Cari data kampus berdasarkan email (menggunakan data dari kolom username Swagger)
    issuer = db.query(models.Issuer).filter(models.Issuer.email == username).first()
    
    # 2. Jika kampus tidak ditemukan atau password salah
    if not issuer or not verify_password(password, issuer.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email atau password salah!"
        )
        
    # 3. Jika berhasil, buatkan Token JWT khusus untuk Kampus
    access_token = create_access_token(
        data={
            "sub": issuer.email, 
            "id_issuer": issuer.id_issuer, 
            "role": "kampus"
        }
    )
    
    return {"access_token": access_token, "token_type": "bearer"}