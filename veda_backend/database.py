from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base

# 1. Connection address to your MySQL database
# Using PyMySQL as driver, 'root' as username, empty password, and 'veda' as database name
SQLALCHEMY_DATABASE_URL = "mysql+pymysql://root:@localhost:3306/veda"


# 2. Create the engine to connect to MySQL
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, 
    pool_pre_ping=True,    # Check connection before use
    pool_recycle=3600      # Automatically reset connection every 1 hour
)

# 3. Create SessionMaker
# autocommit=False allows us to control when data is committed
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