"""The scan-series service that feeds the analytics graph.

The database grouping itself (date_trunc) is Postgres-only and is exercised
against a real Postgres locally; here the repository is mocked so the parts that
matter regardless of engine are pinned: every day in the window gets a bucket
(zeros included), the daily totals sum to the headline, the window-unique is the
repository's figure rather than a sum of daily uniques, and a code the user does
not own is refused.
"""

from datetime import datetime, timedelta, timezone
from types import SimpleNamespace
from unittest.mock import MagicMock

from app.services.qr_service import QrService


def _service(owned=True, rows=None, window_unique=0):
    repo = MagicMock()
    repo.get_by_id.return_value = SimpleNamespace(id=1) if owned else None
    repo.scan_series.return_value = rows or []
    repo.unique_scans_in_range.return_value = window_unique
    return QrService(repository=repo), repo


def test_unowned_code_returns_none():
    service, _ = _service(owned=False)
    assert service.scan_series(999, created_by=1, days=7) is None


def test_every_day_in_the_window_gets_a_bucket():
    service, _ = _service()
    out = service.scan_series(1, created_by=1, days=7)
    assert out["days"] == 7
    assert len(out["buckets"]) == 7
    # Contiguous, ascending, no gaps.
    dates = [b["date"] for b in out["buckets"]]
    assert dates == sorted(dates)
    assert len(set(dates)) == 7


def test_empty_days_are_zero_not_missing():
    service, _ = _service(rows=[])
    out = service.scan_series(1, created_by=1, days=5)
    assert all(b["scans"] == 0 and b["unique"] == 0 for b in out["buckets"])
    assert out["totalScans"] == 0


def test_daily_scans_sum_to_the_headline_total():
    today = datetime.now(timezone.utc).date()
    rows = [
        {"day": datetime.combine(today, datetime.min.time()), "total": 4, "unique": 2},
        {
            "day": datetime.combine(today - timedelta(days=1), datetime.min.time()),
            "total": 3,
            "unique": 1,
        },
    ]
    service, _ = _service(rows=rows, window_unique=2)
    out = service.scan_series(1, created_by=1, days=7)
    assert out["totalScans"] == 7  # 4 + 3


def test_window_unique_is_the_repository_figure_not_a_sum_of_days():
    # Two days each with 2 "unique" would sum to 4, but the same device on both
    # days is one visitor — the window figure (2) is what must surface.
    today = datetime.now(timezone.utc).date()
    rows = [
        {"day": datetime.combine(today, datetime.min.time()), "total": 5, "unique": 2},
        {
            "day": datetime.combine(today - timedelta(days=1), datetime.min.time()),
            "total": 5,
            "unique": 2,
        },
    ]
    service, _ = _service(rows=rows, window_unique=2)
    out = service.scan_series(1, created_by=1, days=7)
    assert out["uniqueScans"] == 2


def test_days_is_clamped_to_a_sane_range():
    service, repo = _service()
    service.scan_series(1, created_by=1, days=100000)
    # Whatever the caller asked for, the window handed to the repository is
    # bounded — a year at most.
    _, kwargs = repo.scan_series.call_args
    span = (kwargs["end"] - kwargs["start"]).days
    assert span <= 366
