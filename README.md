# Rahat Setu (EventFlow AI)

> **Real-Time Intelligence Platform for Large-Scale Events**

Rahat Setu, developed under the EventFlow AI project, is a large-scale event intelligence platform designed to help visitors make better decisions during dynamic events while giving organizers a unified operational view.

The project is being developed as part of a **Consumer Behavior PBL**, with two linked objectives:

1. Support **consumer decision-making** during large events.
2. Study and implement **strategies used to attract customers**, including brand offers, promotions, preferences, and consumer interaction analytics.

The platform currently consists of:

- **Attendee Web App** — event discovery, event information, announcements, facilities, offers, and prototype crowd forecasting.
- **Admin Portal** — operational event management, incidents, announcements, dashboard analytics, brand/offer management, and consumer insights.
- **Backend API** — Express + TypeScript REST API shared by both frontends.
- **PostgreSQL Database** — managed locally through Docker and Prisma ORM.
- **Crowd ML Integration** — one-hour crowd forecasting through an external prototype ML service.
- **Mobile App Workspace** — Flutter workspace maintained separately; the current attendee web experience is the primary integrated user-facing interface in this repository.

---

## 1. Problem Statement

Mega events such as pilgrimages, sports matches, concerts, festivals, exhibitions, conferences, and college fests create rapidly changing conditions.

Visitors may need to decide:

- Which event or activity to attend.
- Which gate or area to use.
- Where facilities are located.
- Whether an area is expected to become crowded.
- Which announcements are currently important.
- Which brand or promotional offer is most attractive.
- How price, discounts, distance, crowd, queue, familiarity, and convenience influence their decisions.

Organizers simultaneously need visibility into:

- Events and venue structure.
- Facilities and operational status.
- Incidents and emergencies.
- Announcements.
- Event activity.
- Customer-attraction strategies.
- Consumer interaction patterns.

Rahat Setu combines these concerns into a single event intelligence platform.

---

## 2. Consumer Behavior Objective

This project is not only an event-management system.

The Consumer Behavior layer is designed to capture and analyze how attendees make decisions during events.

The system currently supports:

- User preferences.
- Brand management.
- Event-specific promotional offers.
- Consumer interaction tracking.
- Choice-factor tracking.
- Consumer insights and analytics.

Tracked interaction types include:

```text
VIEW
CLICK
SELECT
SAVE
REDEEM
```

Tracked decision factors include:

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

This allows the project to answer questions such as:

- Which strategies attract customers most effectively?
- Which brands receive the most engagement?
- Which offers generate the most interaction?
- Is discount more influential than brand familiarity?
- Do crowd and queue conditions affect consumer decisions?

---

## 3. Current Product Structure

```text
                         RAHAT SETU
                      (EventFlow AI)
                              |
            +-----------------+-----------------+
            |                                   |
      ATTENDEE WEB                        ADMIN PORTAL
      React + TS                           React + TS
            |                                   |
            +-----------------+-----------------+
                              |
                         Express API
                         TypeScript
                              |
             +----------------+----------------+
             |                                 |
          Prisma                          Crowd ML API
             |                           Prototype Model
             |
         PostgreSQL
           Docker
```

Both frontends use the same backend API and database.

---

## 4. Monorepo Structure

```text
Consumer-Behavior-PBL/
│
├── apps/
│   ├── web/                 # Attendee-facing React + TypeScript web app
│   ├── admin/               # Organizer/admin React + TypeScript portal
│   └── mobile/              # Flutter mobile workspace
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

---

## 5. Technology Stack

### Attendee Web

- React
- TypeScript
- Vite
- React Router
- Fetch-based API client

### Admin Portal

- React
- TypeScript
- Vite
- React Router
- Fetch-based API client

### Backend

- Node.js
- Express
- TypeScript
- Zod
- JWT authentication
- bcrypt password hashing

### Database

- PostgreSQL 17
- Docker / Docker Compose
- Prisma ORM

### Crowd Intelligence

- External FastAPI ML service
- HistGradientBoostingRegressor prototype
- One-hour pedestrian-flow forecast
- Würzburg pedestrian-flow prototype dataset/model scope

---

## 6. Current Database Models

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

Important enums include:

```text
UserRole
EventType
EventStatus
LocationType
FacilityStatus
IncidentType
IncidentSeverity
IncidentStatus
AnnouncementPriority
InteractionType
ChoiceFactor
```

---

## 7. Authentication

Implemented functionality:

- User registration
- User login
- Password hashing with bcrypt
- JWT generation and verification
- Protected routes
- Current-user endpoint
- Role-based authorization
- USER and ADMIN roles

Core endpoints:

```text
POST /api/v1/auth/register
POST /api/v1/auth/login
GET  /api/v1/auth/me
```

---

## 8. Core Event Management

The admin portal supports CRUD management for:

```text
Event
  └── Venue
       └── Zone
            └── Location
                 └── Facility
