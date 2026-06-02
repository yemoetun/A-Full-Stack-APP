# ProjectFlow

A full-stack, production-ready SaaS project management app built with Next.js, Node.js/Express, and PostgreSQL. Multi-tenant, role-based, with Google OAuth, PWA support, and all 13 layers of a production stack.

![ProjectFlow Dashboard](https://via.placeholder.com/1200x600/4f46e5/ffffff?text=ProjectFlow)

---

## Features

- **Multi-tenant** — each org has isolated data, roles, and members
- **Kanban board** — drag and drop tasks between columns
- **Role-based access** — owner, admin, member, viewer
- **Google OAuth** — sign in with Google or email/password
- **PWA** — installable on iOS and Android (Add to Home Screen)
- **Real-time dashboard** — live stats, upcoming tasks, recent activity
- **Task details** — comments, file attachments, due dates, priority
- **Member management** — invite, change roles, remove
- **Rate limiting** — Redis-backed per-user and per-IP
- **Caching** — Redis cache on all hot reads
- **CI/CD** — GitHub Actions for lint, test, deploy
- **Docker** — full containerized local dev and production

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14, Tailwind CSS, Zustand, React Query, dnd-kit |
| Backend | Node.js, Express, TypeScript |
| Database | PostgreSQL 16 |
| Cache / Rate limit | Redis (Upstash in production) |
| Auth | JWT + refresh tokens, Google OAuth 2.0 |
| Storage | Cloudflare R2 (S3-compatible) |
| Email | Resend |
| Error tracking | Sentry |
| CI/CD | GitHub Actions |
| Containerization | Docker + Docker Compose |
| Monorepo | Turborepo + pnpm workspaces |

---

## Project Structure

```
projectflow/
├── apps/
│   ├── web/          # Next.js 14 frontend
│   └── api/          # Node.js + Express backend
├── packages/
│   ├── db/           # Migrations, seeds
│   ├── types/        # Shared TypeScript types
│   └── config/       # Env validation, constants
├── infra/
│   ├── docker/       # Dockerfiles
│   ├── nginx/        # Load balancer config
│   └── scripts/      # DB backup, health check
└── .github/
    └── workflows/    # CI/CD pipelines
```

---

## Prerequisites

- **Node.js** 20+
- **pnpm** 9+ → `npm install -g pnpm@9`
- **Docker Desktop** → [docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop/)

---

## Local Development Setup

### 1. Clone the repo

```bash
git clone https://github.com/yemoetun/A-Full-Stack-APP.git
cd A-Full-Stack-APP
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Set up environment variables

```bash
cp .env.example .env
```

Then open `.env` and fill in the required values (see [Environment Variables](#environment-variables) below).

### 4. Start Postgres and Redis

```bash
docker-compose up postgres redis -d
```

### 5. Run database migrations

```bash
DATABASE_URL=postgresql://postgres:password@localhost:5432/projectflow node packages/db/scripts/migrate.js
```

### 6. Seed the database (optional — adds sample data)

```bash
DATABASE_URL=postgresql://postgres:password@localhost:5432/projectflow pnpm --filter @projectflow/db exec tsx seed/index.ts
```

Seed credentials:
- `alice@example.com` / `password123` (owner)
- `bob@example.com` / `password123` (admin)
- `carol@example.com` / `password123` (member)

### 7. Start the app

```bash
pnpm dev
```

- **Frontend** → http://localhost:3000
- **API** → http://localhost:4000
- **Health check** → http://localhost:4000/api/v1/health

---

## Environment Variables

Copy `.env.example` to `.env` and replace each value:

### Required (app won't start without these)

```env
# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/projectflow

# Redis
REDIS_URL=redis://localhost:6379

# JWT — generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_SECRET=<generate-a-random-32-char-string>
JWT_REFRESH_SECRET=<generate-a-different-random-32-char-string>
```

### Google OAuth (for "Sign in with Google")

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create a project → APIs & Services → OAuth consent screen → External
3. Credentials → Create OAuth 2.0 Client ID → Web application
4. Add redirect URI: `http://localhost:4000/api/v1/auth/google/callback`
5. Copy the Client ID and Secret:

```env
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
```

### Cloudflare R2 (for file uploads)

1. Go to [dash.cloudflare.com](https://dash.cloudflare.com) → R2
2. Create a bucket named `projectflow-files`
3. Create an API token with R2 read/write permissions

```env
R2_ACCOUNT_ID=your-cloudflare-account-id
R2_ACCESS_KEY_ID=your-r2-access-key-id
R2_SECRET_ACCESS_KEY=your-r2-secret-access-key
R2_BUCKET=projectflow-files
R2_PUBLIC_URL=https://pub-xxxx.r2.dev
```

### Resend (for invite emails)

1. Go to [resend.com](https://resend.com) → create account → API Keys
2. Create an API key

```env
RESEND_API_KEY=re_xxxxxxxxxxxx
EMAIL_FROM=noreply@yourdomain.com
```

### Sentry (for error tracking — optional)

1. Go to [sentry.io](https://sentry.io) → create project → Node.js
2. Copy the DSN

```env
SENTRY_DSN=https://xxxx@oxxxx.ingest.sentry.io/xxxx
```

### App URLs

```env
NODE_ENV=development
API_PORT=4000
API_URL=http://localhost:4000
FRONTEND_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## API Reference

Base URL: `http://localhost:4000/api/v1`

### Auth

| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/register` | Register with email + password |
| POST | `/auth/login` | Login with email + password |
| POST | `/auth/refresh` | Refresh access token |
| POST | `/auth/logout` | Logout (revoke refresh token) |
| GET | `/auth/me` | Get current user + orgs |
| GET | `/auth/google` | Redirect to Google OAuth |
| GET | `/auth/google/callback` | Google OAuth callback |
| PATCH | `/auth/password` | Change password |

### Orgs

| Method | Endpoint | Description |
|---|---|---|
| POST | `/orgs` | Create organization |
| GET | `/orgs` | List my organizations |
| GET | `/orgs/:orgId` | Get organization |
| PATCH | `/orgs/:orgId` | Update org (admin+) |
| DELETE | `/orgs/:orgId` | Delete org (owner) |

### Projects

| Method | Endpoint | Description |
|---|---|---|
| GET | `/orgs/:orgId/projects` | List projects |
| POST | `/orgs/:orgId/projects` | Create project |
| GET | `/orgs/:orgId/projects/:projectId` | Get project |
| PATCH | `/orgs/:orgId/projects/:projectId` | Update project |
| DELETE | `/orgs/:orgId/projects/:projectId` | Delete project |

### Tasks

| Method | Endpoint | Description |
|---|---|---|
| GET | `/orgs/:orgId/projects/:projectId/tasks` | List tasks |
| POST | `/orgs/:orgId/projects/:projectId/tasks` | Create task |
| GET | `/orgs/:orgId/projects/:projectId/tasks/:taskId` | Get task |
| PATCH | `/orgs/:orgId/projects/:projectId/tasks/:taskId` | Update task |
| DELETE | `/orgs/:orgId/projects/:projectId/tasks/:taskId` | Delete task |
| PATCH | `/orgs/:orgId/projects/:projectId/tasks/:taskId/move` | Move task (drag & drop) |

### Members

| Method | Endpoint | Description |
|---|---|---|
| GET | `/orgs/:orgId/members` | List members |
| POST | `/orgs/:orgId/members/invite` | Invite member (sends email) |
| PATCH | `/orgs/:orgId/members/:userId/role` | Change member role |
| DELETE | `/orgs/:orgId/members/:userId` | Remove member |

### Comments & Files

| Method | Endpoint | Description |
|---|---|---|
| GET | `/orgs/:orgId/tasks/:taskId/comments` | List comments |
| POST | `/orgs/:orgId/tasks/:taskId/comments` | Add comment |
| POST | `/orgs/:orgId/tasks/:taskId/files` | Upload file |
| GET | `/orgs/:orgId/tasks/:taskId/files` | List files |
| DELETE | `/orgs/:orgId/files/:fileId` | Delete file |

### Health

| Method | Endpoint | Description |
|---|---|---|
| GET | `/health` | Check DB + Redis status |

---

## Database

### Run migrations

```bash
DATABASE_URL=<your-db-url> node packages/db/scripts/migrate.js
```

### Reset database

```bash
docker-compose down -v   # destroys volumes
docker-compose up postgres -d
DATABASE_URL=... node packages/db/scripts/migrate.js
```

### Schema overview

```
users → org_members → orgs
                          ↓
                       projects
                          ↓
                        tasks → comments
                          ↓
                         files
```

---

## PWA — Install on Phone

The app is a Progressive Web App. To install:

**iOS (Safari):**
1. Open the app URL in Safari
2. Tap the Share button → "Add to Home Screen"
3. Tap Add

**Android (Chrome):**
1. Open the app URL in Chrome
2. Tap the install banner or menu → "Add to Home Screen"

---

## CI/CD

GitHub Actions workflows in `.github/workflows/`:

| Workflow | Trigger | Steps |
|---|---|---|
| `ci.yml` | Pull request to main/develop | Typecheck → Lint → Test → Build |
| `deploy-staging.yml` | Push to `develop` | CI + deploy to staging |
| `deploy-production.yml` | Push to `main` | CI + migrate DB + deploy |
| `db-backup.yml` | Nightly cron (2 AM UTC) | pg_dump → upload to R2 |

### Required GitHub Secrets

Add these in your repo → Settings → Secrets:

```
DATABASE_URL
STAGING_DATABASE_URL
RAILWAY_TOKEN
VERCEL_TOKEN
VERCEL_ORG_ID
VERCEL_PROJECT_ID
R2_ACCOUNT_ID
R2_BUCKET
R2_ACCESS_KEY_ID
R2_SECRET_ACCESS_KEY
API_URL
```

---

## Docker

### Local development (recommended)

```bash
# Start only DB + Redis (run apps natively for hot reload)
docker-compose up postgres redis -d

# Or start everything in Docker
docker-compose up
```

### Production

```bash
docker-compose -f docker-compose.prod.yml up -d
```

---

## Role Permissions

| Action | Viewer | Member | Admin | Owner |
|---|---|---|---|---|
| View projects/tasks | ✅ | ✅ | ✅ | ✅ |
| Create/edit tasks | ❌ | ✅ | ✅ | ✅ |
| Create projects | ❌ | ✅ | ✅ | ✅ |
| Delete projects | ❌ | ❌ | ✅ | ✅ |
| Invite members | ❌ | ❌ | ✅ | ✅ |
| Remove members | ❌ | ❌ | ✅ | ✅ |
| Update org settings | ❌ | ❌ | ✅ | ✅ |
| Delete org | ❌ | ❌ | ❌ | ✅ |

---

## Production Stack (all 13 layers)

| Layer | Implementation |
|---|---|
| Frontend Foundations | Next.js 14, Tailwind CSS, shadcn/ui |
| APIs & Backend | Express, versioned REST (`/api/v1`) |
| Database & Storage | PostgreSQL + Cloudflare R2 |
| Auth & Permissions | JWT, refresh tokens, Google OAuth, RBAC |
| Hosting & Deployment | Vercel (web) + Railway (API) |
| Cloud & Compute | Background workers, R2 storage |
| CI/CD & Version Control | GitHub Actions, pnpm, Turborepo |
| Security & RLS | Tenant isolation via `org_id`, Helmet.js |
| Rate Limiting | Redis-backed (rate-limiter-flexible) |
| Caching & CDN | Redis cache + Vercel Edge CDN |
| Load Balancing & Scaling | Nginx upstream, stateless API |
| Error Tracking & Logs | Sentry + Pino structured logs |
| Availability & Recovery | Health check, DB backups, PITR |

---

## Contributing

1. Fork the repo
2. Create a branch: `git checkout -b feature/your-feature`
3. Make changes and commit: `git commit -m "feat: your feature"`
4. Push: `git push origin feature/your-feature`
5. Open a pull request

---

## License

MIT
