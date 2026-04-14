
import os
import hashlib 
import models
import schemas
from fastapi import APIRouter, HTTPException, status, Depends
from sqlalchemy.orm import Session
from database import get_db

router = APIRouter()

# ==========================================
# 1. TAHAP PERSIAPAN (PREPARE)
# ==========================================
@router.post("/prepare", status_code=status.HTTP_201_CREATED)
async def prepare_diploma(
    payload: schemas.DiplomaPrepareRequest, 
    db: Session = Depends(get_db)
):
    print("\n" + "="*50)
    print("🚀 [DEBUG 1] MEMULAI PROSES PREPARE Ijazah")
    print(f"📦 [DEBUG 1] Payload diterima: {payload.dict()}")
    
    try:
        # Ambil Data Kampus & Wallet Address
        print(f"🔍 [DEBUG 2] Mencari Issuer dengan ID: {payload.id_issuer}")
        issuer = db.query(models.Issuer).filter(models.Issuer.id_issuer == payload.id_issuer).first()
        
        if not issuer:
            raise HTTPException(status_code=404, detail="Kampus tidak terdaftar di sistem.")
        if issuer.status != 'Active':
            raise HTTPException(status_code=400, detail="Akun Kampus sedang tidak aktif.")
            
        print(f"✅ [DEBUG 2] SUKSES: Kampus ditemukan -> {issuer.university_name} (Wallet: {issuer.wallet_address})")

        # Hash Terjadi 
        print("⚙️ [DEBUG 3] Memulai proses Hashing data...")
        data_to_hash = f"{payload.diploma_number}-{payload.student_name}-{payload.gpa}-{issuer.university_name}-{payload.degree}"
        diploma_hash = "0x" + hashlib.sha256(data_to_hash.encode()).hexdigest()
        print(f"✅ [DEBUG 3] SUKSES: Hash terbentuk -> {diploma_hash}")

        # Pengecekan Duplikasi
        print("🔍 [DEBUG 4] Mengecek duplikasi hash di database...")
        existing_record = db.query(models.DiplomaRecord).filter(
            models.DiplomaRecord.diploma_id == diploma_hash
        ).first()
        
        if existing_record:
            if existing_record.status == 'Pending':
                raise HTTPException(status_code=400, detail="Ijazah ini sedang dalam antrean (Pending).")
            else:
                raise HTTPException(status_code=400, detail="Ijazah ini sudah selesai diterbitkan (Success).")
                
        # Masukkan ke Antrean MySQL (Pending)
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
        raise http_exc
    except Exception as e:
        print("\n🚨 [FATAL ERROR] TERJADI KESALAHAN INTERNAL!")
        print(f"🚨 Tipe Error: {type(e).__name__}")
        print(f"🚨 Detail Pesan Error: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


# ==========================================
# 2. TAHAP KONFIRMASI (CONFIRM TRANSACTION)
# ==========================================
@router.patch("/confirm/{record_id}")
async def confirm_diploma_transaction(
    record_id: int, 
    tx_hash: str, 
    db: Session = Depends(get_db)
):
    """
    Fungsi ini dipanggil oleh Frontend (React) setelah MetaMask sukses mengirim data.
    Tugasnya: Mengubah status 'Pending' menjadi 'Success' dan menyimpan Transaction Hash.
    """
    print(f"\n📥 [DEBUG] Menerima request konfirmasi untuk Record ID: {record_id}")
    print(f"🔗 [DEBUG] Transaction Hash dari Blockchain: {tx_hash}")

    try:
        # Cari data ijazah yang sedang 'Pending' berdasarkan ID
        record = db.query(models.DiplomaRecord).filter(models.DiplomaRecord.id == record_id).first()
        
        if not record:
            print("❌ [DEBUG] GAGAL: Data antrean tidak ditemukan di MySQL!")
            raise HTTPException(status_code=404, detail="Data antrean ijazah tidak ditemukan")

        # Perbarui data: Masukkan Tx Hash dan ubah status jadi Success
        record.tx_hash = tx_hash
        record.status = 'Success'
        
        db.commit()
        db.refresh(record)
        
        print(f"✅ [DEBUG] SUKSES: Status Ijazah '{record.diploma_id}' diubah menjadi SUCCESS!")
        
        return {
            "status": "success", 
            "message": "Ijazah berhasil diterbitkan dan divalidasi di Database dan Blockchain!",
            "data": {
                "record_id": record.id,
                "tx_hash": record.tx_hash,
                "status": record.status
            }
        }
        
    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        db.rollback()
        print(f"🚨 [ERROR] Gagal melakukan konfirmasi: {str(e)}")
        raise HTTPException(status_code=500, detail="Gagal menyimpan konfirmasi transaksi")