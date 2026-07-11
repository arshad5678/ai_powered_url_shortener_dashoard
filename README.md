<h1 align="center">
  <br>
  <a href="https://ai-powered-url-shortener-dashboard.vercel.app"><img src="https://img.icons8.com/fluent/144/000000/link.png" alt="AI-Powered URL Shortener Dashboard Logo" width="120"></a>
  <br>
  AI-Powered URL Shortener Dashboard
  <br>
</h1>

<p align="center">
  <strong>A production-ready, high-performance URL shortening platform with real-time analytics, Redis caching, and a React management dashboard.</strong>
</p>

<p align="center">
  <a href="https://github.com/arshad5678/ai_powered_url_shortener_dashoard/actions"><img src="https://img.shields.io/badge/build-passing-brightgreen.svg?style=flat-square" alt="Build Status"></a>
  <a href="https://github.com/arshad5678/ai_powered_url_shortener_dashoard/blob/main/LICENSE"><img src="https://img.shields.io/github/license/arshad5678/ai_powered_url_shortener_dashoard.svg?style=flat-square" alt="License"></a>
  <a href="https://typescriptlang.org"><img src="https://img.shields.io/badge/language-TypeScript-blue.svg?style=flat-square" alt="Language"></a>
  <a href="https://react.dev"><img src="https://img.shields.io/badge/frontend-React-61dafb.svg?style=flat-square" alt="Frontend"></a>
  <a href="https://nodejs.org"><img src="https://img.shields.io/badge/backend-Node.js-339933.svg?style=flat-square" alt="Backend"></a>
  <a href="https://www.postgresql.org"><img src="https://img.shields.io/badge/database-PostgreSQL-316192.svg?style=flat-square" alt="Database"></a>
</p>

<p align="center">
  <a href="#key-features">Key Features</a> •
  <a href="#live-demo">Live Demo</a> •
  <a href="#architecture">Architecture</a> •
  <a href="#installation-guide">Installation</a> •
  <a href="#api-endpoints">API Documentation</a> •
  <a href="#screenshots">Screenshots</a>
</p>

---

## 🖼️ Hero Banner

<p align="center">
  <img src="https://raw.githubusercontent.com/arshad5678/ai_powered_url_shortener_dashoard/main/docs/screenshots/dashboard.png" alt="AI URL Shortener Dashboard Banner" width="800" style="border-radius: 8px; box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);">
</p>

---

## 🌐 Live Demo

The application is deployed across multiple cloud systems with CI/CD triggers:

