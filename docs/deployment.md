# Production Deployment Guide

This document outlines the setup, deployment parameters, variables, and troubleshooting steps for hosting the AI-Powered URL Shortener Dashboard in production.

---

## 1. Environment Variable Specifications

### Backend (Render Deployment)
Configure these variables in your Render Web Service settings panel:

| Name | Expected Format / Example | Purpose |
| :--- | :--- | :--- |
| `PORT` | `10000` (Render defaults to 10000) | Server listener port |
| `NODE_ENV` | `production` | Enables Express production optimizations |
| `DATABASE_URL` | `postgresql://user:pass@host:port/db?sslmode=require` | Production PostgreSQL connection URL |
| `REDIS_URL` | `rediss://default:pass@host:port` | Production Redis connection string (use `rediss://` for TLS) |
| `FRONTEND_URL` | `https://your-app.vercel.app` | Whitelisted frontend origin for CORS |
| `JWT_SECRET` | `[Secure Random String]` | Signature key for user authentication |
| `GEMINI_API_KEY` | `[Gemini API Key]` (Optional) | API Key for AI Alias Suggestion |
| `LOG_LEVEL` | `info` | Production log level |

### Frontend (Vercel Deployment)
Configure this variable in your Vercel project panel:

| Name | Expected Format / Example | Purpose |
| :--- | :--- | :--- |
| `VITE_API_URL` | `https://your-backend.onrender.com` | Base URL of the deployed Render Web Service |

---

## 2. Infrastructure Setup & Configurations

### PostgreSQL Database
* **Hosting Recommendation:** Neon, Supabase, or AWS RDS.
* **Migration Strategy:** 
  * Run the database schema generation locally or via a release hook:
    ```bash
    npx prisma migrate deploy
    ```
  * Note: The connection string must end with `?sslmode=require` to fulfill database host security requirements.

### Redis Cache
* **Hosting Recommendation:** Upstash, Redis Labs, or Render Redis (Free Tier).
* **Security:** Use TLS/SSL connections. In production, ensure the protocol starts with `rediss://` instead of `redis://`.

---

## 3. Cloud Provider Deployment Steps

### Render (Backend API Service)
1. **Create New Web Service:** Connect your GitHub repository.
2. **Build Settings:**
   * **Runtime:** `Node`
   * **Build Command:** `npm install && npm run build` (resolves dependencies, generates Prisma Client, compiles TS)
   * **Start Command:** `npm run start` (starts compiled `dist/server.js`)
3. **Advanced Settings:**
   * **Release Command:** `npx prisma migrate deploy` (runs migrations automatically before deploying a new build)
   * **Health Check Path:** `/health` (proactive health probes checking Express server status)

### Vercel (Frontend Single Page App)
1. **Create Project:** Select your GitHub repository.
2. **Framework Preset:** `Vite` (auto-detected)
3. **Build Settings:**
   * **Build Command:** `npm run build`
   * **Output Directory:** `dist`
4. **Environment Variables:** Add `VITE_API_URL`.
5. **SPA Navigation Configuration:** The application uses client-side routing. All dynamic request paths are automatically rewritten back to `index.html` via our committed configuration file: [vercel.json](file:///Users/shaikarshadbasha/URL_Shortener_Dashboard/frontend/vercel.json).

---

## 4. Production Commands Reference

| Phase | Command | Purpose |
| :--- | :--- | :--- |
| **Build** | `npm run build` | Cleans target directories, triggers Prisma schema codegen, and builds TS modules |
| **Database Migrations** | `npx prisma migrate deploy` | Evaluates and syncs pending migrations on PostgreSQL production instances |
| **Execution** | `npm run start` | Sets production environments and boots server listener |

---

## 5. Troubleshooting Matrix

### Issue 1: CORS Error / Preflight Request Blocked
* **Diagnostic:** The browser console displays `Access-Control-Allow-Origin` errors, or requests fail with "Network Error".
* **Resolution:** Double-check the `FRONTEND_URL` environment variable inside your Render Web Service. It must exactly match the Vercel app domain (including `https://` but *without* a trailing slash).

### Issue 2: Prisma Client Out of Sync
* **Diagnostic:** Operational failures with schema mismatch errors.
* **Resolution:** Ensure `prisma generate` is called during the build script. Verify that the dependency versions of `prisma` and `@prisma/client` in `package.json` are identical.

### Issue 3: Express / health route is 503 (ready check fails)
* **Diagnostic:** Render displays a deployment timeout or the `/ready` endpoint responds with a `503 Service Unavailable`.
* **Resolution:** Verify that both PostgreSQL and Redis are successfully connected. The ready probe checks active connections to both database instances.
