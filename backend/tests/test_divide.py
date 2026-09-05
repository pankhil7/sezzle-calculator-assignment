import pytest


@pytest.mark.asyncio
async def test_divide_happy_path(client):
    async with client as c:
        response = await c.post("/api/divide", json={"a": 10, "b": 2})
    assert response.status_code == 200
    data = response.json()
    assert data["result"] == 5
    assert data["operation"] == "divide"


@pytest.mark.asyncio
async def test_divide_by_zero_returns_400(client):
    async with client as c:
        response = await c.post("/api/divide", json={"a": 5, "b": 0})
    assert response.status_code == 400
    assert "Division by zero" in response.json()["detail"]


@pytest.mark.asyncio
async def test_divide_decimal_result(client):
    async with client as c:
        response = await c.post("/api/divide", json={"a": 10, "b": 4})
    assert response.status_code == 200
    assert response.json()["result"] == 2.5


@pytest.mark.asyncio
async def test_divide_persist_false_skips_history(client):
    async with client as c:
        response = await c.post("/api/divide?persist=false", json={"a": 8, "b": 2})
        assert response.status_code == 200
        assert response.json()["result"] == 4
        history = await c.get("/api/history")
    assert history.json() == []
