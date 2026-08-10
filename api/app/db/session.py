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
