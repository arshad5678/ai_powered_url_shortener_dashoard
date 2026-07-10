# Architectural Trade-offs

This document outlines the architectural trade-offs analyzed during the planning phase of the AI-Powered URL Shortener Dashboard.

## 1. Clean Architecture vs. Feature-based Nesting (Monolithic structure)
- **Trade-off:**
  - **Clean Architecture:** Standardizes directories by layers (`controllers`, `services`, `repositories`). Excellent separation of concerns, easy to substitute layers (e.g. swap database or framework). However, it adds file-navigation overhead (creating/modifying a single feature requires editing files across 4-5 different directories).
  - **Feature-based Structure:** Combines routes, controllers, and services inside a single `src/features/urls/` folder. Extremely high cohesion, but harder to enforce strict separation of presentation from business logic.
- **Decision:** Use Layer-based Clean Architecture matching the enterprise-grade project structure requirements, supplemented by distinct type interfaces to maintain contracts between layers.

## 2. Relational Database (PostgreSQL) vs. Document Store (MongoDB)
- **Trade-off:**
  - **Relational DB (via Prisma):** Strong integrity constraint support, simple indexing on key relations (e.g., matching users to short URLs), strict schema mapping.
  - **NoSQL Store:** High write throughput. Excellent for massive click analytics logging but lacks built-in referential integrity.
- **Decision:** Utilize PostgreSQL for core link-mapping and user accounts where consistency is key. We abstract data storage behind `repositories` so that audit logging or analytics can later be offloaded to a NoSQL engine or TimescaleDB without touching business logic.

## 3. Client-Side Rendering (Vite + React) vs. Server-Side Rendering (Next.js)
- **Trade-off:**
  - **Vite React SPA:** Static hosting capability, client-side rich dashboard interactions without server execution overhead. Fast page-to-page navigation after initial asset bundle load.
  - **Next.js SSR:** Excellent SEO. Useful if short link redirection is handled directly by the frontend, but adds backend compute requirements for server component rendering.
- **Decision:** Vite SPA is selected. The short URL resolution backend handles high-speed redirection, while the dashboard is purely an interactive client administrative interface.
