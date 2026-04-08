from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base

# 1. Alamat koneksi ke database MySQL Anda
# Menggunakan PyMySQL sebagai driver, username 'root', password kosong, dan database 'VedaLocal'
SQLALCHEMY_DATABASE_URL = "mysql+pymysql://root:@localhost:3306/veda"


# 2. Membuat mesin (engine) penghubung ke MySQL
engine = create_engine(SQLALCHEMY_DATABASE_URL)

# 3. Membuat pengatur sesi (SessionMaker)
# autocommit=False agar kita bisa mengontrol kapan data benar-benar disimpan
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 4. Base class yang akan digunakan oleh file models.py sebagai cetakan tabel
Base = declarative_base()

# 5. Fungsi dependency untuk mengambil sesi database saat ada request API
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()