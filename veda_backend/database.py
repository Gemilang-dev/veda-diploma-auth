import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.orm import declarative_base

# 1. Connection address to your database
# Use environment variable DATABASE_URL for production (Render/PostgreSQL)
# Fallback to local MySQL for development
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL")

if SQLALCHEMY_DATABASE_URL:
    # Render provides 'postgres://', but SQLAlchemy requires 'postgresql://'
    if SQLALCHEMY_DATABASE_URL.startswith("postgres://"):
        SQLALCHEMY_DATABASE_URL = SQLALCHEMY_DATABASE_URL.replace("postgres://", "postgresql://", 1)
    
    # Engine for PostgreSQL
    engine = create_engine(SQLALCHEMY_DATABASE_URL)
else:
    # Fallback to local MySQL
    # Format: mysql+pymysql://user:password@host:port/dbname
    SQLALCHEMY_DATABASE_URL = "mysql+pymysql://root:@localhost:3306/veda"
    engine = create_engine(
        SQLALCHEMY_DATABASE_URL, 
        pool_pre_ping=True,    # Check connection before use
        pool_recycle=3600      # Automatically reset connection every 1 hour
    )

# 3. Create SessionMaker
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 4. Base class used by models.py as a table template
Base = declarative_base()

# 5. Dependency function to get database session for API requests
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()