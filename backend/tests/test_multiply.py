import pytest


@pytest.mark.asyncio
async def test_multiply_happy_path(client):
    async with client as c:
        response = await c.post("/api/multiply", json={"a": 6, "b": 7})
    assert response.status_code == 200
    data = response.json()
    assert data["result"] == 42
    assert data["operation"] == "multiply"


@pytest.mark.asyncio
async def test_multiply_overflow_returns_400(client):
    async with client as c:
        response = await c.post("/api/multiply", json={"a": 1e308, "b": 2})
    assert response.status_code == 400
    assert "computable range" in response.json()["detail"]


@pytest.mark.asyncio
async def test_multiply_persist_false_skips_history(client):
    async with client as c:
        response = await c.post("/api/multiply?persist=false", json={"a": 3, "b": 4})
        assert response.status_code == 200
        assert response.json()["result"] == 12
        history = await c.get("/api/history")
    assert history.json() == []
