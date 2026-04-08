from pydantic import BaseModel

# Schema untuk Frontend saat mengirim data pendaftaran Super Admin
class AdminCreate(BaseModel):
    username: str
    password: str

#Schema khusus untuk Login
class AdminLogin(BaseModel):
    username: str
    password: str


# Schema untuk respon sukses pendaftaran (agar password tidak ikut terkirim balik)
class AdminResponse(BaseModel):
    id_admin: int
    username: str

    class Config:
        from_attributes = True

# Schema untuk token JWT (Nanti digunakan untuk Login)
class Token(BaseModel):
    access_token: str
    token_type: str

# ==========================================
# SCHEMAS UNTUK ISSUER (KAMPUS)
# ==========================================
class IssuerCreate(BaseModel):
    university_name: str
    email: str
    password: str
    wallet_address: str

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