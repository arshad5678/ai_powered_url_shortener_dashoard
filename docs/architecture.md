# System Architecture

This document describes the software architecture for the AI-Powered URL Shortener Dashboard, following the principles of Clean Architecture.

## Architecture Block Diagram

```mermaid
graph TD
    subgraph Client ["Client Layer (Frontend)"]
        UI["React SPA Dashboard"]
        Vite["Vite Dev/Build Tool"]
    end

    subgraph API ["Presentation Layer (Backend)"]
        Router["HTTP Routes / Router"]
        Middleware["Middlewares (Auth, Error, Rate Limit)"]
        Controller["Controllers (Request Handlers)"]
        Validator["Validators (DTO Schema Checks)"]
    end

    subgraph Core ["Application Core (Domain/Service)"]
        Service["Services (Business Logic)"]
        Model["Domain Entities / Models"]
        Interface["Interfaces & Interfaces Contracts"]
    end

    subgraph Infra ["Infrastructure Layer"]
        DB["Database Client (Prisma)"]
        Repo["Repositories (Data Persistence Implementations)"]
        Logger["Logger (Pino/Winston Wrapper)"]
        Config["Configuration & Environment Files"]
    end

    UI -->|HTTP Requests| Router
    Router --> Middleware
    Middleware --> Controller
    Controller -->|Input Validation| Validator
    Controller --> Service
    Service --> Repo
    Repo --> DB
    Service -.-> Interface
    Repo -.-> Interface
```

## Layer Breakdown

### 1. Presentation Layer (`src/controllers`, `src/routes`, `src/middleware`)
- Exposes REST API endpoints.
- Validates requests before executing core logic.
- Converts protocol-specific models (HTTP requests/responses) to domain entities.

### 2. Service/Domain Layer (`src/services`, `src/models`, `src/interfaces`)
- Contains all pure business logic and use cases.
- Defines interfaces for dependencies (e.g. database access, logging).
- Pure TypeScript, decoupled from any database or network framework.

### 3. Infrastructure Layer (`src/repositories`, `database`, `prisma`)
- Implements application core interfaces.
- Interacts with external systems (Database, Cache, Message Queues).
- Handles data serialization/deserialization to DB models.