```

Core route groups include:

```text
/api/v1/events
/api/v1/venues
/api/v1/zones
/api/v1/locations
/api/v1/facilities
```

Admin write operations are protected by role-based authorization.

---

## 9. User Preferences

Users can store decision-support preferences including:

- Price sensitivity
- Crowd preference
- Walking preference
- Accessibility requirement
- Brand preference
- Food preferences

Endpoints:

```text
GET /api/v1/preferences/me
PUT /api/v1/preferences/me
```

---

## 10. Incident Management

Rahat Setu includes end-to-end incident reporting and management.

Incident information includes:

- Event
- Optional event location
- Reporting user
- Type
- Severity
- Status
- Title
- Description
- Optional coordinates
- Resolution timestamp

Supported types include:

```text
MEDICAL
SECURITY
FIRE
CROWD
LOST_PERSON
INFRASTRUCTURE
OTHER
```

Supported statuses include:

```text
OPEN
ACKNOWLEDGED
IN_PROGRESS
RESOLVED
CLOSED
```

The admin portal provides event-wise incident monitoring and severity/status updates.

---

## 11. Announcements

Admins can create and manage event announcements with:

- Event association
- Title
- Message
- Priority
- Active/inactive status
- Optional start/end time

Priorities:

```text
INFO
IMPORTANT
URGENT
```

The attendee web app retrieves currently active announcements.

---

## 12. Admin Dashboard

The admin dashboard uses real PostgreSQL-backed data.

Current metrics include:

- Total events
- Live events
- Upcoming events
- Venues
- Zones
- Locations
- Facilities
- Active incidents
- Critical incidents
- Active announcements
- Urgent announcements
- Recent incidents

Endpoint:

```text
GET /api/v1/admin/dashboard
```

---

## 13. Brand & Offer Management

### Brands

Admins can manage participating brands with fields such as name, category, description, logo URL, and active status.

### Offers

Offers connect a brand to a specific event and may include:

- Title
- Description
- Discount/promotion text
- Price
- Active status
- Optional start/end time

The attendee web app retrieves active event offers.

---

## 14. Consumer Interaction Tracking

Authenticated users can record interactions with event brands and offers.

Example:

```text
User: Test User
Event: Rahat Setu
Brand: Nike
Offer: 20% off event merchandise
Action: SELECT
Factor: DISCOUNT
Rating: 5
```

Endpoints:

```text
POST /api/v1/interactions
GET  /api/v1/interactions/me
```

The backend validates that selected offers belong to the specified event and brand.

---

## 15. Consumer Insights

The admin portal includes Consumer Insights analytics for:

- Total interactions
- Interaction breakdown by action
- Decision-factor breakdown
- Top choice factor
- Top brands
- Top promotional offers
- Optional event-wise filtering

Endpoint:

```text
GET /api/v1/admin/consumer-insights
```

Optional filter:

```text
?eventId=<EVENT_ID>
```

---

## 16. Crowd Forecasting

The current crowd feature integrates an external ML prototype through the backend.

Endpoint:

```text
POST /api/v1/crowd/predict
```

The backend receives event-style crowd state, converts it into ML features, calls the external ML API, and normalizes the result for the frontend.

Current output includes:

- Predicted pedestrian count
- Unit
- Prediction horizon
- Model version
- Model scope

The attendee website presents this as a **1-hour crowd forecast**.

### Prototype Limitation

The currently integrated model is a **Würzburg pedestrian-flow prototype**.

It demonstrates the crowd-prediction pipeline and ML integration, but it must **not** be described as production-ready or as actual live Rahat Setu crowd intelligence.

---

## 17. Attendee Web App

The attendee-facing web app currently supports:

- Register
- Login
- Protected routes
- Sign out
- Live/upcoming event discovery
- Event search
- Event status/type information
- Event details
- Active announcements
- Venue/zone/location/facility information
- Facility status
- Active promotional offers
- One-hour crowd forecast

The current attendee UI follows a minimal, information-first event utility design.

---

## 18. Admin Portal

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

---

## 19. Local Development

### Prerequisites

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

---

## 20. Clone & Install

```bash
git clone https://github.com/EventFlow-AI/Consumer-Behavior-PBL.git
cd Consumer-Behavior-PBL
npm install
```

---

## 21. Environment Variables

Create `server/.env` from `server/.env.example`.

Windows PowerShell:

```powershell
Copy-Item server\.env.example server\.env
```

Core development variables include:

```env
DATABASE_URL="postgresql://eventflow:eventflow_dev@localhost:5433/eventflow"
JWT_SECRET="replace_with_a_long_random_secret"
ML_API_BASE_URL="http://your-ml-service"
ML_API_KEY="replace_with_your_local_api_key"
ML_CROWD_ENDPOINT="/internal/v1/predictions/crowd/next-hour"
```

Never commit real secrets.

---

## 22. Start PostgreSQL

```bash
docker compose up -d
```

Local EventFlow PostgreSQL:

```text
localhost:5433
```

Do not use:

```bash
docker compose down -v
```

unless you intentionally want to delete the local database volume.

---

## 23. Prisma Setup

```bash
cd server
npx prisma generate
npx prisma migrate dev
```

Optional:

```bash
npx prisma studio
```

---

## 24. Run the Backend

```bash
cd server
npm run dev
```

Backend:

```text
http://localhost:5000
```

Health check:

```text
GET /api/v1/health
```

---

## 25. Run the Attendee Web App

```bash
npm run dev --workspace apps/web
```

or:

```bash
cd apps/web
npm run dev
```

---

## 26. Run the Admin Portal

```bash
npm run dev --workspace apps/admin
```

or:

```bash
cd apps/admin
npm run dev
```

---

## 27. Build Commands

```bash
npm run build --workspace server
npm run build --workspace apps/web
npm run build --workspace apps/admin
```

Run the relevant build before opening a Pull Request.

---

## 28. Current Development Status

### Implemented

- Monorepo/workspace setup
- PostgreSQL Docker setup
- Prisma schema and migrations
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
- Offer management
- Consumer interaction tracking
- Consumer Insights analytics
- Attendee web authentication
- Event discovery
- Event details
- Facility discovery
- Active announcements
- Active offers
- Crowd ML integration
- One-hour prototype crowd forecast

### Integrated Prototype

- Crowd forecasting using the Würzburg prototype ML model

### Pending / Planned

- Queue ML integration
- Unified live/simulated event-state layer
- Recommendation engine
- Personalized recommendations
- Smart navigation
- Interactive event map
- Real-time notifications
- Group/family mode
- Multilingual assistance
- AI event assistant
- Transportation intelligence
- Production event-specific crowd model
- Post-event advanced analytics
- Deeper mobile integration

---

## 29. MVP Data Principle

Rahat Setu should never claim that information is live unless a reliable underlying data source exists.

The architecture should distinguish:

### Live Mode

Real organizer, sensor, external, or validated user data.

### Simulated Mode

Controlled data for demonstrations and prototype testing.

### Manual Mode

Organizer-managed operational state.

Prototype ML predictions must be clearly identified as estimates.

---

## 30. Privacy & Safety

The product should follow:

- Data minimization
- Explicit location permission
- Opt-in sharing
- Secure authentication
- Role-based administrative access
- Appropriate retention policies
- Protection of user location information
- Verified organizer data for safety-critical information

Emergency functionality must supplement, not replace, official emergency services.

---

## 31. Key Product Differentiator

Rahat Setu is not intended to be another static event map.

```text
Traditional map

Where is the destination?
        ↓
      Route


Rahat Setu

What should I do or choose right now?
        ↓
Considering:
Crowd
Queue
Distance
Safety
Facilities
Time
Offers
Preferences
        ↓
Context-aware decision
```

The project therefore acts as an **event intelligence and consumer decision-support layer**.

---

## 32. One-Sentence Pitch

> **Rahat Setu is an event intelligence platform that helps visitors make better decisions about crowds, facilities, alerts, offers, and event experiences while giving organizers operational and consumer-behavior insights.**
