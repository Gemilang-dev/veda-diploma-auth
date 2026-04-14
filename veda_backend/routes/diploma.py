import os
import uuid
import hashlib 
import models
import schemas
from fastapi import APIRouter, HTTPException, status, Depends
from sqlalchemy.orm import Session
from database import get_db
from routes.auth import get_current_issuer
from schemas import DiplomaPrepareRequest

router = APIRouter()

@router.post("/issue", response_model=schemas.DiplomaResponse, status_code=status.HTTP_201_CREATED)
def issue_diploma(
    diploma_data: schemas.DiplomaCreate, 
    db: Session = Depends(get_db),
    current_issuer: models.Issuer = Depends(get_current_issuer)
):
    # 1. [LOGIKA RAYI] Menggabungkan data menjadi 1 string menggunakan data asli dari Kampus
    data_to_hash = f"{diploma_data.diploma_id}|{diploma_data.student_id}|{diploma_data.student_name}|{diploma_data.univ_name}|{diploma_data.gpa}"

    # 2. Mengubah string gabungan menjadi Hash (Sidik Jari 64 Karakter)
    document_hash = hashlib.sha256(data_to_hash.encode()).hexdigest()

    # 3. Generate TxHash Blockchain PALSU (Sementara, ini yang nanti diganti Web3)
    fake_tx_hash = f"0x{uuid.uuid4().hex}{uuid.uuid4().hex}"

    # 4. Simpan ke database (Sekarang diploma_id mengambil dari input Frontend)
    new_record = models.DiplomaRecord(
        diploma_id=diploma_data.diploma_id, # <-- Mengambil dari input!
        student_id=diploma_data.student_id,
        tx_hash=fake_tx_hash,
        issued_by=current_issuer.id_issuer
    )

    db.add(new_record)
    db.commit()
    db.refresh(new_record)

    # Print sebagai bukti di terminal VS Code
    print(f"\n--- LOG PENERBITAN IJAZAH ---")
    print(f"Data Gabungan: {data_to_hash}")
    print(f"Hash ke Blockchain: 0x{document_hash}")
    print(f"-----------------------------\n")

    return new_record

