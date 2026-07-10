# Development Prompt Guide

This file contains structured prompts designed to guide AI assistants through the implementation of the backend and frontend modules block-by-block.

---

## Phase 1: Database Setup and Connection

```text
Prompt:
"Act as a Principal Backend Engineer. Set up the database client boilerplate inside backend/database/. Initialize Prisma ORM with PostgreSQL client configuration inside backend/prisma/ schema. Create tables for User, ShortUrl, and Analytics following standard relations. DO NOT implement routes, middlewares or frontend components."
```

---

## Phase 2: Core Domain and Repositories

```text
Prompt:
"Act as a Principal Backend Engineer. Implement interfaces inside backend/src/interfaces/ for User and ShortUrl data operations. Write standard Postgres Repository implementations under backend/src/repositories/ matching those interfaces. Ensure separation of concerns using clean domain classes and DTO mappings."
```

---

## Phase 3: Business Logic Services

```text
Prompt:
"Act as a Principal Backend Engineer. Build core service business logic for URL shortening (base62 encoding, custom aliases), rate limit checks, and analytics logging inside backend/src/services/. Implement dependency injection so services receive repositories through constructor properties."
```

---

## Phase 4: Express API Controllers, Middleware & Routes

```text
Prompt:
"Act as a Principal Backend Engineer. Set up the main express app in backend/src/. Implement validation schemas using Joi/Zod in backend/src/validators/. Define HTTP controllers in backend/src/controllers/ and route configurations in backend/src/routes/. Create global error handlers and JWT auth guards in backend/src/middleware/."
```

---

## Phase 5: React SPA Dashboard Foundation

```text
Prompt:
"Act as a Staff Frontend Engineer. Configure the React application inside frontend/. Set up routing with React Router in frontend/src/routes/ including layouts (AuthLayout vs DashboardLayout). Establish global contexts for Theme and Session/Authentication under frontend/src/contexts/."
```
