# Contributing to EventFlow AI

Thank you for contributing to EventFlow AI.

This document explains how to set up the project locally, run the applications, work with the database, and contribute changes safely.

---

## 1. Prerequisites

Before starting, make sure you have:

- Git
- Node.js 24+
- npm
- Docker Desktop

Check your versions:

```bash
node --version
npm --version
git --version
docker --version
docker compose version
```

Make sure Docker Desktop is running before starting the database.

---

## 2. Clone the Repository

Clone the repository:

```bash
git clone https://github.com/khushimittal20/Consumer-Behavior-PBL.git
```

Move into the project:

```bash
cd Consumer-Behavior-PBL
```

---

## 3. Install Dependencies

This project uses npm workspaces.

Install all dependencies from the **project root**:

```bash
npm install
```

Do not run separate dependency installations inside `apps/web`, `apps/admin`, or `server` unless specifically required.

---

## 4. Project Structure

```text
Consumer-Behavior-PBL/
│
├── apps/
│   ├── web/                         # User App / Website
│   └── admin/                       # Admin Portal
│
├── server/
│   ├── prisma/
│   │   ├── migrations/              # Database migrations
│   │   └── schema.prisma            # Prisma database schema
│   │
│   ├── src/
│   │   ├── config/
│   │   │   └── prisma.ts
│   │   │
│   │   ├── middleware/
│   │   │   ├── auth.middleware.ts
│   │   │   └── role.middleware.ts
│   │   │
│   │   ├── modules/
│   │   │   └── auth/
│   │   │       ├── auth.controller.ts
│   │   │       ├── auth.routes.ts
│   │   │       ├── auth.service.ts
│   │   │       └── auth.validation.ts
│   │   │
│   │   ├── app.ts
│   │   └── server.ts
│   │
│   ├── .env.example
│   ├── package.json
│   ├── prisma7.config.ts
│   └── tsconfig.json
│
├── docker-compose.yml               # Local PostgreSQL database
├── package.json                     # Root workspace configuration
├── package-lock.json
├── README.md
└── CONTRIBUTING.md
```

The structure will grow as more EventFlow modules are implemented.

---

## 5. Environment Variables

A template is provided at:

```text
server/.env.example
```

Move into the server directory:

```bash
cd server
```

Create your local `.env` file from the template.

### macOS / Linux

```bash
cp .env.example .env
```

### Windows PowerShell

```powershell
Copy-Item .env.example .env
```

The template contains:

```env
DATABASE_URL="postgresql://eventflow:eventflow_dev@localhost:5433/eventflow"
JWT_SECRET="replace_with_a_long_random_secret"
```

Replace the `JWT_SECRET` value in your local `.env` with a long random development secret.

Example:

```env
JWT_SECRET="replace_this_with_your_own_long_random_development_secret"
```

### Important

Never commit:

```text
.env
.env.*
```

The only environment file that should be committed is:

```text
.env.example
```

Do not place real production secrets inside `.env.example`.

---

## 6. Start PostgreSQL

The project uses PostgreSQL through Docker.

From the **project root**, run:

```bash
docker compose up -d
```

Check that the database is running:

```bash
docker ps
```

You should see:

```text
eventflow-postgres
```

The EventFlow PostgreSQL database is exposed locally on:

```text
localhost:5433
```

The PostgreSQL container internally uses port `5432`.

### Stop the database

```bash
docker compose down
```

Do not use:

```bash
docker compose down -v
```

unless you intentionally want to delete the local database volume and all local database data.

---

## 7. Prisma Setup

The backend uses Prisma ORM with PostgreSQL.

Move into the server:

```bash
cd server
```

Generate Prisma Client:

```bash
npx prisma generate
```

Apply existing database migrations:

```bash
npx prisma migrate dev
```

Inspect the database using Prisma Studio:

```bash
npx prisma studio
```

Prisma Studio opens a local browser interface where you can inspect database tables and records.

---

## 8. Database Schema Changes

Do not modify the database schema without discussing the change with the team first.

The Prisma schema is located at:

```text
server/prisma/schema.prisma
```

If an approved schema change is required:

1. Update `schema.prisma`.
2. Format the schema.
3. Validate the schema.
4. Create a migration.
5. Test the migration locally.
6. Regenerate Prisma Client.
7. Commit both the schema and migration.

Commands:

```bash
npx prisma format
npx prisma validate
npx prisma migrate dev --name your_migration_name
npx prisma generate
```

Example:

```bash
npx prisma migrate dev --name add_crowd_status
```

Migration files under:

```text
server/prisma/migrations/
```

