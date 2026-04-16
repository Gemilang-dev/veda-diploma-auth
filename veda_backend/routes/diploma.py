import os
import hashlib 
import models
import schemas
from fastapi import APIRouter, HTTPException, status, Depends
from sqlalchemy.orm import Session
from database import get_db

router = APIRouter()

# ==========================================
# 1. PREPARATION PHASE (OFF-CHAIN HASHING)
# ==========================================
@router.post("/prepare", status_code=status.HTTP_201_CREATED)
async def prepare_diploma(
    payload: schemas.DiplomaPrepareRequest, 
    db: Session = Depends(get_db)
):
    print("\n" + "="*50)
    print("🚀 [DEBUG 1] INITIATING DIPLOMA PREPARATION PROCESS")
    print(f"📦 [DEBUG 1] Received Payload: {payload.dict()}")
    
    try:
        # Step 1: Validate Issuer & Fetch Wallet Address
        print(f"🔍 [DEBUG 2] Querying Issuer ID: {payload.id_issuer}")
        issuer = db.query(models.Issuer).filter(models.Issuer.id_issuer == payload.id_issuer).first()
        
        if not issuer:
            raise HTTPException(status_code=404, detail="University/Issuer is not registered in the system.")
        if issuer.status != 'Active':
            raise HTTPException(status_code=400, detail="University/Issuer account is currently inactive.")
            
        print(f"✅ [DEBUG 2] SUCCESS: Issuer verified -> {issuer.university_name} (Wallet: {issuer.wallet_address})")

        # Step 2: National Standard Data Aggregation & Cryptographic Hashing
        print("⚙️ [DEBUG 3] Executing SHA-256 Hashing on National Standard Data...")
        data_to_hash = (
            f"{payload.national_diploma_number}|{payload.university_name}|{payload.university_id_code}|"
            f"{payload.higher_education_program}|{payload.study_program_name}|{payload.study_program_id}|"
            f"{payload.student_name}|{payload.place_of_birth}|{payload.date_of_birth}|{payload.student_id}|"
            f"{payload.academic_degree}|{payload.gpa}|{payload.graduation_date}|"
            f"{payload.issuance_location}|{payload.issuance_date}|{payload.signatory_name}|{payload.signatory_title}"
        )

        diploma_hash = "0x" + hashlib.sha256(data_to_hash.encode()).hexdigest()
        print(f"✅ [DEBUG 3] SUCCESS: Cryptographic Fingerprint generated -> {diploma_hash}")

# Step 3: Blockchain Hash Duplication Check
        print("🔍 [DEBUG 4] Scanning database for hash duplication...")
        existing_record = db.query(models.DiplomaRecord).filter(
            models.DiplomaRecord.diploma_hash == diploma_hash # Updated here
        ).first()
        
        if existing_record:
            if existing_record.status == 'Pending':
                raise HTTPException(status_code=400, detail="This diploma is currently pending in the transaction queue.")
            else:
                raise HTTPException(status_code=400, detail="This diploma has already been successfully issued on the blockchain.")
                
# Step 4: Queue the Transaction and Store Off-Chain Data in MySQL
        print("💾 [DEBUG 5] Committing comprehensive record to database queue...")
        new_record = models.DiplomaRecord(
            diploma_hash=diploma_hash, # Updated here
            student_id=payload.student_id,
            issued_by=payload.id_issuer,
            status='Pending',
            
            # 1. Institution Data
            national_diploma_number=payload.national_diploma_number,
            university_name=payload.university_name,
            university_id_code=payload.university_id_code,
            higher_education_program=payload.higher_education_program,
            study_program_name=payload.study_program_name,
            study_program_id=payload.study_program_id,
            
            # 2. Graduate Data
            student_name=payload.student_name,
            place_of_birth=payload.place_of_birth,
            date_of_birth=payload.date_of_birth,
            academic_degree=payload.academic_degree,
            gpa=payload.gpa,
            graduation_date=payload.graduation_date,
            
            # 3. Issuance Data
            issuance_location=payload.issuance_location,
            issuance_date=payload.issuance_date,
            signatory_name=payload.signatory_name,
            signatory_title=payload.signatory_title
        )
        db.add(new_record)
        db.commit()
        db.refresh(new_record)
        print(f"✅ [DEBUG 5] SUCCESS: Record stored with Internal ID: {new_record.id}")

        print("✅ [DEBUG 6] PREPARATION COMPLETE. Returning payload to Frontend.")
        print("="*50 + "\n")
        
        return {
            "status": "success",
            "message": "Diploma data queued successfully. Ready for Blockchain deployment.",
            "blockchain_payload": {
                "diploma_hash": new_record.diploma_hash,
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
        print("\n🚨 [FATAL ERROR] INTERNAL SERVER EXCEPTION!")
        print(f"🚨 Error Type: {type(e).__name__}")
        print(f"🚨 Error Details: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database synchronization error: {str(e)}")


# ==========================================
# 2. CONFIRMATION PHASE (ON-CHAIN SYNC)
# ==========================================
@router.patch("/confirm/{record_id}")
async def confirm_diploma_transaction(
    record_id: int, 
    tx_hash: str, 
    db: Session = Depends(get_db)
):
    """
    Triggered by the Frontend after a successful MetaMask transaction.
    Updates the database status from 'Pending' to 'Success' and stores the Tx Hash.
    """
    print(f"\n📥 [DEBUG] Receiving confirmation request for Record ID: {record_id}")
    print(f"🔗 [DEBUG] Blockchain Transaction Hash: {tx_hash}")

    try:
        # Fetch the pending diploma record
        record = db.query(models.DiplomaRecord).filter(models.DiplomaRecord.id == record_id).first()
        
        if not record:
            print("❌ [DEBUG] FAILED: Record not found in the database queue!")
            raise HTTPException(status_code=404, detail="Pending diploma record not found.")

        # Update record with Blockchain Tx Hash and Success status
        record.tx_hash = tx_hash
        record.status = 'Success'
        
        db.commit()
        db.refresh(record)
        
        print(f"✅ [DEBUG] SUCCESS: Diploma '{record.diploma_id}' status updated to SUCCESS!")
        
        return {
            "status": "success", 
            "message": "Diploma successfully issued and verified on both Database and Blockchain!",
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
        print(f"🚨 [ERROR] Confirmation failure: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to save transaction confirmation.")
    
# 3. DATA RETRIEVAL FOR HR/VERIFIERS
# ==========================================
@router.get("/verify/{diploma_hash}")
async def get_diploma_details(diploma_hash: str, db: Session = Depends(get_db)):
    
    # Hapus filter status == 'Success' agar data yang 'Pending' juga bisa dibaca
    record = db.query(models.DiplomaRecord).filter(
        models.DiplomaRecord.diploma_hash == diploma_hash
    ).first()

    if not record:
        raise HTTPException(
            status_code=404, 
            detail="Diploma data not found in off-chain database."
        )

    return {
            "status": "success",
            "data": {
                "national_diploma_number": record.national_diploma_number,
                "student_name": record.student_name,
                "student_id": record.student_id,
                "university_name": record.university_name,
                "study_program_name": record.study_program_name,
                "academic_degree": record.academic_degree,
                "gpa": record.gpa,
                "graduation_date": record.graduation_date,
                "signatory_name": record.signatory_name,
                "tx_hash": record.tx_hash
            }
        }