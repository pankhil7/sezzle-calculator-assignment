import pytest


@pytest.mark.asyncio
async def test_history_initially_empty(client):
    async with client as c:
        response = await c.get("/api/history")
    assert response.status_code == 200
    assert response.json() == []


@pytest.mark.asyncio
async def test_history_shows_item_after_add(client):
    async with client as c:
        await c.post("/api/add", json={"a": 4, "b": 6})
        response = await c.get("/api/history")
    assert response.status_code == 200
    items = response.json()
    assert len(items) == 1
    item = items[0]
    assert item["operation"] == "add"
    assert item["operand_a"] == 4
    assert item["operand_b"] == 6
    assert item["result"] == 10
    assert "id" in item
    assert "created_at" in item


@pytest.mark.asyncio
async def test_delete_history_returns_success(client):
    async with client as c:
        await c.post("/api/add", json={"a": 1, "b": 2})
        response = await c.delete("/api/history")
    assert response.status_code == 200
    assert response.json()["message"] == "History cleared"


@pytest.mark.asyncio
async def test_delete_history_clears_all(client):
    async with client as c:
        await c.post("/api/add", json={"a": 1, "b": 2})
        await c.post("/api/multiply", json={"a": 3, "b": 4})
        await c.delete("/api/history")
        response = await c.get("/api/history")
    assert response.status_code == 200
    assert response.json() == []
