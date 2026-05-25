import pytest
from fastapi.testclient import TestClient
from veda_backend.routes.auth import create_access_token, get_password_hash
from veda_backend import models

def test_register_admin_success(client, db):
    """Test successful admin registration"""
    response = client.post(
        "/api/auth/register_admin",
        json={"username": "newadmin", "password": "password123"}
    )
    assert response.status_code == 201
    assert response.json()["username"] == "newadmin"

def test_register_admin_duplicate(client, db):
    """Test registration with existing username"""
    # Create first admin
    db.add(models.Admin(username="existing", password_hash="hash"))
    db.commit()
    
    response = client.post(
        "/api/auth/register_admin",
        json={"username": "existing", "password": "password123"}
    )
    assert response.status_code == 400
    assert response.json()["detail"] == "Username is already registered!"

def test_login_admin_success(client, db):
    """Test successful admin login"""
    hashed = get_password_hash("adminpass")
    db.add(models.Admin(username="adminuser", password_hash=hashed))
    db.commit()
    
    response = client.post(
        "/api/auth/login",
        data={"username": "adminuser", "password": "adminpass"}
    )
    assert response.status_code == 200
    assert "access_token" in response.json()

def test_login_admin_wrong_password(client, db):
    """Test admin login with wrong password"""
    hashed = get_password_hash("adminpass")
    db.add(models.Admin(username="adminuser", password_hash=hashed))
    db.commit()
    
    response = client.post(
        "/api/auth/login",
        data={"username": "adminuser", "password": "wrongpassword"}
    )
    assert response.status_code == 401

def test_google_login_not_found(client, db, mocker):
    """Test Google login when email not registered"""
    # Mock Google verify_oauth2_token
    mock_verify = mocker.patch("veda_backend.routes.auth.id_token.verify_oauth2_token")
    mock_verify.return_value = {"email": "notregistered@univ.ac.id"}
    
    response = client.post(
        "/api/auth/google-login",
        json={"token": "fake-google-token"}
    )
    assert response.status_code == 404

def test_google_login_deactivated(client, db, mocker):
    """Test Google login when account deactivated"""
    email = "deactivated@univ.ac.id"
    # Create an admin first because of foreign key
    admin = models.Admin(username="testadmin", password_hash="hash")
    db.add(admin)
    db.commit()
    
    db.add(models.Issuer(
        email=email, 
        university_name="Deactivated Univ",
        password_hash="hash",
        wallet_address="0x123",
        created_by=admin.id_admin,
        status="Inactive"
    ))
    db.commit()
    
    mock_verify = mocker.patch("veda_backend.routes.auth.id_token.verify_oauth2_token")
    mock_verify.return_value = {"email": email}
    
    response = client.post(
        "/api/auth/google-login",
        json={"token": "fake-google-token"}
    )
    assert response.status_code == 403

def test_google_login_invalid_token(client, db, mocker):
    """Test Google login with invalid token"""
    mock_verify = mocker.patch("veda_backend.routes.auth.id_token.verify_oauth2_token")
    mock_verify.side_effect = ValueError("Invalid token")
    
    response = client.post(
        "/api/auth/google-login",
        json={"token": "invalid-token"}
    )
    assert response.status_code == 401
