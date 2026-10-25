# Contributing to Rahat Setu (EventFlow AI)

Thank you for contributing to Rahat Setu / EventFlow AI.

This guide explains how to set up the repository locally, work with the database, run the attendee web app and admin portal, make schema changes safely, use Git correctly, and avoid interfering with other contributors' modules.

---

## 1. Repository

Official repository:

```text
https://github.com/EventFlow-AI/Consumer-Behavior-PBL.git
```

Clone it:

```bash
git clone https://github.com/EventFlow-AI/Consumer-Behavior-PBL.git
cd Consumer-Behavior-PBL
```

---

## 2. Prerequisites

Install:

- Git
- Node.js 24+
- npm
- Docker Desktop

Check versions:

```bash
node --version
npm --version
git --version
docker --version
docker compose version
```

Make sure Docker Desktop is running before starting PostgreSQL.

---

## 3. Install Dependencies

This repository uses npm workspaces.

From the project root:

```bash
npm install
```

Do not create separate lock files inside individual workspaces.

The root `package-lock.json` should remain the shared lock file.

---

## 4. Current Project Structure

```text
Consumer-Behavior-PBL/
│
├── apps/
│   ├── web/                 # Attendee-facing React + TypeScript web app
│   ├── admin/               # Organizer/admin React + TypeScript portal
│   └── mobile/              # Flutter workspace
│
├── server/
│   ├── prisma/
│   │   ├── migrations/
│   │   └── schema.prisma
│   │
│   └── src/
│       ├── config/
│       ├── middleware/
│       ├── generated/
│       ├── modules/
│       │   ├── auth/
│       │   ├── event/
│       │   ├── venue/
│       │   ├── zone/
│       │   ├── location/
│       │   ├── facility/
│       │   ├── preferences/
│       │   ├── crowd/
│       │   ├── incident/
│       │   ├── announcement/
│       │   ├── dashboard/
│       │   ├── brand/
│       │   ├── offer/
│       │   ├── interaction/
│       │   └── consumer-insights/
│       │
│       ├── app.ts
│       └── server.ts
│
├── docker-compose.yml
├── package.json
├── package-lock.json
├── README.md
└── CONTRIBUTING.md
```

Do not make structural changes to shared folders without coordinating with the team.

---

## 5. Environment Variables

Create the backend environment file from the template.

### Windows PowerShell

```powershell
Copy-Item server\.env.example server\.env
```

### macOS / Linux

```bash
cp server/.env.example server/.env
```

Core development variables include:

```env
DATABASE_URL="postgresql://eventflow:eventflow_dev@localhost:5433/eventflow"
JWT_SECRET="replace_with_a_long_random_secret"
ML_API_BASE_URL="http://your-ml-service"
ML_API_KEY="replace_with_your_local_api_key"
ML_CROWD_ENDPOINT="/internal/v1/predictions/crowd/next-hour"
```

### Never commit secrets

Never commit:

```text
.env
.env.*
```

except the intentionally committed template:

```text
.env.example
```

Never put real API keys, passwords, access tokens, or production credentials in:

- Git commits
- Pull Request descriptions
- Screenshots
- README examples
- Logs
- Public issue comments

If a secret is accidentally committed, rotate/revoke it immediately.

---

## 6. Start PostgreSQL

From the repository root:

```bash
docker compose up -d
```

Check:

```bash
docker ps
```

Expected database container:

```text
eventflow-postgres
```

The local EventFlow database is exposed on:

```text
localhost:5433
```

Container-internal PostgreSQL port:

```text
5432
```

Stop containers without deleting the database volume:

```bash
docker compose down
```

### Destructive command

Do not run:

```bash
docker compose down -v
```

unless you intentionally want to delete the local database volume and all local EventFlow data.

---

## 7. Prisma Setup

Move into the backend:

```bash
cd server
```

Generate the Prisma client:

```bash
npx prisma generate
```

Apply existing migrations:

```bash
npx prisma migrate dev
```

Inspect the database:

```bash
npx prisma studio
```

---

## 8. Current Prisma Models

The current database includes:

```text
User
UserPreference
Event
Venue
Zone
Location
Facility
Incident
Announcement
Brand
Offer
ConsumerInteraction
```

Do not assume roadmap models exist until they appear in `server/prisma/schema.prisma`.

---

## 9. Making Database Schema Changes

The Prisma schema is located at:

```text
server/prisma/schema.prisma
```

Before changing the schema:

1. Check whether another contributor is modifying it.
2. Discuss the change with the team.
3. Pull the latest `main`.
4. Make the smallest required schema change.
5. Create a new migration.
6. Regenerate Prisma Client.
7. Build and test the backend.
8. Commit both the schema and migration.

Recommended commands:

```bash
cd server
npx prisma format
npx prisma validate
npx prisma migrate dev --name your_migration_name
npx prisma generate
npm run build
```

Example:

```bash
npx prisma migrate dev --name add_event_feedback
```

Migration files under:

```text
server/prisma/migrations/
```

must be committed.

Do not manually rewrite a migration that has already been merged and used by other contributors unless the team explicitly agrees.

---

