from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from veda_backend import models
from veda_backend.database import engine
from veda_backend.routes import auth, issuer, diploma, analytics


# Automatically create tables in MySQL based on the models
models.Base.metadata.create_all(bind=engine)

# Initialize FastAPI Application
app = FastAPI(
    title="VEDA API",
    description="Backend API for Diploma Verification System",
    version="1.0.0"
)

# CORS Configuration (Required for React Frontend to access this API)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, replace with your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers with their respective prefixes and tags
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(issuer.router, prefix="/api/issuer", tags=["Issuer (University)"])
app.include_router(diploma.router, prefix="/api/diploma", tags=["Diploma"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["Analytics"])


# Root Endpoint (To check if the server is running)
@app.get("/")
def read_root():
    return {
        "status": "success", 
        "message": "Welcome to VEDA API Backend! The server is running perfectly."
    }