@router.post("/prepare-hash")
async def prepare_diploma_hash(
    student_id: str, 
    id_issuer: int, # Menggunakan id_issuer dari database Anda
    program_study: str,
    db: Session = Depends(get_db)
):
    """
    Step 1: Mengambil wallet_address kampus dari DB dan membuat Hash ijazah.
    """
    # 1. Cari data Issuer di database SQL
    issuer = db.query(models.Issuer).filter(models.Issuer.id_issuer == id_issuer).first()
    
    if not issuer:
        raise HTTPException(status_code=404, detail="Issuer (University) not found in database")

    if issuer.status != 'Active':
        raise HTTPException(status_code=400, detail="This university account is inactive")

    try:
        # 2. Ambil university_name atau university_id dari data issuer
        # Kita gunakan issuer.university_name sebagai bagian dari identitas unik
        data_to_hash = f"{student_id}-{issuer.university_name}-{program_study}"
        diploma_hash = "0x" + hashlib.sha256(data_to_hash.encode()).hexdigest()

        # 3. Kembalikan data ke Frontend
        # Frontend akan menggunakan 'issuer_wallet' untuk memastikan MetaMask akun yang benar
        return {
            "status": "success",
            "data": {
                "diploma_hash": diploma_hash,
                "issuer_name": issuer.university_name,
                "issuer_wallet": issuer.wallet_address,
                "student_id": student_id
            },
            "instruction": "Please sign this hash using MetaMask with the wallet address shown above."
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Hashing error: {str(e)}")
    
    
@router.post("/prepare", status_code=status.HTTP_201_CREATED)
async def prepare_diploma(
    payload: DiplomaPrepareRequest, 
    db: Session = Depends(get_db)
):
    print("\n" + "="*50)
    print("🚀 [DEBUG 1] MEMULAI PROSES PREPARE Ijazah")
    print(f"📦 [DEBUG 1] Payload diterima: {payload.dict()}")
    
    try:
        # ==========================================
        # FLOW 1 & 5: Ambil Data Kampus & Wallet Address
        # ==========================================
        print(f"🔍 [DEBUG 2] Mencari Issuer dengan ID: {payload.id_issuer}")
        issuer = db.query(models.Issuer).filter(models.Issuer.id_issuer == payload.id_issuer).first()
        
        if not issuer:
            print("❌ [DEBUG 2] GAGAL: Kampus tidak terdaftar.")
            raise HTTPException(status_code=404, detail="Kampus tidak terdaftar di sistem.")
        if issuer.status != 'Active':
            print("❌ [DEBUG 2] GAGAL: Akun Kampus tidak aktif.")
            raise HTTPException(status_code=400, detail="Akun Kampus sedang tidak aktif.")
            
        print(f"✅ [DEBUG 2] SUKSES: Kampus ditemukan -> {issuer.university_name} (Wallet: {issuer.wallet_address})")

        # ==========================================
        # FLOW 3: Hash Terjadi 
        # ==========================================
        print("⚙️ [DEBUG 3] Memulai proses Hashing data...")
        data_to_hash = f"{payload.diploma_number}-{payload.student_name}-{payload.gpa}-{issuer.university_name}-{payload.degree}"
        diploma_hash = "0x" + hashlib.sha256(data_to_hash.encode()).hexdigest()
        print(f"✅ [DEBUG 3] SUKSES: Hash terbentuk -> {diploma_hash}")

        # ==========================================
        # FLOW 2: Pengecekan Duplikasi di MySQL
        # ==========================================
        print("🔍 [DEBUG 4] Mengecek duplikasi hash di database...")
        existing_record = db.query(models.DiplomaRecord).filter(
            models.DiplomaRecord.diploma_id == diploma_hash
        ).first()
        
        if existing_record:
            print(f"❌ [DEBUG 4] GAGAL: Hash sudah ada dengan status: {existing_record.status}")
            if existing_record.status == 'Pending':
                raise HTTPException(status_code=400, detail="Ijazah ini sedang dalam antrean (Pending).")
            else:
                raise HTTPException(status_code=400, detail="Ijazah ini sudah selesai diterbitkan (Success).")
                
        print("✅ [DEBUG 4] SUKSES: Hash aman, belum ada duplikasi.")

        # ==========================================
        # FLOW 4: Masukkan ke Antrean MySQL (Pending)
        # ==========================================
        print("💾 [DEBUG 5] Menyimpan data baru ke tabel tbl_diploma_record...")
        new_record = models.DiplomaRecord(
            diploma_id=diploma_hash,
            student_id=payload.student_id,
            issued_by=payload.id_issuer,
            status='Pending'
        )
        db.add(new_record)
        db.commit()
        db.refresh(new_record)
        print(f"✅ [DEBUG 5] SUKSES: Data tersimpan dengan ID Rekam: {new_record.id}")

        # ==========================================
        # FLOW 6: Pengiriman Parameter ke Frontend
        # ==========================================
        print("✅ [DEBUG 6] PROSES SELESAI. Mengembalikan respons ke Frontend.")
        print("="*50 + "\n")
        
        return {
            "status": "success",
            "message": "Data ijazah masuk antrean. Siap diproses oleh Blockchain.",
            "blockchain_payload": {
                "diploma_hash": new_record.diploma_id,
                "wallet_address": issuer.wallet_address, 
                "univ_id": payload.id_issuer,
                "student_id": payload.student_id
            },
            "database_info": {
                "record_id": new_record.id,
                "status": new_record.status
            }
        }

    except HTTPException as http_exc:
        # Jika error dari validasi kita sendiri (400, 404), biarkan lewat
        raise http_exc
    except Exception as e:
        # INI YANG PALING PENTING! Menangkap error internal SQL/Python
        print("\n🚨 [FATAL ERROR] TERJADI KESALAHAN INTERNAL!")
        print(f"🚨 Tipe Error: {type(e).__name__}")
        print(f"🚨 Detail Pesan Error: {str(e)}")
        print("="*50 + "\n")
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")