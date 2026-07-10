# Changelog

All notable changes to this project will be documented in this file.

## [1.0.0] - 2026-07-10

### Added
- **Backend Architecture:** Express TypeScript foundation with centralized Winston logging, unique request ID tracing, Helmet header security, and customized global operational error handling.
- **Database Schema:** PostgreSQL data modeling utilizing Prisma ORM with distinct tables and indices for `Link` and `Click` entities.
- **Graceful Startup/Shutdown:** Complete lifecycle hooks closing HTTP server connections, PostgreSQL clients, and Redis clients on process interrupts (`SIGTERM`/`SIGINT`).
- **Repository Pattern:** Separated persistence layers (`LinkRepository`, `ClickRepository`) carrying database-level `groupBy` statistics queries and pagination helpers.
- **Request Validation Middleware:** Integrated Zod schemas validation blocking invalid payloads prior to controller execution.
- **URL Shortening Engine:** Generates deterministic 6-character Base62 slugs from random 32-bit positive integers, incorporating uniqueness collision retries.
- **High-Performance Redirect Engine:** Configured Redis-first read operations (O(1), 1-hour TTL) falling back to PostgreSQL, and executing click audits asynchronously in the background.
- **Telemetry Analytics API:** Dashboard endpoints serving links state status, timelines, device breakdown stats (browsers, OS, countries, referrers), and period-over-period click growth velocity.
- **AI Alias Suggestions:** Integrated Google Gemini API (`gemini-2.5-flash`) JSON Schema mode with exponential backoff retries and local fallback suggestions.
- **Swagger Documentation:** OpenAPI 3.0 specification page served dynamically under `/api/docs`.
- **Integration Test Suite:** Built 17 mock-isolated integration tests achieving 80%+ line coverage.
