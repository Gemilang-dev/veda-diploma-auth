import os
import sys
from sqlalchemy.orm import Session
from datetime import datetime

# Add the project root to sys.path to allow imports from veda_backend
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from veda_backend.database import SessionLocal, engine, Base
from veda_backend import models

def seed():
    # 1. Create tables if they don't exist
    Base.metadata.create_all(bind=engine)
    
    db: Session = SessionLocal()
    try:
        # Check if already seeded
        if db.query(models.Admin).filter(models.Admin.username == "Admin").first():
            print("Database already seeded. Skipping.")
            return

        print("Seeding database...")

        # 2. Add Admin
        admin = models.Admin(
            id_admin=1,
            username="Admin",
            password_hash="$2b$12$akh9Q1LpFP.Uw8Ln.hRcBeuo3P4NPiY/wZZbvr9d5NQiSKJhH6NgK"
        )
        db.add(admin)
        db.commit()

        # 3. Add Issuer
        issuer = models.Issuer(
            id_issuer=3,
            created_by=1,
            university_name="Test University",
            email="thunderboltyes8@gmail.com",
            password_hash="$2b$12$oDczAPt31/UYnzzxQbAnGuRtXKoebZMdQN9whLJT8SQZKIRzrWLl2",
            wallet_address="0xAA7744feCC7EF5DE1c58aF01920F5EdED6879007",
            status="Active"
        )
        db.add(issuer)
        db.commit()

        # 4. Add Diploma Records
        diplomas = [
            models.DiplomaRecord(
                id=5,
                diploma_hash="0x861c0db91f3df5e0c8b1b5d74dbcdf5eae27d2ece7fc97ef72fbf20010647424",
                tx_hash=None,
                national_diploma_number="20240007DEF",
                university_name="20240002DEF",
                university_id_code="1001",
                higher_education_program="Bachelor Degree",
                study_program_name="Civil Engineering",
                study_program_id="P002",
                student_name="Siti Aminah",
                place_of_birth="Jakarta",
                date_of_birth="2003-11-20",
                student_id="15020045",
                academic_degree="BEng – Bachelor of Engineering",
                gpa="3.92",
                graduation_date="2026-02-20",
                issuance_location="Jakarta",
                issuance_date="2026-02-20",
                signatory_name="Prof. Dr. Hasan Mahmud",
                signatory_title="Rector",
                status="Pending",
                issued_by=3,
                issued_at=datetime.strptime("2026-05-17 12:33:23", "%Y-%m-%d %H:%M:%S")
            ),
            models.DiplomaRecord(
                id=6,
                diploma_hash="0x0f65aec7a94023ecde77927da6c6a3b380646bb87d35a5f886c1bc1344242b11",
                tx_hash=None,
                national_diploma_number="20240008DEF",
                university_name="20240002DEF",
                university_id_code="1001",
                higher_education_program="Bachelor Degree",
                study_program_name="Civil Engineering",
                study_program_id="P002",
                student_name="Siti Aminah",
                place_of_birth="Jakarta",
                date_of_birth="2003-11-20",
                student_id="15020045",
                academic_degree="BB – Bachelor of Business",
                gpa="3.92",
                graduation_date="2026-02-20",
                issuance_location="Jakarta",
                issuance_date="2026-02-20",
                signatory_name="Prof. Dr. Hasan Mahmud",
                signatory_title="Rector",
                status="Pending",
                issued_by=3,
                issued_at=datetime.strptime("2026-05-17 12:56:42", "%Y-%m-%d %H:%M:%S")
            ),
            models.DiplomaRecord(
                id=7,
                diploma_hash="0xaba4b77a9a79ceb4679f2faa1acaa964f02eb06ba9cafca25022b96ffc4afeb9",
                tx_hash="0xc3f484657965c2000c5d0ab6f371a9458d294257674a5a0fc31b3c8d98205f61",
                national_diploma_number="20240010DEF",
                university_name="20240002DEF",
                university_id_code="1001",
                higher_education_program="Bachelor Degree",
                study_program_name="Civil Engineering",
                study_program_id="P002",
                student_name="Siti Aminah",
                place_of_birth="Jakarta",
                date_of_birth="2003-11-20",
                student_id="15020045",
                academic_degree="BArch – Bachelor of Architecture",
                gpa="3.92",
                graduation_date="2026-02-20",
                issuance_location="Jakarta",
                issuance_date="2026-02-20",
                signatory_name="Prof. Dr. Hasan Mahmud",
                signatory_title="Rector",
                status="Success",
                issued_by=3,
                issued_at=datetime.strptime("2026-05-17 13:15:49", "%Y-%m-%d %H:%M:%S")
            )
        ]
        db.add_all(diplomas)
        db.commit()
        print("Database seeded successfully!")
        
    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed()
