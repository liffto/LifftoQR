"""Database session management."""

from __future__ import annotations

from collections.abc import Generator
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from app.config.settings import settings
from app.db.base_class import Base

engine = create_engine(
    settings.database_url,
    future=True,
    pool_pre_ping=True,
    # Neon (serverless Postgres) can close idle connections server-side;
    # recycling proactively avoids handing out a connection that's about to
    # be dropped, and the connect timeout bounds how long a broken network
    # path can hang a request instead of failing fast.
    pool_recycle=300,
    connect_args={"connect_timeout": 10},
    # Sized for how this actually runs, which is not one server. The API
    # deploys to Vercel as a serverless function, so every warm instance
    # holds its own pool and the real connection count is this ceiling times
    # however many instances are live. SQLAlchemy's defaults (5 + 10) let a
    # single instance reach fifteen, which multiplies badly.
    #
    # DATABASE_URL points at Neon's -pooler endpoint, so PgBouncer is already
    # multiplexing on the far side; a large client-side pool buys nothing and
    # only makes the multiplication worse.
    pool_size=5,
    max_overflow=5,
    # The default is 30s, which turns a momentarily exhausted pool into
    # requests that appear hung rather than failing. Ten seconds is long
    # enough to ride out a brief spike and short enough that the caller gets
    # an error it can act on.
    pool_timeout=10,
    echo=settings.debug,
)

SessionLocal = sessionmaker(
    bind=engine,
    autoflush=False,
    autocommit=False,
    future=True,
)


def get_db() -> Generator[Session, None, None]:
    """Yield a database session for each request."""
    db = SessionLocal()
    try:
        yield db
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()
