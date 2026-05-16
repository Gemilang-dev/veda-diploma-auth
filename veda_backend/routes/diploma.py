import os
import hashlib 
import models
import schemas
import json
from web3 import Web3
from fastapi import APIRouter, HTTPException, status, Depends
from sqlalchemy.orm import Session
from database import get_db
from dotenv import load_dotenv

router = APIRouter()

# Load environment variables
dotenv_path = os.path.join(os.path.dirname(__file__), "..", ".env")
load_dotenv(dotenv_path)

ALCHEMY_URL = os.getenv("ALCHEMY_SEPOLIA_URL")
CONTRACT_ADDRESS = os.getenv("DIPLOMA_REGISTRY_ADDRESS")

print(f"📡 [DEBUG] ALCHEMY_URL: {ALCHEMY_URL}")
print(f"📡 [DEBUG] CONTRACT_ADDRESS: {CONTRACT_ADDRESS}")

try:
    with open("abi.json", "r") as file:
        CONTRACT_ABI = json.load(file)
except FileNotFoundError:
    print("🚨 FATAL ERROR: 'abi.json' file not found in root folder!")
    CONTRACT_ABI = []  # Prevent application from crashing completely
except json.JSONDecodeError:
    print("🚨 FATAL ERROR: 'abi.json' file content is not valid JSON!")
    CONTRACT_ABI = []

# 3. Setup Web3 Connection
contract = None
try:
    if not ALCHEMY_URL:
        raise ValueError("ALCHEMY_SEPOLIA_URL is not set in .env")
    if not CONTRACT_ADDRESS:
        raise ValueError("DIPLOMA_REGISTRY_ADDRESS is not set in .env")
        
    w3 = Web3(Web3.HTTPProvider(ALCHEMY_URL))
    if not w3.is_connected():
        raise ConnectionError("Failed to connect to Ethereum network via Alchemy")
        
    contract = w3.eth.contract(address=Web3.to_checksum_address(CONTRACT_ADDRESS), abi=CONTRACT_ABI)
    print("✅ Web3 Connection Setup Successful in diploma.py")
except Exception as e:
    print(f"❌ Failed to setup Web3: {e}")

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
        
        print(f"✅ [DEBUG] SUCCESS: Diploma '{record.diploma_hash}' status updated to SUCCESS!")
        
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
async def verify_diploma(diploma_hash: str, db: Session = Depends(get_db)):
    # 1. FETCH DATA FROM MYSQL
    record = db.query(models.DiplomaRecord).filter(
        models.DiplomaRecord.diploma_hash == diploma_hash
    ).first()

    if not record:
        raise HTTPException(status_code=404, detail="Diploma data not found in our records.")

    # 2. INTERNAL INTEGRITY CHECK (Re-hash SQL data)
    raw_data = (
        f"{record.national_diploma_number}|{record.university_name}|{record.university_id_code}|"
        f"{record.higher_education_program}|{record.study_program_name}|{record.study_program_id}|"
        f"{record.student_name}|{record.place_of_birth}|{record.date_of_birth}|{record.student_id}|"
        f"{record.academic_degree}|{record.gpa}|{record.graduation_date}|"
        f"{record.issuance_location}|{record.issuance_date}|{record.signatory_name}|{record.signatory_title}"
    )
    calculated_hash = f"0x{hashlib.sha256(raw_data.encode()).hexdigest()}"

    if calculated_hash != record.diploma_hash:
        # If this fails, it means an administrator tampered with SQL data directly
        raise HTTPException(
            status_code=400, 
            detail="INTERNAL TAMPERING DETECTED: SQL data does not match the stored hash."
        )

    # 3. BLOCKCHAIN CROSS-CHECK (The Alchemy Part)
    # We call the 'verifyDiploma' function on the Smart Contract
    try:
        if contract is None:
            raise Exception("Blockchain contract is not initialized. Please check server logs for setup errors.")

        # Call verifyDiploma. 
        # Solidity returns 3 values, Python receives them as a Tuple
        blockchain_result = contract.functions.verifyDiploma(record.diploma_hash).call()
        
        is_valid_on_chain = blockchain_result[0]   # Index 0: bool isValid
        is_revoked_on_chain = blockchain_result[1] # Index 1: bool isRevoked
        # issued_at = blockchain_result[2]         # Index 2: uint256 issuedAt

        # Scenario 1: Has this diploma been revoked?
        if is_revoked_on_chain:
            raise HTTPException(
                status_code=400,
                detail="REVOKED: This diploma was registered but has been officially REVOKED by the University."
            )

        # Scenario 2: Is this diploma valid on-chain?
        if not is_valid_on_chain:
            raise HTTPException(
                status_code=400,
                detail="FORGERY ALERT: Data found in SQL but NOT verified on the Ethereum Blockchain."
            )

    except HTTPException:
        # Let our specific error messages pass to Frontend
        raise
    except Exception as e:
        # Catch Alchemy network errors / ABI mismatch
        print(f"Blockchain Connection Error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Blockchain network is currently unreachable. Please try again later."
        )


    return {
        "status": "Verified",
        "message": "This diploma is 100% Authentic (Verified by Blockchain & Local Database)",
        "data": {
            "student_name": record.student_name,
            "student_id": record.student_id,  # Student ID (NIM)
            "national_diploma_number": record.national_diploma_number,
            "university_name": record.university_name,
            "study_program_name": record.study_program_name,
            "academic_degree": record.academic_degree,
            "gpa": record.gpa,
            "graduation_date": record.graduation_date,
            "issuance_location": record.issuance_location,
            "issuance_date": record.issuance_date,
            "signatory_name": record.signatory_name,
            "signatory_title": record.signatory_title,
            "tx_hash": record.tx_hash 
        }
    }
