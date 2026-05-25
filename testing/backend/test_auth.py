import pytest
from passlib.context import CryptContext

# Auth Logic Helpers
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str):
    return pwd_context.hash(password)

def test_password_hashing():
    """Verify that password hashing works correctly"""
    password = "secret_password_123"
    hashed = get_password_hash(password)
    assert hashed != password
    assert verify_password(password, hashed) is True

def test_login_wrong_credentials(client):
    """Test login with incorrect credentials"""
    login_data = {"username": "invalid_user", "password": "wrong_password"}
    response = client.post("/api/auth/login", data=login_data)
    assert response.status_code == 401
    assert "detail" in response.json()

def test_root_endpoint(client):
    """Verify the root health check endpoint"""
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["status"] == "success"
