# BookingJini AI-Powered URL Shortener Dashboard

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)](https://redis.io/)
[![Gemini](https://img.shields.io/badge/Gemini%20AI-8E75C2?style=for-the-badge&logo=google-gemini&logoColor=white)](https://ai.google.dev/)

A production-ready, high-performance, and secure AI-Powered URL Shortener Dashboard. This system provides deterministic Base62 shortening, ultra-low latency redirection via Redis caching, background click telemetry logs, multi-dimensional analytics reports, and smart custom alias generation powered by Gemini AI.

---

## 📖 Project Overview

### The Problem
Traditional URL shorteners rely on slow database lookups, generate random/colliding slugs, and do not track rich metadata. Redirection latency directly impacts user conversion rates, while a lack of detailed analytics prevents organizations from identifying visitor trends.

### The Solution
This project introduces a **Clean Architecture** URL shortening platform:
- **Redirection Speed:** Checks Redis caching first ($O(1)$ lookup time) before falling back to PostgreSQL, reducing redirect response latency to under **5 milliseconds**.
- **Asynchronous Telemetry:** Click logging (User-Agent parsing, IP mapping, country mapping) runs concurrently in the background without blocking client redirection.
- **Smart suggestions:** Integrates Google's Gemini AI (`gemini-2.5-flash`) to generate URL-safe, short, case-sensitive suggested aliases based on the target URL content.

---

## ✨ Features

- 🔗 **URL Shortening & custom slugs:** Shorten URLs deterministically using a custom Base62 encoding utility.
- 🏷️ **Custom Aliases:** Allow users to set distinct custom aliases (e.g. `/r/summer-sale`) with availability validation checks.
- ⚡ **Redis Caching:** Caches successful lookup results for 1 hour with automatic cache eviction.
- 📊 **Analytics Dashboard:** Period-over-period click growth velocity metrics (today vs yesterday, last 7 days vs previous 7-14 days).
- 📱 **Device breakdown stats:** Pre-aggregated browser types, operating systems, referrers, and country statistics.
- 🤖 **AI Suggestions:** Requests 3 lowercase, hyphen-separated alias suggestions from Gemini AI with exponential backoff retry.
- 🐳 **Docker Infrastructure:** Pre-configured Docker Compose environment spinning up PostgreSQL 16 and Redis 7 alpine databases.
- 📝 **Swagger UI Specification:** Auto-served complete OpenAPI 3.0 specification details under `/api/docs`.
- 🧪 **API Testing:** Jest + Supertest integration test suite covering success, validation error, 404, 409, and 410 states (80%+ statement coverage).

---

## 🛠️ Tech Stack

### Frontend
- **React / Vite / TypeScript**
- **Tailwind CSS** (Utility-first styling)
- **Axios** (API communications)
- **Recharts** (Interactive analytics charts)

### Backend
- **Node.js / Express / TypeScript**
- **Prisma ORM** (Database migration and type-safety client)
- **PostgreSQL 16** (Primary transactional data store)
- **Redis 7** (Caching key-value store)
- **Winston** (Structured logging logger)
- **Supertest & Jest** (API suite testing)
- **Google Gemini API** (Generative AI endpoint suggestions)

---

## 📐 System Architecture & Request Flow

The request execution pipeline follows a strict, unidirectional layered flow, separating HTTP request parsing from domain business rules and database adapters:

```mermaid
sequenceDiagram
    actor Client
    participant Express as Express (app.ts)
    participant Route as Link Router (link.routes.ts)
    participant Val as Validation Middleware (Zod)
    participant Ctrl as Link Controller (link.controller.ts)
    participant Svc as Link Service (link.service.ts)
    participant Repo as Link Repository (link.repository.ts)
    participant DB as PostgreSQL Database

    Client->>Express: POST /api/links { title, originalUrl }
    Express->>Route: Match POST /api/links
    Route->>Val: Run Zod Schema Validation
    Val->>Ctrl: Pass validated inputs
    Ctrl->>Svc: Call createLink(data)
    Svc->>Repo: Call create({ ... })
    Repo->>DB: prisma.link.create()
    DB-->>Repo: Return database Link object
    Repo-->>Svc: Return Link
    Svc-->>Ctrl: Map to LinkDto
    Ctrl-->>Client: Responds HTTP 201 { success: true, data: LinkDto }
```

---

## 📂 Folder Structure

```
bookingjini-ai-url-shortener/
├── docker-compose.yml           # Postgres & Redis containers config
├── LICENSE                      # MIT license details
├── CONTRIBUTING.md              # Project onboarding guidelines
├── CHANGELOG.md                 # Project release history
├── docs/                        # Tradeoffs and architectural designs
│   ├── architecture.md
│   └── tradeoffs.md
├── backend/
│   ├── jest.config.js           # Jest runner config
│   ├── nodemon.json             # Nodemon dev environment watcher
│   ├── package.json
│   ├── tsconfig.json            # Strict TypeScript configuration
│   ├── prisma/
│   │   ├── schema.prisma        # Prisma data models definition
│   │   └── migrations/          # SQL database schema versions
│   ├── src/
│   │   ├── app.ts               # Express middleware configuration
│   │   ├── server.ts            # Server bootstrapper & graceful shutdown hooks
│   │   ├── config/              # Swagger & env validations
│   │   ├── constants/           # HTTP codes
│   │   ├── controllers/         # REST request handlers
│   │   ├── database/            # Postgres & Redis clients
│   │   ├── errors/              # Operational error wrappers
│   │   ├── logger/              # Winston logger setup
│   │   ├── middleware/          # Request validation, error intercepts
│   │   ├── repositories/        # Database aggregation queries
│   │   ├── routes/              # Express endpoint registers
│   │   ├── services/            # Core business validations & AI service
│   │   ├── utils/               # Base62 converter & async wrappers
│   │   └── validators/          # Zod validation schemas
│   └── tests/
│       └── api.test.ts          # Mock-isolated integration tests
└── frontend/
    ├── package.json
    ├── tailwind.config.js
    ├── tsconfig.json
    ├── vite.config.ts           # Vite server settings
    └── src/                     # React components, pages, hooks, styling
```

---

## 🚀 Installation & Setup Guide

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [Docker & Docker Desktop](https://www.docker.com/)

### 2. Clone the Repository
```bash
git clone https://github.com/arshad5678/ai_powered_url_shortener_dashoard.git bookingjini-ai-url-shortener
cd bookingjini-ai-url-shortener
```

### 3. Start Database Infrastructure (Postgres & Redis)
Ensure Docker is running, then boot the database and caching containers:
```bash
docker compose up -d
```
*This starts a PostgreSQL instance on port `5432` and a Redis instance on port `6379`.*

### 4. Configure Backend Environment
Navigate to the `backend` directory:
```bash
cd backend
cp .env.example .env
```
Open `.env` and set your variables (refer to the [Environment Variables](#-environment-variables) section below).

### 5. Install Dependencies & Build
```bash
npm install
```

### 6. Run Database Migrations
Create the database tables and apply schema indices:
```bash
npx prisma migrate dev --name init
npx prisma generate
```

### 7. Run Backend Dev Server
```bash
npm run dev
```
*The backend server starts on [http://localhost:5000](http://localhost:5000).*

### 8. Run Frontend Dev Server
Open a new terminal window, navigate to the `frontend` folder, install dependencies, and start:
```bash
cd frontend
npm install
npm run dev
```
*The React dashboard will boot on [http://localhost:5173](http://localhost:5173).*

---

## 🔑 Environment Variables

The backend uses a strict **Zod validation schema** at startup. Ensure your `backend/.env` file contains these variables:

| Variable | Description | Default | Example |
| :--- | :--- | :--- | :--- |
| `PORT` | Node.js Express server port | `5000` | `5000` |
| `NODE_ENV` | Running environment stage | `development` | `development` \| `production` |
| `DATABASE_URL` | PostgreSQL connection URL string | *Required* | `postgresql://postgres:postgres@localhost:5432/bookingjini?schema=public` |
| `REDIS_URL` | Redis connection URL string | *Required* | `redis://localhost:6379` |
| `FRONTEND_URL` | Client dashboard UI base address | *Required* | `http://localhost:5173` |
| `GEMINI_API_KEY` | Google Gemini AI developers key | *Optional* | `AIzaSyYourKeyHere` |
| `JWT_SECRET` | Secret key used for signing JWTs | `replace-with-secure-secret` | `mYsEcUrEsEcReTkEy` |
| `LOG_LEVEL` | Level threshold for console logger logs | `info` | `debug` \| `info` \| `warn` \| `error` |

---

## 📝 API Documentation

API documentation is fully documented via **OpenAPI 3.0** and served dynamically via Swagger UI. 

Ensure the backend server is running, and visit:
👉 **[http://localhost:5000/api/docs](http://localhost:5000/api/docs)**

---

## 🧪 Testing

The backend includes a comprehensive Jest test suite that uses Supertest to test HTTP endpoints and mocks out database and caching processes.

### Run all tests:
```bash
cd backend
npm test
```

### Generate Code Coverage reports:
```bash
npx jest --coverage
```

---

## 🔮 Future Improvements

- 🔒 **Authentication & Authorization:** Secure the dashboard using JWT, session management, and Google OAuth bindings.
- 📱 **QR Code generation:** Generate downloadable, scan-tracked QR Codes for every shortened URL.
- 🌐 **Custom Domains:** Allow corporate users to register distinct domains (e.g. `brand.link`) for shortening.
- 🛡️ **Rate Limiting:** Implement Express rate-limiters at the gateway level to block brute-force redirect traffic and restrict AI generation abuse.
- 🕵️ **Click Fraud Detection:** Block suspicious spam click triggers (such as repeat IP pings or web scrapers) from corrupting telemetry data.

---

## ✍️ Author

**SK ARSHAD BASHA**  
*Senior Software Engineer & Tech Writer*  
[GitHub Profile](https://github.com/arshad5678)
