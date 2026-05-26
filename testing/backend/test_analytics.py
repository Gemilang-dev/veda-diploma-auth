import pytest
from veda_backend import models
from veda_backend.routes.auth import create_access_token

@pytest.fixture
def admin_token(db):
    admin = models.Admin(username="admin_analytics", password_hash="hash")
    db.add(admin)
    db.commit()
    db.refresh(admin)
    return create_access_token(data={"sub": admin.username, "id_admin": admin.id_admin})

@pytest.fixture
def issuer_token(db):
    admin = models.Admin(username="admin_for_issuer", password_hash="hash")
    db.add(admin)
    db.commit()
    
    issuer = models.Issuer(
        university_name="Analytics Univ",
        email="analytics@univ.ac.id",
        password_hash="hash",
        wallet_address="0x123",
        created_by=admin.id_admin,
        status="Active"
    )
    db.add(issuer)
    db.commit()
    db.refresh(issuer)
    return create_access_token(data={"sub": issuer.email, "id_issuer": issuer.id_issuer, "role": "kampus"})

def test_issuer_analytics_unauthorized(client):
    """Ensure issuer analytics is protected"""
    response = client.get("/api/analytics/issuer")
    assert response.status_code == 401

def test_admin_analytics_unauthorized(client):
    """Ensure admin analytics is protected"""
    response = client.get("/api/analytics/admin")
    assert response.status_code == 401

def test_issuer_analytics_success(client, issuer_token):
    """Test successful issuer analytics retrieval"""
    headers = {"Authorization": f"Bearer {issuer_token}"}
    response = client.get("/api/analytics/issuer", headers=headers)
    assert response.status_code == 200
    assert "total" in response.json()
    assert "degrees" in response.json()

def test_admin_analytics_success(client, admin_token):
    """Test successful admin analytics retrieval"""
    headers = {"Authorization": f"Bearer {admin_token}"}
    response = client.get("/api/analytics/admin", headers=headers)
    assert response.status_code == 200
    assert "total_issuers" in response.json()
    assert "total_diplomas" in response.json()
