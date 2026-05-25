import pytest

def test_issuer_analytics_unauthorized(client):
    """Ensure issuer analytics is protected"""
    response = client.get("/api/analytics/issuer")
    assert response.status_code == 401

def test_admin_analytics_unauthorized(client):
    """Ensure admin analytics is protected"""
    response = client.get("/api/analytics/admin")
    assert response.status_code == 401
