from fastapi import APIRouter, Depends, HTTPException, status, Form
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from datetime import datetime, timedelta # For managing token expiration
from jose import jwt # JWT Token library
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError
from google.oauth2 import id_token
from google.auth.transport import requests

import models
import schemas
from database import get_db

# Initialize Router
router = APIRouter()

# Initialize Password Hashing system using Bcrypt algorithm
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# ==========================================
# JWT & GOOGLE CONFIGURATION
# ==========================================
# Replace with a long, random secret key for production
SECRET_KEY = "VEDA_SKRIPSI_RAHASIA_SUPER_KUAT_123!@#" 
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30 # Token expires in 30 minutes

# [REPLACE THIS] Enter your Google Client ID here
GOOGLE_CLIENT_ID = "626526137992-5qmt3cgqbkp4s94dmcrdjhcgp76f8uai.apps.googleusercontent.com"

# In routes/auth.py

oauth2_scheme_admin = OAuth2PasswordBearer(
    tokenUrl="/api/auth/login",
    scheme_name="Login_SuperAdmin"  # <-- Unique name
)

# Lock for University/Issuer (Door 2)
oauth2_scheme_issuer = OAuth2PasswordBearer(
    tokenUrl="/api/issuer/login",
    scheme_name="Login_Kampus"      # <-- Unique name
)

# Helper function to create JWT Token
def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# Helper function to compare plain password vs hashed password in database
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

# Helper function to hash passwords
def get_password_hash(password: str):
    return pwd_context.hash(password)

# SECURITY FUNCTION: Verify and extract JWT Token from Frontend
def get_current_admin(token: str = Depends(oauth2_scheme_admin), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid token or token has expired",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        # Decode token using Secret Key
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    # Ensure user exists in database
    admin = db.query(models.Admin).filter(models.Admin.username == username).first()
    if admin is None:
        raise credentials_exception
    
    return admin


# UNIVERSITY-SPECIFIC SECURITY FUNCTION: Check if token is valid and labeled "kampus"
def get_current_issuer(token: str = Depends(oauth2_scheme_issuer), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid token or you are not a University account!",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        role: str = payload.get("role") # Extract role from token payload
        
        # If email is empty or role is not "kampus", deny access!
        if email is None or role != "kampus":
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    # Ensure university account still exists in database
    issuer = db.query(models.Issuer).filter(models.Issuer.email == email).first()
    if issuer is None:
        raise credentials_exception
        
    # [BUG FIX] STATUS CHECK: If account is deactivated by admin, revoke access immediately!
    if issuer.status != 'Active':
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Your account has been deactivated. Session terminated."
        )
    
    return issuer


# ==========================================
# ENDPOINT 1: REGISTER ADMIN 
# ==========================================
@router.post("/register_admin", response_model=schemas.AdminResponse, status_code=status.HTTP_201_CREATED)
def register_admin(admin: schemas.AdminCreate, db: Session = Depends(get_db)):
    # 1. Check if username is already taken
    existing_admin = db.query(models.Admin).filter(models.Admin.username == admin.username).first()
    if existing_admin:
        raise HTTPException(status_code=400, detail="Username is already registered!")

    # 2. Encrypt (Hash) password
    hashed_password = get_password_hash(admin.password)

    # 3. Prepare data for database
    new_admin = models.Admin(
        username=admin.username,
        password_hash=hashed_password
    )

    # 4. Save to MySQL database
    db.add(new_admin)
    db.commit()
    db.refresh(new_admin)

    return new_admin

# ==========================================
# ENDPOINT: ADMIN LOGIN
# ==========================================
@router.post("/login", response_model=schemas.Token)
def login_admin(
    username: str = Form(...), 
    password: str = Form(...), 
    db: Session = Depends(get_db)
):
    # Find in database
    admin = db.query(models.Admin).filter(models.Admin.username == username).first()
    
    # Check password match
    if not admin or not verify_password(password, admin.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password!",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Create and return token
    access_token = create_access_token(
        data={"sub": admin.username, "id_admin": admin.id_admin}
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

# ==========================================
# ENDPOINT: GOOGLE LOGIN (UNIVERSITY)
# ==========================================
@router.post("/google-login", response_model=schemas.Token)
def google_login(request_data: schemas.GoogleLoginRequest, db: Session = Depends(get_db)):
    try:
        # Verify Google ID token
        id_info = id_token.verify_oauth2_token(
            request_data.token, 
            requests.Request(), 
            GOOGLE_CLIENT_ID
        )

        # Extract email from Google payload
        email = id_info.get("email")
        
        # Find issuer by email
        issuer = db.query(models.Issuer).filter(models.Issuer.email == email).first()
        
        if not issuer:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Google email is not registered as a University account!"
            )
            
        # [BUG FIX] STATUS CHECK: Deny login if account is deactivated
        if issuer.status != 'Active':
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Your university account has been deactivated by the system administrator."
            )
        
        # Create JWT token for Issuer
        access_token = create_access_token(
            data={
                "sub": issuer.email, 
                "id_issuer": issuer.id_issuer, 
                "role": "kampus"
            }
        )
        
        return {"access_token": access_token, "token_type": "bearer"}

    except ValueError:
        # Invalid token
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Google Token!"
        )