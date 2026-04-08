from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import models               # <-- Tambahkan ini
from database import engine # <-- Tambahkan ini

# Perintah ajaib untuk membuat tabel secara otomatis di MySQL
models.Base.metadata.create_all(bind=engine)

# Inisialisasi Aplikasi FastAPI
app = FastAPI(
    title="VEDA API",
    description="Backend API untuk Sistem Verifikasi Ijazah",
    version="1.0.0"
)

# Konfigurasi CORS (Penting agar Frontend React nanti bisa mengambil data dari sini)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Saat produksi, ini diganti dengan domain frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Endpoint Root (Untuk mengecek apakah server menyala)
@app.get("/")
def read_root():
    return {
        "status": "success", 
        "message": "Selamat datang di VEDA API Backend! Server menyala dengan sempurna."
    }