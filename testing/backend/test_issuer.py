import pytest

def test_issuer_registration_unauthorized(client):
    """Ensure that issuer registration requires admin authorization"""
    issuer_data = {
        "university_name": "Test Univ",
        "email": "test@univ.ac.id",
        "password": "securepassword",
        "wallet_address": "0x123"
    }
    response = client.post("/api/issuer/register", json=issuer_data)
    assert response.status_code == 401 # Should fail without admin token

def test_get_issuers_unauthorized(client):
    """Ensure that listing issuers requires authorization"""
    response = client.get("/api/issuer/")
    assert response.status_code == 401