must be committed to Git.

Do not manually modify an existing migration after it has already been merged and used by other contributors unless the team explicitly agrees.

---

## 9. Current Database Models

The current database contains the initial core models:

```text
User
UserPreference
Event
Venue
Zone
Location
Facility
```

More models will be added as the project progresses, including:

```text
CrowdStatus
QueueStatus
Incident
Brand
Campaign
Offer
Recommendation
UserInteraction
Feedback
AnalyticsEvent
Notification
```

---

## 10. Running the Backend

Open a terminal:

```bash
cd server
npm run dev
```

The backend runs on:

```text
http://localhost:5000
```

Health-check endpoint:

```text
GET http://localhost:5000/api/v1/health
```

Expected response:

```json
{
  "success": true,
  "message": "EventFlow AI API is running"
}
```

---

## 11. Current Authentication APIs

Authentication is already implemented.

### Register

```text
POST /api/v1/auth/register
```

Example request body:

```json
{
  "name": "Test User",
  "email": "test@example.com",
  "password": "Test1234"
}
```

### Login

```text
POST /api/v1/auth/login
```

Example request body:

```json
{
  "email": "test@example.com",
  "password": "Test1234"
}
```

Successful login returns a JWT token.

### Current User

```text
GET /api/v1/auth/me
```

This endpoint requires:

```text
Authorization: Bearer <JWT_TOKEN>
```

Authentication currently includes:

- User registration
- Email uniqueness checking
- Password hashing using bcrypt
- Login
- JWT generation
- JWT verification
- Protected routes
- Current-user retrieval
- Role-based authorization middleware

Current roles:

```text
USER
ADMIN
```

Do not expose JWT secrets or user passwords in commits, screenshots, logs, or documentation.

---

## 12. Running the User App

Open another terminal from the project root:

```bash
cd apps/web
npm run dev
```

Vite will print the local development URL.

It will normally use:

```text
http://localhost:5173
```

if that port is available.

The User App is the visitor-facing EventFlow AI interface.

---

## 13. Running the Admin Portal

Open another terminal:

```bash
cd apps/admin
npm run dev
```

Vite will print the local development URL.

If another Vite application is already using port `5173`, Vite may automatically use another available port such as:

```text
http://localhost:5174
```

Always use the URL printed in your terminal.

The Admin Portal is the organizer/admin-facing interface.

---

## 14. Running Everything

For full local development, you will normally have Docker and three development terminals running.

### Database

From the project root:

```bash
docker compose up -d
```

### Terminal 1 — User App

```bash
cd apps/web
npm run dev
```

### Terminal 2 — Admin Portal

```bash
cd apps/admin
npm run dev
```

### Terminal 3 — Backend

```bash
cd server
npm run dev
```

Current architecture:

```text
User App
    │
    ▼
Backend API
    │
    ▼
Prisma
    │
    ▼
PostgreSQL
    ▲
    │
Admin Portal
```

Both frontends use the same backend.

---

## 15. Git Workflow

Do not directly develop on `main`.

Before starting new work:

```bash
git checkout main
git pull origin main
```

Create a feature branch:

```bash
git checkout -b feature/your-feature-name
```

Examples:

```bash
git checkout -b feature/event-core
git checkout -b feature/event-map
git checkout -b feature/admin-dashboard
git checkout -b feature/crowd-system
git checkout -b feature/recommendation-engine
```

Work only on your branch.

After making changes:

```bash
git status
git add .
git commit -m "feat: add event map"
```

Push the branch:

```bash
git push -u origin feature/event-map
```

Then create a Pull Request:

```text
your-feature-branch → main
```

The Pull Request should be reviewed before merging.

---

## 16. Branch Naming

Use descriptive branch names.

### Features

```text
feature/<feature-name>
```

Examples:

```text
feature/event-core
feature/smart-navigation
feature/admin-dashboard
```

### Bug Fixes

```text
fix/<bug-name>
```

Example:

```text
fix/map-loading
```

### Documentation

```text
docs/<change>
```

Example:

```text
docs/update-setup-guide
```

### Refactoring

```text
refactor/<change>
```

Example:

```text
refactor/api-structure
```

---

## 17. Commit Messages

Use clear and descriptive commit messages.

Recommended format:

```text
type: short description
```

Examples:

```text
feat: add event listing API
feat: add admin dashboard
feat: add authentication
fix: resolve map loading issue
refactor: organize API routes
docs: update contributor guide
chore: update dependencies
```

Keep commits focused on one logical change.

---

## 18. Important Git Rules

### Do not push directly to `main`

