# Contributing to Liffto QR

Thanks for your interest in contributing! 🎉

## Getting started

```bash
git clone https://github.com/liffto/LifftoQR.git
cd LifftoQR

# point git at the version-controlled hooks (once per clone)
git config core.hooksPath .githooks

# frontend
npm install
npm run dev

# backend (separate shell)
cd api
python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload --port 8000
```

## Workflow

1. Create a feature branch from `main`: `git checkout -b feat/your-feature`
2. Make your changes.
3. Run `npm run format` before committing. The rest — lint, both test suites, and
   the build — run automatically on `git push` via `.githooks/pre-push`, which
   mirrors CI so a failure shows up here instead of in Actions ten minutes later.
   The push is aborted if anything fails; `git push --no-verify` skips the hook
   when you genuinely need it to.
4. Commit using [Conventional Commits](https://www.conventionalcommits.org/) (e.g. `feat: add SVG export`, `fix: correct gradient toggle`).
5. Push and open a Pull Request against `main`.

## Code style

- ESLint + Prettier are the source of truth. Run `npm run format` before pushing.
- `npm run lint` fails above **34 warnings**. There is no significance to that
  number beyond it being where the count stood when the ceiling went in — it
  exists so the count cannot quietly grow. If lint fails, fix the warning you
  added rather than raising the ceiling; lower it when you clear some out.
- Keep components small and colocate logic in `src/lib` where it isn't UI-specific.
- Match the conventions of the surrounding code.

## Reporting bugs

Open an issue with steps to reproduce, expected vs. actual behavior, and your environment (OS, Node version, browser).
