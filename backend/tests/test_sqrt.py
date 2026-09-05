import pytest


@pytest.mark.asyncio
async def test_sqrt_happy_path(client):
    async with client as c:
        response = await c.post("/api/sqrt", json={"a": 16})
    assert response.status_code == 200
    data = response.json()
    assert data["result"] == 4.0
    assert data["operation"] == "sqrt"
    assert data.get("operand_b") is None


@pytest.mark.asyncio
async def test_sqrt_negative_returns_400(client):
    async with client as c:
        response = await c.post("/api/sqrt", json={"a": -9})
    assert response.status_code == 400
    assert "negative" in response.json()["detail"].lower()


@pytest.mark.asyncio
async def test_sqrt_persist_false_skips_history(client):
    async with client as c:
        response = await c.post("/api/sqrt?persist=false", json={"a": 9})
        assert response.status_code == 200
        assert response.json()["result"] == 3.0
        history = await c.get("/api/history")
    assert history.json() == []
