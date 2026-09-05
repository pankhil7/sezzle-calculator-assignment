import pytest


@pytest.mark.asyncio
async def test_percent_happy_path(client):
    async with client as c:
        response = await c.post("/api/percent", json={"a": 10, "b": 200})
    assert response.status_code == 200
    data = response.json()
    assert data["result"] == 20.0
    assert data["operation"] == "percent"


@pytest.mark.asyncio
async def test_percent_zero_rate(client):
    async with client as c:
        response = await c.post("/api/percent", json={"a": 0, "b": 200})
    assert response.status_code == 200
    assert response.json()["result"] == 0.0


@pytest.mark.asyncio
async def test_percent_persist_false_skips_history(client):
    async with client as c:
        response = await c.post("/api/percent?persist=false", json={"a": 10, "b": 100})
        assert response.status_code == 200
        assert response.json()["result"] == 10.0
        history = await c.get("/api/history")
    assert history.json() == []
