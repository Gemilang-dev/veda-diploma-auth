import os
import uuid
import hashlib 
import models
import schemas
from fastapi import APIRouter, HTTPException, status, Depends
from sqlalchemy.orm import Session
from database import get_db
from routes.auth import get_current_issuer

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