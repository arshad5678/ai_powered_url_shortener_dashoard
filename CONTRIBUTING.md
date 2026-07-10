# Contributing to bookingjini-ai-url-shortener

Thank you for your interest in contributing to this project! Please review the guidelines below to ensure a smooth collaboration process.

## Getting Started

1. **Fork the Repository:** Create a personal copy of the repository on GitHub.
2. **Clone Locally:** Clone your fork to your local workstation.
3. **Environment Setup:** Set up your `.env` variables and start local services (PostgreSQL, Redis) via Docker Compose.
4. **Install Dependencies:** Run `npm install` inside both the `backend/` and `frontend/` folders.

## Code Style & Guidelines

- **TypeScript:** Enforce strict type definitions. Avoid using `any`.
- **Linting & Formatting:** Ensure code adheres to standards:
  * Backend: Run `npm run lint` and `npm run format`.
  * Frontend: Run ESLint checks and format using Prettier.
- **Clean Architecture:** Keep business logic encapsulated inside Services, data persistence inside Repositories, and HTTP routers inside Controllers.

## Testing Requirements

Before proposing changes, ensure that the Jest test suite compiles and runs cleanly with 100% success:
```bash
cd backend
npm run typecheck
npm test
```
All new features should include corresponding integration test blocks inside `backend/tests/api.test.ts`. We target **80%+ statement/line coverage**.

## Branching & Commit Conventions

- **Branch Naming:**
  * Features: `feature/short-description`
  * Bug Fixes: `bugfix/short-description`
  * Documentation: `docs/short-description`
- **Commit Messages:**
  Use clear, descriptive commit subjects. For example:
  `feat: integrate gemini alias suggestion route` or `fix: handle expired link redirection bounds`.

## Pull Request Process

1. Rebase your branch against the latest `main` branch.
2. Open a Pull Request detailing the changes, reasoning, and validation results.
3. Once the test suite passes and review checks are complete, your branch will be merged.
