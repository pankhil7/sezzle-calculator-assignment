# Sezzle Calculator

A full-stack calculator application with a React/TypeScript frontend and a Python/FastAPI backend. All arithmetic is performed server-side; every finalised calculation is persisted to a SQLite database and displayed in a live history panel.

**Demo:** [Watch on Loom](https://www.loom.com/share/1dc7868d19854bc2b7d195d2dd18db25)

---

## Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        Browser                              │
│                                                             │
│  ┌─────────────────┐      ┌──────────────────────────────┐  │
│  │   React UI      │      │     useCalculator hook       │  │
│  │  Calculator     │─────▶│  state · handlers · chaining │  │
│  │  History        │      └──────────────┬───────────────┘  │
│  └─────────────────┘                     │                  │
│                                          ▼                  │
│                              ┌───────────────────────┐      │
│                              │    calculatorApi.ts   │      │
│                              │   Axios HTTP client   │      │
│                              └───────────┬───────────┘      │
└──────────────────────────────────────────┼──────────────────┘
                                           │ HTTP POST /api/*
                                           │ ?persist=true/false
┌──────────────────────────────────────────▼──────────────────┐
│                     FastAPI Backend                         │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │                   api/routes.py                     │    │
│  │                  Router registry                    │    │
│  └──┬────┬────┬────┬────┬─────┬────────┬──────────────┘    │
│     │    │    │    │    │     │        │                    │
│    add sub mul div pow sqrt  pct    history                 │
│     │    │    │    │    │     │                             │
│  ┌──▼────▼────▼────▼────▼─────▼──┐                         │
│  │       util/validators.py      │                         │
│  │   validate_numbers()          │                         │
│  │   validate_result()           │                         │
│  │   round_result()              │                         │
│  └───────────────────────────────┘                         │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │           CalculationRepository                     │    │
│  │       save · get_all · delete_all                   │    │
│  └────────────────────────┬────────────────────────────┘    │
└───────────────────────────┼─────────────────────────────────┘
                            │ async SQLAlchemy
                            ▼
                  ┌──────────────────┐
                  │     SQLite       │
                  │  calculator.db   │
                  └──────────────────┘
```

### Chained Operation Flow (`5 × 6 × 3 =`)

```
  User          React UI        useCalculator       FastAPI          SQLite
   │                │                 │                │               │
   │  5, ×, 6, ×   │                 │                │               │
   │───────────────▶│                 │                │               │
   │                │ handleOperator  │                │               │
   │                │ (chain detected)│                │               │
   │                │────────────────▶│                │               │
   │                │                 │ POST /multiply  │               │
   │                │                 │ ?persist=false  │               │
   │                │                 │────────────────▶│               │
   │                │                 │                 │  (skips save) │
   │                │                 │  {result: 30}   │               │
   │                │                 │◀────────────────│               │
   │                │                 │                 │               │
   │    3, =        │                 │                 │               │
   │───────────────▶│                 │                 │               │
   │                │  handleEquals() │                 │               │
   │                │────────────────▶│                 │               │
   │                │                 │ POST /multiply  │               │
   │                │                 │ (persist=true)  │               │
   │                │                 │────────────────▶│               │
   │                │                 │                 │─── save() ───▶│
   │                │                 │  {result: 90}   │               │
   │                │                 │◀────────────────│               │
   │                │  display 90     │                 │               │
   │                │◀────────────────│                 │               │
   │                │  refresh history│                 │               │
   │                │────────────────▶│                 │               │
   │                │                 │ GET /history    │               │
   │                │                 │────────────────▶│               │
   │                │                 │◀────────────────│               │
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Vite, Axios |
| Backend | Python 3.12, FastAPI, SQLAlchemy (async), SQLite / aiosqlite |
| Testing (FE) | Vitest, Testing Library |
| Testing (BE) | pytest, pytest-asyncio, httpx |
| Containerisation | Docker, Docker Compose, nginx |

---

## Local Development (without Docker)

### Prerequisites
- Python 3.12+
- Node.js 18+

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

API available at `http://localhost:8000`.
Interactive docs: `http://localhost:8000/docs`

> SQLite requires no setup — the database file (`calculator.db`) is created automatically on first start.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

App available at `http://localhost:5173`.
The Vite dev server proxies all `/api/*` requests to the backend, so both services must be running.

---

## Docker

Run everything from the project root:

```bash
docker compose up --build
```

| Service | URL |
|---|---|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:8000 |

```bash
docker compose down   # stop
```

---

## API Reference

All endpoints are prefixed with `/api`. Every operation endpoint accepts an optional `?persist=false` query parameter — when set, the result is computed and returned but **not** saved to history. The frontend uses this for intermediate chain steps so only the final `=` result appears in history.

### Add

```bash
curl -X POST http://localhost:8000/api/add \
  -H "Content-Type: application/json" \
  -d '{"a": 5, "b": 3}'
# {"operation":"add","operand_a":5.0,"operand_b":3.0,"result":8.0}
```

### Subtract

```bash
curl -X POST http://localhost:8000/api/subtract \
  -H "Content-Type: application/json" \
  -d '{"a": 10, "b": 4}'
# {"operation":"subtract","operand_a":10.0,"operand_b":4.0,"result":6.0}
```

### Multiply

```bash
curl -X POST http://localhost:8000/api/multiply \
  -H "Content-Type: application/json" \
  -d '{"a": 6, "b": 7}'
# {"operation":"multiply","operand_a":6.0,"operand_b":7.0,"result":42.0}
```

### Divide

```bash
curl -X POST http://localhost:8000/api/divide \
  -H "Content-Type: application/json" \
  -d '{"a": 10, "b": 2}'
# {"operation":"divide","operand_a":10.0,"operand_b":2.0,"result":5.0}
```

Division by zero → HTTP 400:

```bash
curl -X POST http://localhost:8000/api/divide \
  -H "Content-Type: application/json" \
  -d '{"a": 5, "b": 0}'
# HTTP 400 {"detail":"Division by zero"}
```

### Power

```bash
curl -X POST http://localhost:8000/api/power \
  -H "Content-Type: application/json" \
  -d '{"a": 2, "b": 10}'
# {"operation":"power","operand_a":2.0,"operand_b":10.0,"result":1024.0}
```

### Square Root (unary)

```bash
curl -X POST http://localhost:8000/api/sqrt \
  -H "Content-Type: application/json" \
  -d '{"a": 16}'
# {"operation":"sqrt","operand_a":16.0,"operand_b":null,"result":4.0}
```

Square root of a negative → HTTP 400:

```bash
curl -X POST http://localhost:8000/api/sqrt \
  -H "Content-Type: application/json" \
  -d '{"a": -9}'
# HTTP 400 {"detail":"Cannot take square root of a negative number"}
```

### Percent (`a`% of `b`)

```bash
curl -X POST http://localhost:8000/api/percent \
  -H "Content-Type: application/json" \
  -d '{"a": 10, "b": 200}'
# {"operation":"percent","operand_a":10.0,"operand_b":200.0,"result":20.0}
```

### Chained operations (`?persist=false`)

Intermediate chain steps are computed but not saved to history. Only the final `=` call persists:

```bash
# Step 1: 5 × 6 = 30 (intermediate — not saved)
curl -X POST "http://localhost:8000/api/multiply?persist=false" \
  -H "Content-Type: application/json" \
  -d '{"a": 5, "b": 6}'
# {"operation":"multiply","operand_a":5.0,"operand_b":6.0,"result":30.0}

# Step 2: 30 + 20 = 50 (intermediate — not saved)
curl -X POST "http://localhost:8000/api/add?persist=false" \
  -H "Content-Type: application/json" \
  -d '{"a": 30, "b": 20}'
# {"operation":"add","operand_a":30.0,"operand_b":20.0,"result":50.0}

# Step 3: 50 ÷ 2 = 25 (final = pressed — saved to history)
curl -X POST http://localhost:8000/api/divide \
  -H "Content-Type: application/json" \
  -d '{"a": 50, "b": 2}'
# {"operation":"divide","operand_a":50.0,"operand_b":2.0,"result":25.0}
```

History will contain only the final entry (`50 ÷ 2 = 25`), not the two intermediate steps.

### History

```bash
# Get last 50 calculations (most recent first)
curl http://localhost:8000/api/history

# Clear all history
curl -X DELETE http://localhost:8000/api/history
# {"message":"History cleared"}
```

---

## Running Tests

### Backend

```bash
cd backend
source .venv/bin/activate
pytest tests/ -v
```

Test files mirror the `api/` structure:

| File | Covers |
|---|---|
| `tests/test_add.py` | Addition endpoint |
| `tests/test_subtract.py` | Subtraction endpoint |
| `tests/test_multiply.py` | Multiplication endpoint |
| `tests/test_divide.py` | Division endpoint + divide-by-zero |
| `tests/test_power.py` | Power endpoint + edge cases |
| `tests/test_sqrt.py` | Square root endpoint + negative input |
| `tests/test_percent.py` | Percent endpoint |
| `tests/test_history.py` | History GET / DELETE endpoints |

With coverage:

```bash
pytest --cov=. --cov-report=term-missing
```

**Backend coverage: 97%**

| Module | Coverage |
|---|---|
| `api/` (all endpoints) | 86–100% |
| `db/repository.py` | 100% |
| `db/database.py` | 100% |
| `util/validators.py` | 100% |
| `models/` | 100% |
| Overall | **97%** |

### Frontend

```bash
cd frontend
npm test                        # single run
npm run test:watch              # watch mode
npm test -- --coverage --run    # with coverage report
```

**Frontend coverage: 97% statements / 91% branches**

| File | Covers |
|---|---|
| `src/tests/App.test.tsx` | Root layout renders both panels |
| `src/tests/Calculator.test.tsx` | Rendering, input, operators, chaining, repeat =, error display |
| `src/tests/Display.test.tsx` | Result display, error state, loading state, font scaling |
| `src/tests/History.test.tsx` | Fetch, format all operations, clear, empty state, error handling |
| `src/tests/calculatorApi.test.ts` | HTTP calls, persist flag (true/false) |
| `src/tests/errorMessages.test.ts` | All error mappings, 422 Pydantic array detail, fallbacks |

---

## Design Decisions

### Separate endpoint per operation
Each arithmetic operation has its own `POST /api/<op>` endpoint rather than a single `/calculate?op=add` endpoint. This isolates business logic so that a change to one operation cannot affect others, makes per-operation error handling explicit, and makes it trivial to add or remove operations independently.

### `?persist=false` for chained operations
When the user chains operations (e.g. `5 × 6 × 3 =`), the frontend makes a sequential API call for each intermediate step. Intermediate calls pass `?persist=false` so only the final `=` result is saved to history — matching industry-standard calculator behaviour where history shows one entry per completed calculation, not every intermediate step.

### Repository pattern
All database access is centralised in `CalculationRepository`. Endpoints depend on the repository interface, not on SQLAlchemy directly. This keeps endpoints readable, makes the DB layer easy to swap, and simplifies testing.

### Frontend never computes
The React UI is a pure presentation layer. Every operator or `=` press fires an HTTP request to the backend. This enforces a single source of truth for results and ensures every finalised calculation is automatically persisted — the frontend cannot diverge from the backend.

### Float precision
Results are rounded to 10 decimal places via `round_result()` before being returned. This prevents floating-point artefacts like `0.1 + 0.2 = 0.30000000000004` from reaching the UI.

### SQLite with aiosqlite
SQLite requires zero infrastructure — no separate database process. Aiosqlite keeps the FastAPI async event loop non-blocking. For an assignment-scoped application the concurrency limitations of SQLite are not a concern.

### Python over Go
The assignment lists Go as the preferred backend language. Python with FastAPI was chosen because:
- FastAPI is idiomatic, async-native, and produces clean, readable code comparable to Go's `net/http` / Gin
- Pydantic provides first-class request/response validation with minimal boilerplate
- The architecture (repository pattern, split endpoints, validators) would translate directly to Go with equivalent clarity
- The focus of the assignment — correctness, clarity, and maintainability — is fully demonstrated in Python

---

## Directory Structure

```
sezzle-assignment/
├── frontend/                  # React + TypeScript + Vite
│   ├── src/
│   │   ├── components/        # Calculator, Display, Button, History, useCalculator hook
│   │   ├── constants/         # OP_MAP and OP_SYMBOLS shared across calculator logic
│   │   ├── services/          # Axios API client (calculatorApi, logger)
│   │   ├── util/              # Error message mapping
│   │   ├── types/             # Shared TypeScript interfaces
│   │   └── tests/             # Vitest + Testing Library tests
│   ├── vite.config.ts         # Vite config with API proxy + Vitest settings
│   └── nginx.conf             # nginx config for Docker image
│
├── backend/                   # Python + FastAPI
│   ├── api/                   # Route handlers — one file per operation
│   ├── util/                  # Input/result validators + rounding
│   ├── models/                # request.py, response.py, calculation.py (ORM)
│   ├── db/                    # Async engine, session factory, repository
│   ├── tests/                 # pytest suite — one file per endpoint
│   └── main.py                # FastAPI app, CORS, lifespan, request logging
│
├── Dockerfile.backend
├── Dockerfile.frontend        # Multi-stage Node → nginx
├── docker-compose.yml
└── README.md
```

---

## AI Tooling

This project was built with **Claude (claude-sonnet-4-6)** as an AI coding assistant. Below is the complete log of prompts used during development.

### Initial Scoping

1. "dont build it first tell me about the assignment"
2. "ask me ambiguities you have before building"
3. "ask me 1 by 1"
4. "give me pros and cons" — on separate vs shared API endpoints
5. "i think separate is better as if business logic change it can be done in 1 endpoint without any regression"
6. "ye" — confirmed button grid UI
7. "yes but prepare backend api for it and use a db to store it and let frontend call it" — history feature
8. "yes do it" — optional operations (exponentiation, sqrt, percent)
9. "yes use sqlite"
10. "use python instead"
11. "use fast api"
12. "yes do it" — docker support

### Architecture Decisions

13. "yes but before build try with below directory structure frontend/ , backend/api/ , backend/util/ etc"
14. "endpoints/ remove this and have all endpoints under api/ only"
15. "i want you to split calculator.py in different api since multiple apis are there"
16. "should we consider using design patterns?"
17. "Clean, readable, and idiomatic code (frontend and backend) in requirement this is there" — prompted repository pattern discussion
18. "do it" — repository pattern
19. "do i need math_ops? i dont think so" — removed unnecessary abstraction
20. "in calculation.py under models can you split into models/request and model/response?"

### Iterative Improvements

21. "can you add logs as well at important places for logging using libraries?"
22. "can you throw user friendly message when divide by 0 is triggered?"
23. "but in backend shouldn't we used technical errors whereas in frontend transform them?"
24. "Float precision... datetime.utcnow()... do this. Calculator state logic... split this. No loading state... fix this also."
25. "isn't this too much overloaded" — on the monolithic calculatorApi calculate function
26. "i meant why can't we segregate into addapicall, subtractapicall, etc?"
27. "why did you had hooks folder?" — moved useCalculator co-located with Calculator

### Edge Cases

28. "is every possible edge case is being covered?"
29. "Negative base with fractional exponent... User presses = with no input... operator twice... . as first input... +/- on empty display... Very long input — handle these"
30. "which cases you will revert back?" — discussed silent vs noisy failures
31. "but if use just - then it will confuse user with +/-"
32. "does + have any significance in +/-?"

### Chained Operations

33. "when i am using multiple chains like 5×6×3495 this is not correctly working. should we cater to this?"
34. "but why didn't we support it? real calculators are built on this right?"
35. "should we solve it as part of requirements?"
36. "i think we should solve it. try to think of industry wide edge cases which are being solved and tell me the approach"
37. "why aren't you aligned with backend approach?" — discussed frontend vs backend chaining
38. "before doing this what is industry wide practice here? is it being done in backend or frontend?"
39. "yes do it" — implement chaining in frontend via sequential API calls

### History Behaviour Fix

40. "History Clear History 4200 ÷ 23... why chained operations are being shown as different line items?"
41. "what is industry wide practice here?" — on history grouping
42. "yes do it" — Pattern 1: persist=false for chain steps, only final = saved to history

### Sqrt History Behaviour

43. "okk for squareroot i haven't clicked = but still it showed up in history"
44. "but else after doing sqrt i need to add in chained operation then?"
45. "what is the industry wide practice here?" — sqrt is a complete self-contained calculation, industry standard is immediate history entry
46. "let it be" — kept current behaviour
