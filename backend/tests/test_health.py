from fastapi.testclient import TestClient
from src.search_jobs.main import app

client = TestClient(app)

def test_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["name"] == "Search-Jobs API"

def test_health_schema():
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert "status" in data
    assert "database" in data

