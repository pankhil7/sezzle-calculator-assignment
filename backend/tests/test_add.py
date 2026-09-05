import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_add_happy_path(client):
    async with client as c:
        response = await c.post("/api/add", json={"a": 5, "b": 3})
    assert response.status_code == 200
    data = response.json()
    assert data["result"] == 8
    assert data["operation"] == "add"
    assert data["operand_a"] == 5
    assert data["operand_b"] == 3


@pytest.mark.asyncio
async def test_add_invalid_type_returns_422(client):
    async with client as c:
        response = await c.post("/api/add", json={"a": "hello", "b": 3})
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_add_response_shape(client):
    async with client as c:
        response = await c.post("/api/add", json={"a": 1, "b": 2})
    assert response.status_code == 200
    data = response.json()
    assert "operation" in data
    assert "operand_a" in data
    assert "operand_b" in data
    assert "result" in data


@pytest.mark.asyncio
async def test_add_float_precision(client):
    async with client as c:
        response = await c.post("/api/add", json={"a": 0.1, "b": 0.2})
    assert response.status_code == 200
    assert response.json()["result"] == 0.3


@pytest.mark.asyncio
async def test_add_persist_false_skips_history(client):
    async with client as c:
        response = await c.post("/api/add?persist=false", json={"a": 1, "b": 2})
        assert response.status_code == 200
        assert response.json()["result"] == 3
        history = await c.get("/api/history")
    assert history.json() == []
