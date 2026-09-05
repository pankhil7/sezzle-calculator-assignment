import pytest


@pytest.mark.asyncio
async def test_subtract_happy_path(client):
    async with client as c:
        response = await c.post("/api/subtract", json={"a": 10, "b": 4})
    assert response.status_code == 200
    data = response.json()
    assert data["result"] == 6
    assert data["operation"] == "subtract"


@pytest.mark.asyncio
async def test_subtract_missing_operand_returns_422(client):
    async with client as c:
        response = await c.post("/api/subtract", json={"a": 5})
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_subtract_persist_false_skips_history(client):
    async with client as c:
        response = await c.post("/api/subtract?persist=false", json={"a": 10, "b": 3})
        assert response.status_code == 200
        assert response.json()["result"] == 7
        history = await c.get("/api/history")
    assert history.json() == []
