import pytest
from veda_backend import models
from veda_backend.routes.auth import create_access_token, get_password_hash

@pytest.fixture
def admin_token(db):
    admin = models.Admin(username="superadmin", password_hash="hash")
    db.add(admin)
    db.commit()
    db.refresh(admin)
    return create_access_token(data={"sub": admin.username, "id_admin": admin.id_admin})

@pytest.fixture
def auth_headers(admin_token):
    return {"Authorization": f"Bearer {admin_token}"}

def test_register_issuer_success(client, db, auth_headers, mocker):
    """Test successful issuer registration with blockchain mock"""
    mock_blockchain = mocker.patch("veda_backend.routes.issuer.register_issuer_on_blockchain")
    mock_blockchain.return_value = "0xfake_tx_hash"
    
    issuer_data = {
        "university_name": "Test University",
        "email": "test@univ.ac.id",
        "password": "password123",
        "wallet_address": "0x1234567890123456789012345678901234567890"
    }
    
    response = client.post("/api/issuer/register", json=issuer_data, headers=auth_headers)
    assert response.status_code == 201
    assert response.json()["email"] == "test@univ.ac.id"
    assert mock_blockchain.called

def test_register_issuer_duplicate(client, db, auth_headers):
    """Test registration with existing email"""
    admin = db.query(models.Admin).first()
    db.add(models.Issuer(
        university_name="Existing",
        email="existing@univ.ac.id",
        password_hash="hash",
        wallet_address="0x123",
        created_by=admin.id_admin
    ))
    db.commit()
    
    issuer_data = {
        "university_name": "New Name",
        "email": "existing@univ.ac.id",
        "password": "password123",
        "wallet_address": "0x456"
    }
    
    response = client.post("/api/issuer/register", json=issuer_data, headers=auth_headers)
    assert response.status_code == 400
    assert "already registered" in response.json()["detail"]

def test_list_issuers(client, db, auth_headers):
    """Test listing all issuers"""
    response = client.get("/api/issuer/", headers=auth_headers)
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_update_issuer(client, db, auth_headers):
    """Test updating issuer data"""
    admin = db.query(models.Admin).first()
    issuer = models.Issuer(
        university_name="Old Name",
        email="old@univ.ac.id",
        password_hash="hash",
        wallet_address="0x123",
        created_by=admin.id_admin
    )
    db.add(issuer)
    db.commit()
    db.refresh(issuer)
    
    update_data = {"university_name": "Updated Name", "status": "Inactive"}
    response = client.patch(f"/api/issuer/{issuer.id_issuer}", json=update_data, headers=auth_headers)
    assert response.status_code == 200
    assert response.json()["university_name"] == "Updated Name"
    assert response.json()["status"] == "Inactive"

def test_delete_issuer_success(client, db, auth_headers):
    """Test deleting an issuer"""
    admin = db.query(models.Admin).first()
    issuer = models.Issuer(
        university_name="To Delete",
        email="delete@univ.ac.id",
        password_hash="hash",
        wallet_address="0x123",
        created_by=admin.id_admin
    )
    db.add(issuer)
    db.commit()
    db.refresh(issuer)
    
    response = client.delete(f"/api/issuer/{issuer.id_issuer}", headers=auth_headers)
    assert response.status_code == 204
    
    # Verify deleted
    check = db.query(models.Issuer).filter(models.Issuer.id_issuer == issuer.id_issuer).first()
    assert check is None

def test_delete_issuer_has_diplomas(client, db, auth_headers):
    """Test deleting an issuer that already has issued diplomas (should fail)"""
    admin = db.query(models.Admin).first()
    issuer = models.Issuer(
        university_name="Univ with Diplomas",
        email="diplomas@univ.ac.id",
        password_hash="hash",
        wallet_address="0x123",
        created_by=admin.id_admin
    )
    db.add(issuer)
    db.commit()
    db.refresh(issuer)
    
    # Add a diploma record for this issuer
    record = models.DiplomaRecord(
        diploma_hash="0xhash",
        student_id="NIM1",
        issued_by=issuer.id_issuer,
        status="Success"
    )
    db.add(record)
    db.commit()
    
    response = client.delete(f"/api/issuer/{issuer.id_issuer}", headers=auth_headers)
    assert response.status_code == 400
    assert "Cannot delete" in response.json()["detail"]

def test_update_issuer_duplicate_email(client, db, auth_headers):
    """Test updating issuer to an email already in use"""
    admin = db.query(models.Admin).first()
    issuer1 = models.Issuer(university_name="U1", email="u1@univ.ac.id", password_hash="h", wallet_address="w1", created_by=admin.id_admin)
    issuer2 = models.Issuer(university_name="U2", email="u2@univ.ac.id", password_hash="h", wallet_address="w2", created_by=admin.id_admin)
    db.add(issuer1)
    db.add(issuer2)
    db.commit()
    
    update_data = {"email": "u2@univ.ac.id"}
    response = client.patch(f"/api/issuer/{issuer1.id_issuer}", json=update_data, headers=auth_headers)
    assert response.status_code == 400
    assert "already in use" in response.json()["detail"]

def test_login_issuer_success(client, db):
    """Test successful issuer login"""
    admin = models.Admin(username="admin2", password_hash="hash")
    db.add(admin)
    db.commit()
    
    hashed = get_password_hash("issuerpass")
    issuer = models.Issuer(
        university_name="Login Univ",
        email="login@univ.ac.id",
        password_hash=hashed,
        wallet_address="0x123",
        created_by=admin.id_admin,
        status="Active"
    )
    db.add(issuer)
    db.commit()
    
    response = client.post(
        "/api/issuer/login",
        data={"username": "login@univ.ac.id", "password": "issuerpass"}
    )
    assert response.status_code == 200
    assert "access_token" in response.json()

def test_login_issuer_inactive(client, db):
    """Test login attempt by inactive issuer"""
    admin = models.Admin(username="admin3", password_hash="hash")
    db.add(admin)
    db.commit()
    
    hashed = get_password_hash("issuerpass")
    issuer = models.Issuer(
        university_name="Inactive Univ",
        email="inactive@univ.ac.id",
        password_hash=hashed,
        wallet_address="0x123",
        created_by=admin.id_admin,
        status="Inactive"
    )
    db.add(issuer)
    db.commit()
    
    response = client.post(
        "/api/issuer/login",
        data={"username": "inactive@univ.ac.id", "password": "issuerpass"}
    )
    assert response.status_code == 403
