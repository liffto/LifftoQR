# Contributing to Liffto QR

Thanks for your interest in contributing! 🎉

## Getting started

```bash
git clone https://github.com/<your-username>/liffto-qr.git
cd liffto-qr
npm install
npm run dev
```

## Workflow

1. Create a feature branch from `main`: `git checkout -b feat/your-feature`
2. Make your changes.
3. Run the checks locally before committing:
   ```bash
   npm run lint
   npm run format
   npm run test
   npm run build
   ```
4. Commit using [Conventional Commits](https://www.conventionalcommits.org/) (e.g. `feat: add SVG export`, `fix: correct gradient toggle`).
5. Push and open a Pull Request against `main`.

## Code style

- ESLint + Prettier are the source of truth. Run `npm run format` before pushing.
- Keep components small and colocate logic in `src/lib` where it isn't UI-specific.
- Match the conventions of the surrounding code.

## Reporting bugs

Open an issue with steps to reproduce, expected vs. actual behavior, and your environment (OS, Node version, browser).
