import pytest


@pytest.mark.asyncio
async def test_power_happy_path(client):
    async with client as c:
        response = await c.post("/api/power", json={"a": 2, "b": 8})
    assert response.status_code == 200
    data = response.json()
    assert data["result"] == 256
    assert data["operation"] == "power"


@pytest.mark.asyncio
async def test_power_negative_base_fractional_exponent_returns_400(client):
    async with client as c:
        response = await c.post("/api/power", json={"a": -2, "b": 0.5})
    assert response.status_code == 400
    assert "fractional" in response.json()["detail"].lower()


@pytest.mark.asyncio
async def test_power_overflow_returns_400(client):
    async with client as c:
        response = await c.post("/api/power", json={"a": 1e308, "b": 2})
    assert response.status_code == 400
    assert "computable range" in response.json()["detail"]


@pytest.mark.asyncio
async def test_power_zero_base_negative_exponent_returns_400(client):
    async with client as c:
        response = await c.post("/api/power", json={"a": 0, "b": -1})
    assert response.status_code == 400
    assert "negative" in response.json()["detail"].lower()


@pytest.mark.asyncio
async def test_power_persist_false_skips_history(client):
    async with client as c:
        response = await c.post("/api/power?persist=false", json={"a": 2, "b": 3})
        assert response.status_code == 200
        assert response.json()["result"] == 8
        history = await c.get("/api/history")
    assert history.json() == []
