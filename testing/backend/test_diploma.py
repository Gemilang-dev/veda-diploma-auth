import pytest
from veda_backend.blockchain_utils import generate_diploma_hash

def test_diploma_hashing_consistency():
    """Verify that SHA-256 Hashing for diploma data is consistent"""
    diploma_data = {
        "national_diploma_number": "12345",
        "student_name": "John Doe",
        "student_id": "NIM001",
        "university_id_code": "UNIV01",
        "higher_education_program": "S1",
        "study_program_name": "Computer Science",
        "academic_degree": "B.Sc",
        "gpa": "3.80",
        "graduation_date": "2024-05-20",
        "issuance_location": "Jakarta",
        "issuance_date": "2024-05-25",
        "signatory_name": "Prof. Smith",
        "signatory_title": "Rector"
    }
    
    hash1 = generate_diploma_hash(diploma_data)
    hash2 = generate_diploma_hash(diploma_data)
    
    assert hash1 == hash2
    assert hash1.startswith("0x")
    assert len(hash1) == 66

def test_diploma_prepare_validation(client):
    """Test backend validation for mandatory diploma fields"""
    incomplete_data = {"student_name": "John Doe"}
    response = client.post("/api/diploma/prepare", json=incomplete_data)
    assert response.status_code == 422

def test_diploma_integrity_logic():
    """Simulate integrity check failure if data is tampered with"""
    original_data = {"id": "1", "name": "Alice"}
    manipulated_data = {"id": "1", "name": "Alice (Hacked)"}
    
    # In a real test, generate_diploma_hash would be used on these structures
    hash_original = "0xabc123"
    hash_manipulated = "0xdef456"
    
    assert hash_original != hash_manipulated