All development should happen in a separate branch and be merged through a Pull Request.

### Never commit `node_modules`

The repository ignores:

```text
node_modules/
```

### Never commit environment secrets

Do not commit:

```text
.env
.env.*
```

Only `.env.example` should be committed.

### Do not commit generated Prisma Client files

Generated Prisma Client files are ignored and can be recreated using:

```bash
npx prisma generate
```

### Do not commit build output

The following are ignored:

```text
dist/
build/
.vite/
```

### Do not make structural changes without discussion

Discuss changes before modifying:

- Project architecture
- Folder structure
- Database schema
- API contracts
- Authentication system
- Technology stack
- Shared types
- Core dependencies

---

## 19. Before Opening a Pull Request

Check the current Git state:

```bash
git status
```

Make sure no unintended files are present.

### Backend changes

Run:

```bash
cd server
npm run build
```

The TypeScript build must pass.

If the change affects the database:

```bash
npx prisma validate
```

If applicable, verify that migrations work correctly.

### Frontend changes

Run the relevant application:

```bash
npm run dev
```

If applicable, also run:

```bash
npm run build
```

Verify the feature locally before creating the Pull Request.

---

## 20. Current Development Status

### Completed

The project currently contains:

- React + TypeScript User App scaffold
- React + TypeScript Admin Portal scaffold
- Express + TypeScript backend
- npm workspace / monorepo setup
- Backend health-check API
- PostgreSQL database through Docker
- Prisma ORM
- Initial database schema
- Prisma migrations
- Prisma Client integration
- User registration
- User login
- bcrypt password hashing
- JWT authentication
- Protected `/auth/me` endpoint
- Authentication middleware
- Role-based authorization middleware
- Git branch + Pull Request workflow
- PRD and technical planning documentation

### Next Development Phases

The major upcoming modules are:

1. Event management
2. Venue management
3. Zone management
4. Location management
5. Facility management
6. Admin Portal core UI
7. User App event experience
8. Event map
9. Crowd status system
10. Queue system
11. Real-time updates
12. Smart navigation
13. Consumer decision-support system
14. User preference system
15. Brand management
16. Campaigns and offers
17. Recommendation engine
18. Consumer interaction tracking
19. Feedback
20. Consumer and operational analytics
21. Event Assistant
22. AI and prediction features

Do not assume an upcoming feature is already implemented unless it exists in the current codebase.

---

## 21. Development Architecture

EventFlow AI uses one backend shared by both frontends.

```text
                     ┌────────────────────┐
                     │      User App      │
                     │ React + TypeScript │
                     └─────────┬──────────┘
                               │
                               ▼
                     ┌────────────────────┐
                     │    Express API     │
                     │    TypeScript      │
                     └─────────┬──────────┘
                               │
                               ▼
                     ┌────────────────────┐
                     │       Prisma       │
                     └─────────┬──────────┘
                               │
                               ▼
                     ┌────────────────────┐
                     │     PostgreSQL     │
                     │      Docker        │
                     └────────────────────┘
                               ▲
                               │
                     ┌─────────┴──────────┐
                     │    Admin Portal    │
                     │ React + TypeScript │
                     └────────────────────┘
```

Do not create separate backends for the User App and Admin Portal.

---

## 22. Collaboration Guidelines

Before starting a major feature:

1. Check the README, PRD, technical plan, and existing code.
2. Discuss the feature with the team.
3. Decide module ownership.
4. Pull the latest `main`.
5. Create a separate feature branch.
6. Keep the implementation focused.
7. Test the feature locally.
8. Open a Pull Request.
9. Get the change reviewed before merging.

Avoid having multiple contributors modify the same core module simultaneously unless coordinated.

For larger changes, update the relevant documentation as well.

---

## 23. Suggested Module Ownership

Contributors can work on different modules in parallel.

```text
Backend
├── Events
├── Venues
├── Zones
├── Locations
├── Facilities
├── Crowd
├── Queues
├── Brands
├── Campaigns
├── Recommendations
└── Analytics

Frontend
├── User App
│   ├── Event pages
│   ├── Map
│   ├── Navigation
│   ├── Recommendations
│   └── Offers
│
└── Admin Portal
    ├── Dashboard
    ├── Event management
    ├── Venue management
    ├── Crowd / queue monitoring
    ├── Incident management
    └── Analytics
```

Module ownership should be discussed with the team before development begins.

---

## 24. Important Project Rule

Before making major changes to the repository, database, architecture, API design, or technology stack:

**Discuss it with the team first.**

The goal is to keep all contributors working with the same architecture instead of creating separate or conflicting implementations.