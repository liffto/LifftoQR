"""ASGI entrypoint for local uvicorn and Vercel.

Vercel looks for `app` in this file. The real FastAPI application (routes,
auth, CORS, etc.) lives in `app.main` — re-export it so production is not an
empty FastAPI shell.
"""

from app.main import app

__all__ = ["app"]