## 10. Running the Backend

```bash
cd server
npm run dev
```

Backend:

```text
http://localhost:5000
```

Health endpoint:

```text
GET /api/v1/health
```

Build:

```bash
npm run build
```

---

## 11. Running the Attendee Web App

From the repository root:

```bash
npm run dev --workspace apps/web
```

or:

```bash
cd apps/web
npm run dev
```

Build:

```bash
npm run build --workspace apps/web
```

The attendee web app currently includes:

- Register
- Login
- Protected routes
- Event discovery
- Event search
- Event details
- Active announcements
- Venue/facility information
- Active promotional offers
- Prototype one-hour crowd forecasting

Use the URL printed by Vite.

---

## 12. Running the Admin Portal

From the repository root:

```bash
npm run dev --workspace apps/admin
```

or:

```bash
cd apps/admin
npm run dev
```

Build:

```bash
npm run build --workspace apps/admin
```

The admin portal currently includes:

- Dashboard
- Events
- Venues
- Zones
- Locations
- Facilities
- Incidents
- Announcements
- Brands
- Offers
- Consumer Insights

Use the URL printed by Vite.

---

## 13. Running the Full Local Stack

You will normally need:

### PostgreSQL

```bash
docker compose up -d
```

### Terminal 1 — Backend

```bash
cd server
npm run dev
```

### Terminal 2 — Attendee Web

```bash
npm run dev --workspace apps/web
```

### Terminal 3 — Admin Portal

```bash
npm run dev --workspace apps/admin
```

Architecture:

```text
Attendee Web ─┐
              │
              ▼
          Express API
              │
              ▼
            Prisma
              │
              ▼
          PostgreSQL
              ▲
              │
Admin Portal ─┘
```

The crowd module additionally calls the configured external ML service.

---

## 14. Authentication

Authentication endpoints:

```text
POST /api/v1/auth/register
POST /api/v1/auth/login
GET  /api/v1/auth/me
```

Current roles:

```text
USER
ADMIN
```

The backend uses:

- bcrypt password hashing
- JWT authentication
- authentication middleware
- role-based authorization middleware

Do not hard-code admin permissions into the frontend.

Backend authorization remains the source of truth.

---

## 15. Existing Backend Modules

Current backend modules include:

```text
auth
event
venue
zone
location
facility
preferences
crowd
incident
announcement
dashboard
brand
offer
interaction
consumer-insights
```

Before creating a new module, check whether similar functionality already exists.

Avoid duplicate implementations.

---

## 16. Event Hierarchy

The event-management hierarchy is:

```text
Event
  └── Venue
       └── Zone
            └── Location
                 └── Facility
```

Be careful with deletes.

The Prisma schema contains cascading relations in the hierarchy, so deleting a parent record may delete child records.

Do not use real/shared test data for destructive experiments unless you know the consequences.

---

## 17. Crowd ML Integration

The current crowd pipeline is:

```text
Attendee Web / API Client
        ↓
Express Crowd Route
        ↓
Crowd Controller
        ↓
Crowd Service
        ↓
Crowd Adapter
        ↓
External ML API
        ↓
Normalized Prediction Result
```

Frontend code must call the Express backend contract.

Do **not** call the ML service directly from the attendee frontend.

The backend receives event-style fields such as:

```text
locationId
locationName
timestamp
temperature
weatherCondition
hasIncident
currentCrowd
towardsRatio
lag1h
lag2h
lag3h
lag24h
lag168h
```

The backend adapter converts these into the ML model feature contract.

### Prototype limitation

The currently integrated crowd model is the Würzburg prototype.

Do not describe it as:

- live production crowd intelligence
- trained specifically on Rahat Setu data
- production-ready event forecasting

Preferred wording:

```text
prototype one-hour crowd forecast
```

---

## 18. Consumer Behavior Module

The Consumer Behavior portion of the project is a core academic requirement.

Current models:

```text
UserPreference
Brand
Offer
ConsumerInteraction
```

Current interaction types:

```text
VIEW
CLICK
SELECT
SAVE
REDEEM
```

Current choice factors:

```text
PRICE
DISCOUNT
DISTANCE
CROWD
QUEUE
BRAND_FAMILIARITY
CONVENIENCE
OTHER
```

When extending this module, preserve the project's ability to study:

- consumer decision-making
- customer-attraction strategies
- brand engagement
- offer engagement
- influence of price/discount
- influence of crowd/queue
- influence of convenience and familiarity

Do not turn the project into only an event-operations system.

---

## 19. Consumer Insights

The admin Consumer Insights page currently displays:

- Total interactions
- Interaction-action breakdown
- Decision-factor breakdown
- Top choice factor
- Top brands
- Top offers
- Event-wise filtering

When adding analytics, derive them from real stored interaction data rather than hard-coded values.

---

## 20. Admin Dashboard

The current dashboard uses real backend/database aggregation.

Do not replace real counts with mock dashboard numbers.

Current metrics include:

```text
Events
Live events
Upcoming events
Venues
Zones
Locations
Facilities
Active incidents
Critical incidents
Active announcements
Urgent announcements
Recent incidents
```

---

