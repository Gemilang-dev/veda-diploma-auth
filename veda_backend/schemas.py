from pydantic import BaseModel
from datetime import datetime

# ==========================================
# 🛡️ ADMIN SCHEMAS
# ==========================================
class AdminCreate(BaseModel):
    username: str
    password: str

class AdminLogin(BaseModel):
    username: str
    password: str

class AdminResponse(BaseModel):
    id_admin: int
    username: str

    class Config:
        from_attributes = True

# ==========================================
# 🔑 AUTHENTICATION SCHEMAS
# ==========================================
class Token(BaseModel):
    access_token: str
    token_type: str

class GoogleLoginRequest(BaseModel):
    token: str

# ==========================================
# 🏫 ISSUER (UNIVERSITY) SCHEMAS
# ==========================================
class IssuerCreate(BaseModel):
    university_name: str
    email: str
    password: str
    wallet_address: str

class IssuerUpdate(BaseModel):
    university_name: str = None
    email: str = None
    password: str = None
    wallet_address: str = None
    status: str = None # 'Active' or 'Inactive'

class IssuerLogin(BaseModel):
    email: str
    password: str

class IssuerResponse(BaseModel):
    id_issuer: int
    created_by: int
    university_name: str
    email: str
    wallet_address: str
    status: str

    class Config:
        from_attributes = True

# ==========================================
# 🎓 DIPLOMA (NATIONAL STANDARD + GPA)
# ==========================================
class DiplomaPrepareRequest(BaseModel):
    """
    Comprehensive schema aligning with National Diploma Standards (Permendikbudristek)
    along with crucial internal university metrics (e.g., GPA).
    """
    # 1. Institution Data
    national_diploma_number: str
    university_name: str
    university_id_code: str
    higher_education_program: str
    study_program_name: str
    study_program_id: str
    
    # 2. Graduate Data
    student_name: str
    place_of_birth: str
    date_of_birth: str
    student_id: str
    academic_degree: str
    gpa: str              # <-- Added Cumulative GPA here
    graduation_date: str
    
    # 3. Issuance Data
    issuance_location: str
    issuance_date: str
    signatory_name: str
    signatory_title: str
    
    # 4. System Reference
    id_issuer: int

class DiplomaResponse(BaseModel):
    id: int
    diploma_hash: str  # Updated from diploma_id
    student_id: str
    tx_hash: str
    issued_by: int
    issued_at: datetime
    status: str

    class Config:
        from_attributes = True