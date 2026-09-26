# Contributing to EventFlow AI

Thank you for contributing to EventFlow AI.

This document explains how to set up the project locally, run the applications, and contribute changes.

---

## 1. Prerequisites

Before starting, make sure you have:

- Git
- Node.js 24+
- npm

Check your versions:

```bash
node --version
npm --version
git --version
```

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

Do not run separate dependency installations inside `apps/web`, `apps/admin`, or `server` unless specifically instructed.

---

## 4. Project Structure

```text
Consumer-Behavior-PBL/
│
├── apps/
│   ├── web/                 # User App / Website
│   └── admin/               # Admin Portal
│
├── server/                  # Express + TypeScript backend
│   ├── src/
│   │   ├── app.ts
│   │   └── server.ts
│   ├── package.json
│   └── tsconfig.json
│
├── package.json             # Root workspace configuration
├── package-lock.json
├── README.md
└── CONTRIBUTING.md
```

---

## 5. Running the User App

Open a terminal at the project root:

```bash
cd apps/web
npm run dev
```

Vite will provide a local URL, normally:

```text
http://localhost:5173
```

The User App is the visitor-facing EventFlow AI interface.

---

## 6. Running the Admin Portal

Open another terminal:

```bash
cd apps/admin
npm run dev
```

Vite will provide a local URL, normally:

```text
http://localhost:5174
```

The Admin Portal is the organizer/admin-facing interface.

---

## 7. Running the Backend

Open another terminal:

```bash
cd server
npm run dev
```

The backend runs on:

```text
http://localhost:5000
```

Current health-check endpoint:

```text
http://localhost:5000/api/v1/health
```

Expected response:

```json
{
  "success": true,
  "message": "EventFlow AI API is running"
}
```

---

## 8. Running Everything

For the current development setup, use three terminals.

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

---

## 9. Git Workflow

Before starting new work:

```bash
git pull origin main
```

Create a feature branch:

```bash
git checkout -b feature/your-feature-name
```

Examples:

```bash
git checkout -b feature/event-map
git checkout -b feature/admin-dashboard
git checkout -b feature/recommendation-engine
```

After making changes:

```bash
git status
git add .
git commit -m "feat: add event map"
```

Push your branch:

```bash
git push -u origin feature/event-map
```

Then create a Pull Request on GitHub.

---

## 10. Branch Naming

Use descriptive branch names.

### Features

```text
feature/<feature-name>
```

Example:

```text
feature/smart-navigation
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

## 11. Commit Messages

Use clear commit messages.

Recommended format:

```text
type: short description
```

Examples:

```text
feat: add event listing page
feat: add admin dashboard
fix: resolve map loading issue
refactor: organize API routes
docs: update contributor guide
chore: update dependencies
```

Keep commits focused on one logical change.

---

## 12. Important Git Rules

### Never commit `node_modules`

The repository already ignores:

```text
node_modules/
```

### Never commit environment secrets

Do not commit:

```text
.env
.env.*
```

If environment variables are required, use:

```text
.env.example
```

with placeholder values.

### Do not commit build output

The following are ignored:

```text
dist/
build/
.vite/
```

---

## 13. Before Opening a Pull Request

Run:

```bash
git status
```

Make sure there are no unintended files.

For frontend changes, verify the application runs:

```bash
npm run dev
```

For backend changes, verify the server runs:

```bash
npm run dev
```

If applicable, also run the build command:

```bash
npm run build
```

---

## 14. Current Development Status

The project currently contains:

- User App scaffold
- Admin Portal scaffold
- Express + TypeScript backend
- npm workspace/monorepo setup
- Backend health-check endpoint
- Git/GitHub workflow

The following parts will be added during development:

- PostgreSQL database
- Prisma ORM
- Authentication
- Event management
- Venue/map system
- Crowd and queue system
- Smart navigation
- Consumer decision-support features
- Brand/campaign/offer system
- Recommendations
- AI features
- Analytics
- Real-time updates

Do not assume an item above is already implemented unless it exists in the current codebase.

---

## 15. Development Architecture

EventFlow AI is being developed as a single project with:

```text
User App
    │
    ├──────────┐
    │          │
    ▼          ▼
             Backend API
                │
                ▼
             Database
                ▲
                │
    ┌───────────┘
    │
Admin Portal
```

The User App and Admin Portal share the same backend rather than having separate backend implementations.

---

## 16. Collaboration Guidelines

Before making a major architectural change:

1. Discuss it with the team.
2. Check the existing PRD and technical plan.
3. Create a separate feature branch.
4. Keep the change focused.
5. Open a Pull Request for review.

For larger changes, update the relevant documentation as well.