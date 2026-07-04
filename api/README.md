# QR API

A lightweight FastAPI backend scaffold with layered architecture for controllers, services, repositories, and schemas.

## Application Setup

### Prerequisites

- Python 3.10+
- pip

### Installation

1. Clone the repository and navigate to the `api` directory:

```bash
cd api
```

2. A virtual environment is already created at `venv/`. Activate it:

```bash
source venv/bin/activate        # macOS/Linux
venv\Scripts\activate           # Windows
```

3. Install dependencies:

```bash
pip3 install -r requirements.txt
```

### Run with Uvicorn directly

```bash
source venv/bin/activate
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```


The server starts at `http://localhost:8000`.

Interactive API docs are available at:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Test

```bash
source venv/bin/activate
pytest -q
```