## 21. Git Workflow

Do not develop directly on `main`.

Before starting work:

```bash
git checkout main
git pull origin main
git status
```

Create a feature branch:

```bash
git checkout -b feature/your-feature-name
```

Examples:

```text
feature/event-core
feature/incidents
feature/announcements
feature/admin-dashboard
feature/consumer-behavior
feature/web-app
feature/queue-ml-integration
```

---

## 22. Branch Naming

### Features

```text
feature/<feature-name>
```

### Fixes

```text
fix/<bug-name>
```

### Documentation

```text
docs/<change>
```

### Refactors

```text
refactor/<change>
```

Use descriptive names.

---

## 23. Commit Messages

Recommended format:

```text
type: short description
```

Examples:

```text
feat: add incident management system
feat: add announcement management system
feat: add real-time admin dashboard
feat: add consumer behavior and insights module
feat: build attendee web app
fix: correct crowd prediction request contract
docs: update project documentation
refactor: simplify attendee event layout
```

Keep commits focused on one logical change.

---

## 24. Safe Staging

Before committing:

```bash
git status
```

Do not blindly stage generated or unrelated files.

Prefer staging intended paths explicitly.

Example:

```bash
git add apps/web/src
git add apps/web/package.json
git add package-lock.json
```

Then verify again:

```bash
git status
```

Only commit after confirming the staged file list.

---

## 25. Do Not Commit Generated / Local Files

Never commit:

```text
node_modules/
dist/
build/
.vite/
.env
.env.*
```

Generated local tool/cache directories should also stay out of commits.

In particular, do not intentionally stage local Flutter/Gradle cache files such as:

```text
.gradle/
.dart_tool/
```

If generated cache files appear as modified, restore or ignore them instead of committing them with unrelated work.

---

## 26. Mobile App Caution

The `apps/mobile` Flutter workspace is maintained separately.

Do not modify mobile files as part of backend/admin/web work unless the task explicitly requires mobile changes.

Before committing, check that no generated Flutter or Gradle files were accidentally included.

---

## 27. Pull Requests

After committing:

```bash
git push -u origin feature/your-feature-name
```

Open a Pull Request:

```text
feature/your-feature-name → main
```

PRs should include:

- Summary
- Backend changes
- Frontend changes
- Database changes if applicable
- API changes
- Testing performed
- Known limitations
- Screenshots for meaningful UI changes when useful

Do not claim functionality that is not implemented.

---

## 28. Before Opening a Pull Request

### Backend

```bash
npm run build --workspace server
```

If the schema changed:

```bash
cd server
npx prisma validate
npx prisma generate
```

### Attendee Web

```bash
npm run build --workspace apps/web
```

### Admin Portal

```bash
npm run build --workspace apps/admin
```

Also test the relevant feature manually.

---

## 29. Current Implemented Features

Current implemented/integrated work includes:

- Authentication
- Role-based authorization
- User preferences
- Event CRUD
- Venue CRUD
- Zone CRUD
- Location CRUD
- Facility CRUD
- Incident management
- Announcement management
- Real admin dashboard
- Brand management
- Event offers
- Consumer interaction tracking
- Consumer Insights
- Attendee web authentication
- Event discovery
- Event details
- Facility information
- Active announcements
- Active offers
- Crowd ML backend integration
- Prototype one-hour crowd forecast

---

## 30. Current Pending Work

Pending or planned areas include:

- Queue ML integration
- Live/simulated/manual event-state layer
- Recommendation engine
- Personalized recommendations
- Smart navigation
- Interactive event map
- Real-time notifications
- AI event assistant
- Multilingual assistance
- Group/family mode
- Transportation intelligence
- Production event-specific crowd model
- Additional mobile integration
- Advanced analytics

Do not assume these are implemented until the code exists on the current branch.

---

## 31. Team Collaboration Rules

Before major changes:

1. Pull the latest `main`.
2. Check existing modules and docs.
3. Confirm module ownership.
4. Avoid overlapping changes where possible.
5. Discuss schema/API contract changes.
6. Use a feature branch.
7. Build and test locally.
8. Open a Pull Request.
9. Get the change reviewed before merging.

Coordinate especially before modifying:

- `server/prisma/schema.prisma`
- authentication
- shared route structure
- core API contracts
- workspace dependencies
- Docker configuration
- mobile app files
- ML integration contracts

---

## 32. Important Project Principles

### Use real data where available

Do not replace real backend/database data with fake dashboard values.

### Label prototype data honestly

Prototype crowd predictions must be described as estimates.

### Keep Consumer Behavior visible

Brand attraction, offers, preferences, and decision factors are part of the core project objective.

### Protect secrets

Never commit credentials.

### Keep one shared backend

The attendee app and admin portal must continue to use the shared Express API.

### Avoid destructive commands

Do not destroy database volumes or delete parent data casually.

---

## 33. Final Rule

Before changing the repository architecture, database schema, API contract, authentication system, ML integration contract, or technology stack:

> **Discuss the change with the team first.**

The goal is to keep all contributors working on one coherent Rahat Setu / EventFlow AI platform instead of creating conflicting implementations.
