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