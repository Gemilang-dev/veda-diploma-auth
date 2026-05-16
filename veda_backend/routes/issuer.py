from fastapi import APIRouter, Depends, HTTPException, status, Form
from sqlalchemy.orm import Session
import models
import schemas
from database import get_db
# Import security dependencies and helper functions from auth.py
from routes.auth import get_current_admin, get_password_hash, verify_password, create_access_token
router = APIRouter()

# ==========================================
# ENDPOINT: REGISTER UNIVERSITY (ADMIN ONLY)
# ==========================================
@router.post("/register", response_model=schemas.IssuerResponse, status_code=status.HTTP_201_CREATED)
def register_issuer(
    issuer: schemas.IssuerCreate, 
    db: Session = Depends(get_db),
    # This dependency acts as a lock! 👇
    current_admin: models.Admin = Depends(get_current_admin) 
):
    # 1. Check if university email is already registered
    existing_issuer = db.query(models.Issuer).filter(models.Issuer.email == issuer.email).first()
    if existing_issuer:
        raise HTTPException(status_code=400, detail="University email is already registered!")

    # 2. Hash university password
    hashed_password = get_password_hash(issuer.password)

    # 3. Prepare new data (created_by is automatically taken from admin token!)
    new_issuer = models.Issuer(
        created_by=current_admin.id_admin, 
        university_name=issuer.university_name,
        email=issuer.email,
        password_hash=hashed_password,
        wallet_address=issuer.wallet_address
    )

    # 4. Save to database
    db.add(new_issuer)
    db.commit()
    db.refresh(new_issuer)
    return new_issuer

# ==========================================
# ENDPOINT: LIST ALL UNIVERSITIES (SUPER ADMIN ONLY)
# ==========================================
@router.get("/", response_model=list[schemas.IssuerResponse])
def list_issuers(
    db: Session = Depends(get_db),
    current_admin: models.Admin = Depends(get_current_admin)
):
    return db.query(models.Issuer).all()

# ==========================================
# ENDPOINT: UPDATE UNIVERSITY DATA (SUPER ADMIN ONLY)
# ==========================================
@router.patch("/{issuer_id}", response_model=schemas.IssuerResponse)
def update_issuer(
    issuer_id: int,
    issuer_data: schemas.IssuerUpdate,
    db: Session = Depends(get_db),
    current_admin: models.Admin = Depends(get_current_admin)
):
    issuer = db.query(models.Issuer).filter(models.Issuer.id_issuer == issuer_id).first()
    if not issuer:
        raise HTTPException(status_code=404, detail="University account not found!")

    # Update provided fields
    if issuer_data.university_name:
        issuer.university_name = issuer_data.university_name
    if issuer_data.email:
        # Check for email duplication if changed
        if issuer_data.email != issuer.email:
            existing = db.query(models.Issuer).filter(models.Issuer.email == issuer_data.email).first()
            if existing:
                raise HTTPException(status_code=400, detail="Email is already in use by another university!")
        issuer.email = issuer_data.email
    if issuer_data.password:
        issuer.password_hash = get_password_hash(issuer_data.password)
    if issuer_data.wallet_address:
        issuer.wallet_address = issuer_data.wallet_address
    if issuer_data.status:
        issuer.status = issuer_data.status

    db.commit()
    db.refresh(issuer)
    return issuer

# ==========================================
# ENDPOINT: DELETE UNIVERSITY (SUPER ADMIN ONLY)
# ==========================================
@router.delete("/{issuer_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_issuer(
    issuer_id: int,
    db: Session = Depends(get_db),
    current_admin: models.Admin = Depends(get_current_admin)
):
    issuer = db.query(models.Issuer).filter(models.Issuer.id_issuer == issuer_id).first()
    if not issuer:
        raise HTTPException(status_code=404, detail="University account not found!")
    
    # Check if this issuer has already issued diplomas
    has_diplomas = db.query(models.DiplomaRecord).filter(models.DiplomaRecord.issued_by == issuer_id).first()
    if has_diplomas:
        raise HTTPException(
            status_code=400, 
            detail="Cannot delete a university that has already issued diplomas. Please deactivate the account instead."
        )

    db.delete(issuer)
    db.commit()
    return None

# ==========================================
# ENDPOINT: UNIVERSITY LOGIN
# ==========================================
@router.post("/login", response_model=schemas.Token)
def login_issuer(
    # Swagger UI always sends variable named 'username',
    # so we catch 'username' but treat it as email
    username: str = Form(...), 
    password: str = Form(...), 
    db: Session = Depends(get_db)
):
    # 1. Find university data by email
    issuer = db.query(models.Issuer).filter(models.Issuer.email == username).first()
    
    # 2. If university not found or password incorrect
    if not issuer or not verify_password(password, issuer.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password!"
        )
        
    # 3. ACCOUNT STATUS CHECK: If Inactive, deny access!
    if issuer.status != 'Active':
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your university account has been deactivated by the system administrator."
        )

    # 4. If successful, create specific JWT Token for University
    access_token = create_access_token(
        data={
            "sub": issuer.email, 
            "id_issuer": issuer.id_issuer, 
            "university_name": issuer.university_name,
            "role": "kampus"
        }
    )
    
    return {"access_token": access_token, "token_type": "bearer"}