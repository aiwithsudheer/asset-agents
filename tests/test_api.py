"""Tests for the FastAPI application."""
import uuid
import pytest
from fastapi.testclient import TestClient

SAMPLE_PROFILE = {
    "name": "Jordan Lee",
    "age": 40,
    "risk_tolerance": "moderate",
    "annual_income": 110000,
    "assets": {"retirement_401k": 90000, "brokerage": 25000, "cash": 40000},
    "current_holdings": [
        {"symbol": "VTI", "shares": 30, "avg_cost": 200.0},
    ],
    "goal": "retire comfortably in 20 years",
    "concerns": ["inflation"],
}


@pytest.fixture
def client():
    from api.main import app
    return TestClient(app)


def test_health(client):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_start_session_returns_session_id(client):
    response = client.post("/session/start", json={"profile": SAMPLE_PROFILE})
    assert response.status_code == 200
    data = response.json()
    assert "session_id" in data
    assert len(data["session_id"]) == 36
    assert data["session_id"].count("-") == 4


def test_start_session_ids_are_unique(client):
    ids = {
        client.post("/session/start", json={"profile": SAMPLE_PROFILE}).json()["session_id"]
        for _ in range(5)
    }
    assert len(ids) == 5


def test_start_session_rejects_invalid_age(client):
    bad_profile = {**SAMPLE_PROFILE, "age": 15}
    response = client.post("/session/start", json={"profile": bad_profile})
    assert response.status_code == 422


def test_start_session_rejects_invalid_risk_tolerance(client):
    bad_profile = {**SAMPLE_PROFILE, "risk_tolerance": "yolo"}
    response = client.post("/session/start", json={"profile": bad_profile})
    assert response.status_code == 422


def test_websocket_rejects_unknown_session(client):
    """WebSocket must send an error and close for an unknown session_id."""
    with client.websocket_connect(f"/ws/{uuid.uuid4()}") as ws:
        msg = ws.receive_json()
        assert msg["type"] == "error"
        assert "Session not found" in msg["content"]


def test_websocket_sends_initial_client_message(client):
    """After a valid session is started, the WebSocket should immediately emit
    the client's opening message derived from the profile."""
    from agents.client_agent import build_initial_message

    session_id = client.post(
        "/session/start", json={"profile": SAMPLE_PROFILE}
    ).json()["session_id"]

    expected = build_initial_message(SAMPLE_PROFILE)

    with client.websocket_connect(f"/ws/{session_id}") as ws:
        first_msg = ws.receive_json()
        assert first_msg["type"] == "message"
        assert first_msg["agent"] == "client"
        assert first_msg["content"] == expected
