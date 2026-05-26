import pytest
from veda_backend import models
from veda_backend.blockchain_utils import generate_diploma_hash

@pytest.fixture
def active_issuer(db):
    admin = models.Admin(username="admin_diploma", password_hash="hash")
    db.add(admin)
    db.commit()
    
    issuer = models.Issuer(
        id_issuer=1,
        university_name="Diploma Univ",
        email="diploma@univ.ac.id",
        password_hash="hash",
        wallet_address="0x123",
        created_by=admin.id_admin,
        status="Active"
    )
    db.add(issuer)
    db.commit()
    db.refresh(issuer)
    return issuer

def test_prepare_diploma_success(client, db, active_issuer):
    """Test successful diploma preparation"""
    payload = {
        "id_issuer": active_issuer.id_issuer,
        "national_diploma_number": "DIP123",
        "university_name": "Diploma Univ",
        "university_id_code": "UNIV01",
        "higher_education_program": "S1",
        "study_program_name": "CS",
        "study_program_id": "SP01",
        "student_name": "Jane Doe",
        "place_of_birth": "Jakarta",
        "date_of_birth": "2000-01-01",
        "student_id": "NIM123",
        "academic_degree": "S.Kom",
        "gpa": "3.90",
        "graduation_date": "2024-01-01",
        "issuance_location": "Jakarta",
        "issuance_date": "2024-01-05",
        "signatory_name": "Rector",
        "signatory_title": "Dr. Rector"
    }
    
    response = client.post("/api/diploma/prepare", json=payload)
    assert response.status_code == 201
    assert "blockchain_payload" in response.json()
    assert response.json()["database_info"]["status"] == "Pending"

def test_prepare_diploma_issuer_inactive(client, db, active_issuer):
    """Test preparation when issuer is inactive"""
    active_issuer.status = "Inactive"
    db.commit()
    
    payload = {
        "id_issuer": active_issuer.id_issuer,
        "national_diploma_number": "DIP456",
        "university_name": "Diploma Univ",
        "university_id_code": "UNIV01",
        "higher_education_program": "S1",
        "study_program_name": "CS",
        "study_program_id": "SP01",
        "student_name": "Bob",
        "place_of_birth": "Jakarta",
        "date_of_birth": "2000-01-01",
        "student_id": "NIM456",
        "academic_degree": "S.Kom",
        "gpa": "3.00",
        "graduation_date": "2024-01-01",
        "issuance_location": "Jakarta",
        "issuance_date": "2024-01-05",
        "signatory_name": "Rector",
        "signatory_title": "Dr. Rector"
    }
    response = client.post("/api/diploma/prepare", json=payload)
    assert response.status_code == 400

def test_confirm_diploma_success(client, db, active_issuer):
    """Test successful diploma transaction confirmation"""
    record = models.DiplomaRecord(
        diploma_hash="0xabc",
        student_id="NIM123",
        issued_by=active_issuer.id_issuer,
        status="Pending"
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    
    response = client.patch(f"/api/diploma/confirm/{record.id}?tx_hash=0x789")
    assert response.status_code == 200
    assert response.json()["data"]["status"] == "Success"
    assert response.json()["data"]["tx_hash"] == "0x789"

def test_verify_diploma_success(client, db, active_issuer, mocker):
    """Test successful diploma verification with blockchain mock"""
    # Create success record
    data = {
        "national_diploma_number": "V123",
        "university_name": "Univ V",
        "university_id_code": "UV01",
        "higher_education_program": "S1",
        "study_program_name": "Physics",
        "study_program_id": "P01",
        "student_name": "Alice",
        "place_of_birth": "London",
        "date_of_birth": "1995-05-05",
        "student_id": "NIM999",
        "academic_degree": "B.Sc",
        "gpa": "3.5",
        "graduation_date": "2023-01-01",
        "issuance_location": "London",
        "issuance_date": "2023-01-10",
        "signatory_name": "Dean",
        "signatory_title": "Prof. Dean"
    }
    h = generate_diploma_hash(data)
    
    record = models.DiplomaRecord(
        diploma_hash=h,
        status="Success",
        issued_by=active_issuer.id_issuer,
        **data
    )
    db.add(record)
    db.commit()
    
    # Mock blockchain contract call
    mock_contract = mocker.patch("veda_backend.routes.diploma.contract")
    # verifyDiploma returns (isValid, isRevoked, issuedAt)
    mock_contract.functions.verifyDiploma.return_value.call.return_value = (True, False, 123456789)
    
    response = client.get(f"/api/diploma/verify/{h}")
    assert response.status_code == 200
    assert response.json()["status"] == "Verified"

def test_verify_diploma_revoked(client, db, active_issuer, mocker):
    """Test verification for a revoked diploma"""
    data = {"student_name": "Revoked Student", "student_id": "R1"}
    h = generate_diploma_hash(data)
    record = models.DiplomaRecord(diploma_hash=h, status="Success", issued_by=active_issuer.id_issuer, **data)
    db.add(record)
    db.commit()
    
    mock_contract = mocker.patch("veda_backend.routes.diploma.contract")
    # isValid=True, isRevoked=True
    mock_contract.functions.verifyDiploma.return_value.call.return_value = (True, True, 123)
    
    response = client.get(f"/api/diploma/verify/{h}")
    assert response.status_code == 400
    assert "REVOKED" in response.json()["detail"]

def test_verify_diploma_forgery(client, db, active_issuer, mocker):
    """Test verification for a diploma not on blockchain (forgery)"""
    data = {"student_name": "Forgery Student", "student_id": "F1"}
    h = generate_diploma_hash(data)
    record = models.DiplomaRecord(diploma_hash=h, status="Success", issued_by=active_issuer.id_issuer, **data)
    db.add(record)
    db.commit()
    
    mock_contract = mocker.patch("veda_backend.routes.diploma.contract")
    # isValid=False, isRevoked=False
    mock_contract.functions.verifyDiploma.return_value.call.return_value = (False, False, 0)
    
    response = client.get(f"/api/diploma/verify/{h}")
    assert response.status_code == 400
    assert "FORGERY ALERT" in response.json()["detail"]

def test_verify_diploma_tampered(client, db, active_issuer, mocker):
    """Test verification when SQL data has been tampered with"""
    data = {"student_name": "Original", "student_id": "O1"}
    h = generate_diploma_hash(data)
    # Store with tampered student name
    record = models.DiplomaRecord(diploma_hash=h, status="Success", issued_by=active_issuer.id_issuer, **data)
    record.student_name = "Tampered" 
    db.add(record)
    db.commit()
    
    response = client.get(f"/api/diploma/verify/{h}")
    assert response.status_code == 400
    assert "INTERNAL TAMPERING DETECTED" in response.json()["detail"]

def test_verify_diploma_not_found(client, db):
    """Test verification for non-existent hash"""
    response = client.get("/api/diploma/verify/0xnonexistent")
    assert response.status_code == 404
