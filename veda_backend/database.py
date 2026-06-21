import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.orm import declarative_base

# 1. Connection address to your database
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL")

def get_ssl_args():
    """Determine SSL arguments for MySQL (Aiven, etc.)."""
    if not SQLALCHEMY_DATABASE_URL or not SQLALCHEMY_DATABASE_URL.startswith("mysql"):
        return {}
        
    # Standard CA paths for Linux (Azure App Service / Ubuntu)
    ca_paths = [
        "/etc/ssl/certs/ca-certificates.crt", # Common for Linux/Azure
        "/etc/pki/tls/certs/ca-bundle.crt",
        os.path.join(os.getcwd(), "veda_backend", "ca.pem"),
    ]
    
    for path in ca_paths:
        if os.path.exists(path):
            return {"ssl": {"ca": path}}
            
    return {"ssl": {"ssl_mode": "REQUIRED"}}

if SQLALCHEMY_DATABASE_URL:
    # Handle PostgreSQL (if user switches back)
    if SQLALCHEMY_DATABASE_URL.startswith("postgres://"):
        SQLALCHEMY_DATABASE_URL = SQLALCHEMY_DATABASE_URL.replace("postgres://", "postgresql://", 1)
    
    # Handle MySQL (Aiven)
    if SQLALCHEMY_DATABASE_URL.startswith("mysql://"):
        SQLALCHEMY_DATABASE_URL = SQLALCHEMY_DATABASE_URL.replace("mysql://", "mysql+pymysql://", 1)
        engine = create_engine(
            SQLALCHEMY_DATABASE_URL, 
            connect_args=get_ssl_args(),
            pool_pre_ping=True,
            pool_recycle=300
        )
    else:
        # Standard PostgreSQL or other databases
        engine = create_engine(
            SQLALCHEMY_DATABASE_URL,
            pool_pre_ping=True,
            pool_recycle=300
        )
else:
    # Fallback to local MySQL
    SQLALCHEMY_DATABASE_URL = "mysql+pymysql://root:@localhost:3306/veda"
    engine = create_engine(
        SQLALCHEMY_DATABASE_URL, 
        pool_pre_ping=True,
        pool_recycle=300
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()