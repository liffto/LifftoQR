"""Refuse to serve against a database the code has outrun.

Migrations here are applied by hand, so nothing stopped a deploy shipping code
that reads a column the production database does not have yet. The failure that
produced was a 500 from somewhere deep in a query, minutes or hours later, with
nothing in it that said "you forgot to migrate".

So the app asks one question at startup: is the database's Alembic revision the
one this code was written against? If it is behind, the app refuses to start
and says exactly which revisions are missing. Nothing is applied automatically
— a migration that runs itself during a deploy can wedge production with no way
back, and schema changes are the one thing Vercel cannot roll back for you.

Deliberately *not* fatal when the answer cannot be determined. A database that
is briefly unreachable, or a checkout with no migration files, must not take
the API down on top of whatever is already wrong — that turns a blip into an
outage. Only a confirmed mismatch stops the app.
"""

from __future__ import annotations

import logging
from pathlib import Path

from alembic.config import Config
from alembic.script import ScriptDirectory
from sqlalchemy import text

from app.db.session import engine

log = logging.getLogger(__name__)

# api/app/db/schema_check.py -> api/
_API_ROOT = Path(__file__).resolve().parent.parent.parent
_ALEMBIC_INI = _API_ROOT / "alembic.ini"


class SchemaBehindError(RuntimeError):
    """The database is missing migrations this code needs."""


def _code_head() -> str | None:
    """The newest revision on disk, or None if the files are not here."""
    if not _ALEMBIC_INI.exists():
        return None
    cfg = Config(str(_ALEMBIC_INI))
    cfg.set_main_option("script_location", str(_API_ROOT / "migrations"))
    heads = ScriptDirectory.from_config(cfg).get_heads()
    if len(heads) != 1:
        # Branched history is a repo problem, not a deploy problem; say so and
        # let the app run rather than blocking on an ambiguous comparison.
        log.warning("alembic history has %d heads, skipping schema check", len(heads))
        return None
    return heads[0]


def _db_revision() -> str | None:
    with engine.connect() as conn:
        return conn.execute(text("SELECT version_num FROM alembic_version")).scalar()


def _missing_between(db_rev: str | None, head: str) -> list[str]:
    """Revisions the database still needs, newest first."""
    cfg = Config(str(_ALEMBIC_INI))
    cfg.set_main_option("script_location", str(_API_ROOT / "migrations"))
    script = ScriptDirectory.from_config(cfg)
    return [r.revision for r in script.iterate_revisions(head, db_rev) if r.revision != db_rev]


def verify_schema_is_current() -> None:
    """Raise SchemaBehindError if the database is missing migrations."""
    try:
        head = _code_head()
        if head is None:
            return
        db_rev = _db_revision()
    except SchemaBehindError:
        raise
    except Exception as exc:
        log.warning("could not verify database schema (%s); continuing", exc)
        return

    if db_rev == head:
        log.info("database schema is current (%s)", head)
        return

    missing = []
    try:
        missing = _missing_between(db_rev, head)
    except Exception:
        # An unrecognised revision usually means the database is *ahead* — a
        # rollback of the code without a rollback of the schema. That is not
        # what this guard is for, and refusing to boot would strand the older
        # code that is otherwise fine, so warn instead.
        log.warning(
            "database revision %r is not in this code's history; "
            "the schema may be ahead of the code",
            db_rev,
        )
        return

    raise SchemaBehindError(
        f"Database schema is behind the code: it is at "
        f"{db_rev or '(no migrations applied)'} but this build needs {head}. "
        f"Missing: {', '.join(missing) or head}. "
        f"Apply them with `npm run migrate:prod` (or "
        f"`DATABASE_URL=... alembic upgrade head` from api/) and redeploy."
    )