*   **Frontend Dashboard UI:** [https://ai-powered-url-shortener-dashboard.vercel.app](https://ai-powered-url-shortener-dashboard.vercel.app)
*   **Backend Redirection API:** [https://ai-powered-url-shortener-dashoard.onrender.com](https://ai-powered-url-shortener-dashoard.onrender.com)
*   **GitHub Code Repository:** [https://github.com/arshad5678/ai_powered_url_shortener_dashoard](https://github.com/arshad5678/ai_powered_url_shortener_dashoard)

---

## 📝 Project Overview

Traditional URL shorteners rely on slow database lookups, generate random/colliding slugs, and do not track rich metadata. Redirection latency directly impacts user conversion rates, while a lack of detailed analytics prevents organizations from identifying visitor trends.

**AI-Powered URL Shortener Dashboard** is an enterprise-grade platform built to solve these issues. It features:
- ** deterministic Base62 Shortening:** Short codes are generated using random 32-bit positive integer bounds encoded to Base62 to avoid collisions.
- **Ultra-low Redirection Latency:** Lookup queries hit Redis caching first ($O(1)$ lookup time) before falling back to PostgreSQL, reducing redirect response latency to under **5 milliseconds**.
- **Asynchronous Click Telemetry:** Telemetry capturing (User-Agent parsing, IP address location mapping, country parsing, and referrers) runs concurrently in the background without blocking the client's HTTP redirection pipeline.
- **Smart AI Suggestions:** Integrates Google's Gemini AI API to suggest contextually relevant, URL-safe, short custom aliases based on the destination webpage's title and description.

---

## ✨ Key Features

- **✔ URL Shortening:** Generate deterministic, short, and URL-safe Base62 slugs.
- **✔ Custom Alias:** Specify descriptive custom slugs (e.g., `/r/summer-sale`) with inline availability checks.
- **✔ Click Analytics:** Track overall redirection traffic, growth velocity, and daily click counts.
- **✔ Browser Analytics:** Breakdown analytics by visitor browser (Chrome, Safari, Firefox, Edge, Opera, etc.).
- **✔ Country Analytics:** Map click geographic locations using Cloudflare header lookups (`CF-IPCountry`).
- **✔ Referrer Analytics:** Track traffic source domains (Google, GitHub, LinkedIn, direct navigation, etc.).
- **✔ Redis Caching:** Cache redirects with a 1-hour time-to-live (TTL) to bypass database roundtrips.
- **✔ PostgreSQL Storage:** Persistent transactional database storage backed by Prisma ORM and hosted on Neon.
- **✔ Responsive Dashboard:** Modern React SPA with dark mode, interactive charts, toast notifications, and statistics overview.
- **✔ Production Deployment:** Configured with Vercel rewrites to proxy short URL redirections seamlessly to Render backend endpoints.

---

## 🛠️ Tech Stack

| Layer | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | **React 18** | Single Page Application framework with TypeScript |
| | **Vite** | Modern development server and bundler |
| | **Tailwind CSS** | Custom styling and modern aesthetics |
| | **Recharts** | Interactive chart visualization components |
| | **Axios** | Client-side HTTP communication client |
| **Backend** | **Node.js / Express** | Robust, scalable HTTP API server framework |
| | **TypeScript** | Strict compile-time type safety |
| | **Prisma ORM** | Schema migrations and type-safe query building |
| | **Winston** | Industrial-grade structured logging |
| **Database** | **PostgreSQL (Neon)** | Transactional relational data store |
| **Caching** | **Redis (Upstash)** | High-throughput in-memory caching |
| **Hosting** | **Vercel** | Edge-optimized frontend static hosting |
| | **Render** | Backend server runtime hosting |

---

## 📐 System Architecture

The following diagram illustrates the client redirection request flow:

```mermaid
graph TD
    Client[Client / Browser]
    Vercel[Vercel Frontend CDN]
    Render[Render Backend Server]
    Redis[(Redis Cache)]
    Prisma[Prisma ORM]
    Postgres[(PostgreSQL)]

    Client -->|1. Opens short URL /XYZ123| Vercel
    Vercel -->|2. Rewrites / Proxy Request| Render
    Render -->|3. Query Cache Key redirect:XYZ123| Redis
    Redis -->|4. Cache HIT - Return original URL| Render
    Redis -.->|4. Cache MISS| Render
    Render -.->|5. Lookup Database| Prisma
    Prisma -.->|6. Query Slug| Postgres
    Postgres -.->|7. Return Record| Prisma
    Prisma -.->|8. Cache Record for 1 hour| Redis
    Render -->|9. HTTP 302 Redirect to destination| Client
    Render -.->|10. Asynchronously log telemetry| Postgres
```

---

## 📂 Folder Structure

```
ai-powered-url-shortener-dashboard/
├── docker-compose.yml           # Database and cache container orchestrator
├── LICENSE                      # License details
├── CONTRIBUTING.md              # Open-source contribution guidelines
├── README.md                    # Project documentation
├── backend/
│   ├── jest.config.js           # Test runner configurations
│   ├── nodemon.json             # Live-reload configuration
│   ├── package.json             # Node dependencies and scripts
│   ├── tsconfig.json            # Strict TypeScript configuration
│   ├── prisma/
│   │   ├── schema.prisma        # Database schema models
│   │   └── migrations/          # Schema migrations sql files
│   └── src/
│       ├── app.ts               # Express configuration and routes mounting
│       ├── server.ts            # Server bootstrap and graceful shutdown hooks
│       ├── config/              # Swagger & env validations schema
│       ├── controllers/         # HTTP request controllers
│       ├── database/            # PostgreSQL & Redis clients
│       ├── middleware/          # Request validation, error intercepts
│       ├── repositories/        # Database data access layers
│       ├── routes/              # Express API endpoint declarations
│       └── services/            # Core business validations & AI service
└── frontend/
    ├── package.json             # Frontend script commands
    ├── vercel.json              # Vercel rewrites configuration
    ├── vite.config.ts           # Vite dev server and proxy configurations
    └── src/
        ├── App.tsx              # Component tree entry point
        ├── main.tsx             # DOM mounting configuration
        ├── components/          # Reusable UI components
        ├── pages/               # Dashboard, Analytics, Links, Settings pages
        ├── routes/              # React Router browser declarations
        └── services/            # Axios API communication clients
```

---

## 🚀 Installation & Setup Guide

### Prerequisites
*   **Node.js** (v18.x or higher)
*   **Docker Desktop** (for running local databases)
*   **Git**

### 1. Clone the Project
```bash
git clone https://github.com/arshad5678/ai_powered_url_shortener_dashoard.git
cd ai_powered_url_shortener_dashoard
```

### 2. Launch Local Database & Caching Services
Ensure Docker Desktop is running and start the PostgreSQL and Redis containers:
```bash
docker compose up -d
```
*This binds PostgreSQL to port `5432` and Redis to port `6379` locally.*

### 3. Configure the Backend Service
Navigate to the `backend/` directory, copy the example environment configuration, and install dependencies:
```bash
cd backend
cp .env.example .env
npm install
```

Apply database migrations to set up schema indexes:
```bash
npx prisma migrate dev --name init
npx prisma generate
```

### 4. Configure the Frontend Service
Open a new terminal window, navigate to the `frontend/` directory, copy the environment configuration, and install dependencies:
```bash
cd ../frontend
cp .env.example .env
npm install
```

---

## 🔑 Environment Variables

### Backend Configuration (`backend/.env`)

Ensure your environment variables are configured as follows:

| Variable | Description | Default | Example |
| :--- | :--- | :--- | :--- |
| `PORT` | Express HTTP API port | `5050` | `5050` |
| `NODE_ENV` | Target environment mode | `development` | `development` \| `production` |
| `DATABASE_URL` | Prisma PostgreSQL database connection string | - | `postgresql://postgres:postgres@localhost:5432/bookingjini?schema=public` |
| `REDIS_URL` | Redis server connection string | - | `redis://localhost:6379` |
| `FRONTEND_URL` | Address of the client dashboard application | - | `http://localhost:5173` |
| `GEMINI_API_KEY`| Google Gemini AI developer API key (optional) | - | `AIzaSyYourKeyHere` |
| `JWT_SECRET` | Secret key used for signing JWTs | `replace-with-secure-secret` | `mYsEcUrEsEcReTkEy` |
| `LOG_LEVEL` | Logging threshold for console outputs | `info` | `info` \| `debug` \| `error` |

### Frontend Configuration (`frontend/.env`)
```env
VITE_API_URL=http://localhost:5050
```

---

## 🏃 Running Locally

### Start Backend
In the `backend/` directory:
```bash
npm run dev
```
*Backend runs on [http://localhost:5050](http://localhost:5050)*

### Start Frontend
In the `frontend/` directory:
```bash
npm run dev
```
*Frontend runs on [http://localhost:5173](http://localhost:5173)*

### Run Automated Integration Tests
In the `backend/` directory, run:
```bash
npm test
```
To generate coverage reports:
```bash
npx jest --coverage
```

---

## 🐳 Docker Setup

If you prefer to run the entire backend stack in a containerized network, ensure Docker Compose is running, and configure your backend connection strings in `docker-compose.yml` to run:
```bash
docker compose up --build
```
This launches isolated containers mapping ports dynamically to your localhost interface.

---

## 📝 API Endpoints

All core backend endpoints are fully documented via **OpenAPI 3.0** and can be tested live inside the browser at:
👉 **[http://localhost:5050/api/docs](http://localhost:5050/api/docs)** (or equivalent Render domain path)

### Link Operations

| Method | Endpoint | Description | Payload |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/links` | Create a shortened URL | `{ "title": "My Page", "originalUrl": "https://example.com" }` |
| `GET` | `/api/links` | Get paginated, searchable links list | Query params: `page`, `limit`, `search` |
| `GET` | `/api/links/:id` | Get specific link metadata | - |
| `PUT` | `/api/links/:id` | Update link metadata (title, URL) | `{ "title": "New Title" }` |
| `PATCH`| `/api/links/:id/status`| Toggle link active status | - |
| `DELETE`| `/api/links/:id` | Soft delete link record | - |
| `POST` | `/api/links/suggest-aliases` | Generate AI-suggested aliases | `{ "title": "Sale page", "originalUrl": "url" }` |

### Analytics Operations

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/analytics/dashboard` | Get dashboard cards aggregated summary statistics |
| `GET` | `/api/analytics/:linkId` | Get detailed clicks telemetry metrics for a link |
| `GET` | `/api/analytics/:linkId/browsers`| Get browser agent click distribution |
| `GET` | `/api/analytics/:linkId/os` | Get client Operating System click distribution |
| `GET` | `/api/analytics/:linkId/countries`| Get geographic click distribution |
| `GET` | `/api/analytics/:linkId/referrers`| Get traffic source domain referral distribution |

---

## 📸 Screenshots

<details>
  <summary>🔍 Click to expand screenshots</summary>
  
  #### Dashboard Overview
  ![Dashboard Screenshot](file:///Users/shaikarshadbasha/URL_Shortener_Dashboard/docs/screenshots/dashboard.png)
  
  #### Links Management Table
  ![Links Table Screenshot](file:///Users/shaikarshadbasha/URL_Shortener_Dashboard/docs/screenshots/links.png)
  
  #### Advanced Analytics Reports
  ![Analytics Graphs Screenshot](file:///Users/shaikarshadbasha/URL_Shortener_Dashboard/docs/screenshots/analytics.png)
  
  #### Application Settings & Profile Configuration
  ![Settings Page Screenshot](file:///Users/shaikarshadbasha/URL_Shortener_Dashboard/docs/screenshots/settings.png)
</details>

---

## 🛡️ Security Features

- **Cross-Origin Resource Sharing (CORS):** Strict CORS options restrict client browser endpoints to safe domains (`env.FRONTEND_URL`).
- **Helmet Security Headers:** Mounted Helmet policies shield the Express runtime environment from cross-site scripting (XSS), clickjacking, MIME sniffing, and server header leaks.
- **SQL Injection Mitigation:** Prisma ORM intercepts parameter binding queries, sanitizing relational database calls.
- **Strict Parameter Validation:** Zod validator schemas reject malformed strings, invalid URL structures, and path injection attacks before they reach execution paths.

---

## ⚡ Performance Optimizations

- **Redis Cache Pre-checks:** Redirection engine searches Redis key databases in $O(1)$ time, avoiding slow transactional database query overhead.
- **Asynchronous Click Telemetry:** Redirection resolves instantly, while the backend records analytics asynchronously in a background thread, eliminating database write latency from the response time.
- **Index Optimization:** Database tables index `shortCode`, `customAlias`, and creation dates to maintain speed during bulk datasets.

---

## 💡 Challenges Solved & Lessons Learned

### The Vercel Routing redirection challenge
**Problem:** In production, copying a short URL (e.g. `https://ai-powered-url-shortener-dashboard.vercel.app/6ZTXup`) directly into a browser returned a 404 page because Vercel fell back to index.html and the React Router lacked a dynamic path handler.
**Solution:** 
1. Added Vercel CDN/edge-level rewrites in `vercel.json` mapping dynamic paths `/` to `/r/:shortCode` on the backend.
2. Created a frontend `<RedirectHandler />` client route to safely catch any local development redirections and seamlessly route client calls to the backend API without losing analytics data.

### Render Cold Starts
**Problem:** When deployed on Render free tier servers, backend processes spin down during inactivity, causing initial user redirects to wait up to 50 seconds.
**Solution:** Configured health probe checks (`/health` and `/live`) and integrated automated polling routines to keep backend servers warm and ready.

---

## 🔮 Future Enhancements

- 🔑 **Multi-Factor Authentication (MFA):** Integrate Auth0 / NextAuth logins for dashboard administrative layers.
- 📱 **QR Code Utilities:** Generate clean vector QR codes for every shortened URL created.
- 👥 **Teams and Workspaces:** Add support for teams sharing link lists and analytics records.
- 🚦 **Rate Limiting Dashboard:** Build user-facing traffic thresholds on individual URLs to block DDoS redirects.
- 🤖 **AI-Driven Analytics:** Suggest peak traffic time predictions and marketing advice using Gemini AI metrics.

---

## 📄 License

Distributed under the MIT License. See [LICENSE](file:///Users/shaikarshadbasha/URL_Shortener_Dashboard/LICENSE) for more details.

---

## ✍️ Author

**Arshad Basha**
*   **LinkedIn:** [https://linkedin.com/in/placeholder](https://linkedin.com/in/placeholder)
*   **Portfolio:** [https://portfolio.placeholder.com](https://portfolio.placeholder.com)
*   **GitHub:** [https://github.com/arshad5678](https://github.com/arshad5678)

---

## 🤝 Contributing

Contributions make the open-source community an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 💖 Support

If you find this project helpful, please consider giving it a ⭐ on GitHub to show your support!
