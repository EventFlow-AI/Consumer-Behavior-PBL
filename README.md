# Rahat Setu (EventFlow AI)

> **Real-Time Intelligence Platform for Large-Scale Events**

Rahat Setu is the current implementation of the EventFlow AI vision: a large-scale event intelligence and decision-support platform designed for gatherings such as **Kumbh Mela, IPL matches, concerts, religious gatherings, college fests, exhibitions, conferences, and public festivals**.

Unlike conventional map applications that primarily answer **"Where is this place?"**, Rahat Setu aims to answer:

- **Where should I go right now?**
- **Which entrance or area is less crowded?**
- **Which route or facility is more convenient?**
- **Where is the nearest available medical or help facility?**
- **What important announcement should I know about?**
- **Which offer or brand should I choose?**
- **What factors are influencing my decision?**
- **What should I visit next?**
- **How do I get help quickly?**
- **What is happening around me right now?**

The platform currently consists of two major interfaces:

1. **User / Consumer Website**
2. **Organizer / Admin Portal**

The system combines event information, venue structure, crowd forecasting, facilities, incidents, announcements, consumer preferences, brand offers, and behavioral analytics into a single platform.

---

# 1. Problem Statement

## 1.1 Background

Mega events bring together thousands, hundreds of thousands, or even millions of people into a relatively limited geographical area.

Examples include:

- Kumbh Mela
- IPL and cricket matches
- Large concerts
- Religious gatherings
- College festivals
- Government/public events
- Trade exhibitions
- Conferences
- Theme parks
- Cultural festivals

At this scale, a conventional static map is insufficient.

A visitor may know where a particular gate, stage, washroom, food stall, parking area, or medical center is located, but that information does not tell them the **current or expected condition** of that location.

For example:

> Gate A may be 200 metres away, but another gate may be less crowded and faster to use.

Similarly:

> A facility may be geographically closer but less convenient because of crowd, queue, accessibility, or operational status.

The physical environment of a mega event is dynamic.

Crowd density, queues, road closures, transportation availability, emergencies, weather, event schedules, facility availability, promotions, and consumer preferences can all affect visitor decisions.

Therefore, visitors need more than navigation.

They need **situational intelligence and decision support**.

---

# 2. Core Problem

The central problem Rahat Setu aims to solve is:

> **How can visitors safely and efficiently navigate massive, dynamic events when crowd conditions, facilities, announcements, emergencies, offers, and event information continuously change?**

At the same time, event organizers face a second problem:

> **How can organizers obtain an operational view of the event and use it to manage facilities, incidents, announcements, brands, offers, and visitor experience?**

The Consumer Behavior layer introduces a third question:

> **How do consumers make choices inside events, and which strategies attract customers most effectively?**

Rahat Setu addresses all three through a connected visitor platform, organizer control system, and consumer-behavior analytics layer.

---

# 3. Visitor-Side Problems

## 3.1 Crowd Congestion

Large events frequently develop bottlenecks around:

- Entrances
- Exits
- Security checkpoints
- Food courts
- Washrooms
- Popular attractions
- Stages
- Religious sites
- Parking areas
- Transportation pickup points

### Problem

A visitor may choose the shortest geographical route without knowing that the route or destination is expected to become crowded.

### Rahat Setu

The platform currently includes a **prototype one-hour crowd forecast** for event locations.

The long-term system is intended to use available event data to:

- Estimate crowd density
- Identify congested areas
- Identify bottlenecks
- Recommend alternative areas/routes
- Provide crowd-aware decision support

### Current implementation status

The crowd pipeline is integrated end-to-end:

```text
Attendee Website
      ↓
Express Backend
      ↓
Crowd Adapter / Service
      ↓
External ML API
      ↓
Normalized Forecast
```

The current model is a **Würzburg pedestrian-flow prototype** and is explicitly presented as a prototype rather than production-ready live Rahat Setu intelligence.

---

# 3.2 Queue Management

Queues are one of the biggest sources of wasted time at mega events.

Queues may occur at:

- Entry gates
- Security checks
- Food stalls
- Washrooms
- Rides
- Attractions
- Registration desks
- Merchandise stores
- Parking exits
- Shuttle services

### Problem

Visitors generally have no reliable way of knowing which queue is currently shortest.

### Rahat Setu Vision

Users should eventually be able to see:

- Current/estimated queue length
- Estimated waiting time
- Queue status
- Alternative nearby options
- Historical/short-term queue trends

### Current implementation status

Queue ML integration is **planned / pending** and is not yet presented as implemented.

---

# 3.3 Medical Emergencies and Incidents

A visitor may:

- Faint
- Become dehydrated
- Get injured
- Experience a medical emergency
- Require first aid
- Need urgent assistance

### Problem

In a dense crowd, reporting and coordinating incidents can be difficult.

### Current implementation

Rahat Setu now includes an end-to-end **Incident Management** module.

Incidents support:

- Event association
- Optional event location
- Reporting user
- Incident type
- Severity
- Status
- Title
- Description
- Optional coordinates
- Resolution tracking

Supported incident types currently include:

```text
MEDICAL
SECURITY
FIRE
CROWD
LOST_PERSON
INFRASTRUCTURE
OTHER
```

Supported lifecycle states include:

```text
OPEN
ACKNOWLEDGED
IN_PROGRESS
RESOLVED
CLOSED
```

The admin portal allows authorized users to inspect and update incident status and severity.

---

# 3.4 Lost Children, Family Members and Friends

People frequently become separated in large crowds.

This is particularly problematic for:

- Families
- Children
- Elderly visitors
- Groups of friends

### Future direction

The platform may later support:

- Private groups
- Temporary location sharing
- Meeting points
- Group navigation
- Lost-person reporting
- Reunion/help centers

Location sharing must remain explicitly opt-in and privacy-conscious.

---

# 3.5 Language Barriers

Large events often attract people from different states, countries, and linguistic backgrounds.

Visitors may struggle to understand:

- Event announcements
- Directions
- Safety instructions
- Menus
- Signboards
- Emergency information
- Local terminology

### Future direction

The platform architecture is intended to support multilingual assistance.

Critical safety instructions should always be based on verified organizer information rather than unrestricted AI-generated content.

---

# 3.6 AI Tour Guide

Visitors may not know:

- What to see
- What to do next
- Which attractions are nearby
- How much time an activity requires
- What is currently available

### Future direction

An AI tour guide could eventually consider:

- Event schedule
- Venue layout
- User location
- Available time
- Crowd conditions
- User interests
- Accessibility needs

Example:

> "I have two hours and I'm with my parents. What should we visit?"

This is part of the planned recommendation / assistant layer and is not yet treated as a completed MVP feature.

---

# 3.7 Facility Discovery

Visitors often need to locate:

- Washrooms
- Drinking water
- Charging stations
- ATMs
- Seating areas
- First-aid stations
- Information desks
- Baby-care facilities
- Lost-and-found centers
- Accessibility facilities

### Current implementation

The current data model and admin portal support:

```text
Event
  └── Venue
       └── Zone
            └── Location
                 └── Facility
```

The attendee website can display venue, zone, location, facility, and facility-status information for an event.

---

# 3.8 Dynamic Announcements and Closures

Event conditions change during the day.

Admins may need to communicate:

- Gate closures
- Route changes
- Safety alerts
- Schedule changes
- Facility changes
- Crowd warnings
- General information

### Current implementation

Rahat Setu includes an Announcement module with:

```text
INFO
IMPORTANT
URGENT
```

Announcements support:

- Event association
- Title
- Message
- Priority
- Active/inactive state
- Optional start/end time

The attendee website retrieves active announcements for the selected event.

---

# 3.9 Information Overload

Mega events generate large amounts of information:

- Schedules
- Announcements
- Maps
- Venue rules
- Transportation information
- Safety instructions
- Food options
- Attractions
- Brand offers
- Facility information

Visitors may struggle to identify what is relevant to them.

### Rahat Setu

The long-term product direction is a contextual information layer based on:

- Event
- Location
- Preferences
- Crowd
- Facilities
- Offers
- Time
- Personal priorities

---

# 4. Organizer-Side Problems

Visitors are only one side of the problem.

Event organizers need operational visibility over the venue and a structured way to manage dynamic information.

---

# 4.1 Event & Venue Management

The admin portal currently supports CRUD management for:

- Events
- Venues
- Zones
- Locations
- Facilities

This creates the operational hierarchy used throughout the platform.

---

# 4.2 Emergency Response Coordination

During an incident, organizers need to know:

- What happened
- Where it happened
- How serious it is
- Current status
- Whether it has been resolved

### Current implementation

The incident module provides:

- Incident creation
- Location association
- Severity classification
- Status tracking
- Resolution tracking

---

# 4.3 Facility Monitoring

Organizers need visibility into:

- Gates
- Washrooms
- Food zones
- Water stations
- Parking
- Medical centers
- Entrances
- Exits
- Help desks
- Other facilities

### Current implementation

Facilities are modeled under event locations and can be created, updated, and inspected through the admin portal.

---

# 4.4 Announcements

Admins can create and manage event announcements and make only active information visible to attendees.

This allows organizers to quickly communicate event changes without hard-coding information into the attendee website.

---

# 4.5 Admin Dashboard

The dashboard is backed by real PostgreSQL data.

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

The dashboard endpoint is protected by the ADMIN role.

---

# 5. Consumer Behavior Layer

The academic objective of this project is not only event management.

A core requirement is to study:

> **Consumer decision-making and strategies to attract customers of leading brands.**

Rahat Setu therefore includes a dedicated Consumer Behavior module.

---

# 5.1 User Preferences

Current user-preference fields include:

- Price sensitivity
- Crowd preference
- Walking preference
- Accessibility requirements
- Brand preference
- Food preferences

These preferences can eventually contribute to personalized recommendations.

---

# 5.2 Brand Management

Admins can create and manage brands associated with the event ecosystem.

Brand information includes:

- Name
- Category
- Description
- Logo
- Active status

---

# 5.3 Promotional Offers

Offers connect brands with particular events.

Offer fields include:

- Brand
- Event
- Title
- Description
- Discount text
- Price
- Active status
- Optional start/end period

The attendee website can retrieve active event offers.

---

# 5.4 Consumer Interaction Tracking

Authenticated consumers can generate interaction records.

Supported interaction types include:

```text
VIEW
CLICK
SELECT
SAVE
REDEEM
```

Supported choice factors include:

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

Example:

```text
User: Attendee
Event: Rahat Setu
Brand: Nike
Offer: 20% off event merchandise
Action: SELECT
Choice Factor: DISCOUNT
Rating: 5
```

This connects the application directly to Consumer Behavior analysis.

---

# 5.5 Consumer Insights

The admin portal includes a Consumer Insights view.

Current analytics include:

- Total interactions
- Action breakdown
- Decision-factor breakdown
- Top choice factor
- Top brands
- Top offers
- Event-wise filtering

This allows the project to analyze which attraction strategies appear most influential.

---

# 6. Product Vision

Rahat Setu aims to become a **real-time operating, intelligence, and decision-support layer for mega events**.

The platform has two interconnected products:

### User Platform

**Discover → Decide → Navigate → Experience → Stay Safe**

### Organizer Platform

**Manage → Monitor → Coordinate → Analyze**

---

# 7. Product Structure

```text
                         RAHAT SETU
                      (EVENTFLOW AI)
                              |
               +--------------+--------------+
               |                             |
        USER / CONSUMER                ADMIN / ORGANIZER
            WEBSITE                       PORTAL
               |                             |
       +-------+-------+             +-------+-------+
       |       |       |             |       |       |
     Events  Crowd  Facilities    Events  Incidents Analytics
       |       |       |             |       |       |
       +-------+-------+             +-------+-------+
               |                             |
               +-------------+---------------+
                             |
                     EVENT INTELLIGENCE
                             |
       +---------------------+----------------------+
       |          |           |          |          |
     Crowd    Facilities   Incidents   Offers   Preferences
       |          |           |          |          |
       +----------+-----------+----------+----------+
                             |
                       DATA / AI LAYER
                             |
                  PostgreSQL + ML Service
```

---

# 8. Current Technology Stack

## Frontend

### Attendee Web

- React
- TypeScript
- Vite
- React Router
- Fetch-based API client
- Responsive custom CSS

### Admin Portal

- React
- TypeScript
- Vite
- React Router
- REST API integration

### Mobile

- Flutter workspace exists under `apps/mobile`
- Mobile development is maintained separately
- The currently integrated attendee MVP is the web application

---

## Backend

- Node.js
- Express
- TypeScript
- REST APIs
- JWT
- bcrypt
- Zod validation

---

## Database

- PostgreSQL 17
- Prisma ORM
- Docker / Docker Compose

Local development database:

```text
localhost:5433
```

---

## AI / ML

### Current

- External FastAPI crowd ML service
- HistGradientBoostingRegressor prototype
- One-hour pedestrian-flow forecast
- Backend feature adapter
- Model-version / model-scope reporting

### Planned

- Queue prediction
- Personalized recommendations
- Event-specific production crowd models
- AI event assistant
- Route recommendations

---

# 9. Current Monorepo Structure

```text
Consumer-Behavior-PBL/
│
├── apps/
│   ├── web/                       # Attendee website
│   ├── admin/                     # Admin portal
│   └── mobile/                    # Flutter mobile workspace
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

# 10. Current Database — High-Level Entities

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

# 11. Authentication

Authentication is implemented across the platform.

Users can:

- Register
- Login
- Access protected routes
- Retrieve their current user profile
- Sign out from frontend clients

The backend currently supports:

```text
USER
ADMIN
```

roles and role-based authorization.

Core endpoints:

```text
POST /api/v1/auth/register
POST /api/v1/auth/login
GET  /api/v1/auth/me
```

---

# 12. USER WEBSITE

## 12.1 Event Discovery

The attendee website currently provides:

- Live/upcoming event listing
- Event search
- Event status
- Event type
- Date and start time
- Navigation to event detail

---

## 12.2 Event Details

The event page currently includes:

- Event information
- Event status
- Event date/time
- Crowd section
- Announcements
- Venues
- Zones
- Locations
- Facilities
- Facility status
- Offers

The attendee UI is intentionally information-first and minimal.

---

## 12.3 Crowd Forecast

The attendee page can request a one-hour forecast for an event location.

The frontend sends event-state information to the backend rather than directly sending raw ML features.

Current request context includes:

```text
Location
Timestamp
Temperature
Weather condition
Incident context
Current crowd
Movement ratio
Historical lag values
```

The backend converts these into the model contract and calls the external ML service.

The response includes:

```text
Predicted pedestrian count
Unit
Forecast horizon
Model version
Model scope
```

### Important

The current crowd model is a **prototype** trained for a different pedestrian-flow setting.

It demonstrates the system architecture and prediction pipeline.

It is not claimed to be production-ready live crowd intelligence for Rahat Setu.

---

## 12.4 Announcements

The attendee website displays active announcements including:

- Priority
- Title
- Message

---

## 12.5 Facilities

The attendee event page displays:

- Venue
- Zone
- Location
- Facility
- Facility status

---

## 12.6 Offers

Active event offers can be displayed to attendees.

The website can show:

- Brand
- Offer title
- Discount/promotion
- Price

---

# 13. ADMIN / ORGANIZER PORTAL

The admin portal currently includes:

```text
Dashboard
Events
Venues
Zones
Locations
Facilities
Incidents
Announcements
Brands
Offers
Consumer Insights
```

---

# 13.1 Event Management

Admins can create, inspect, update, and delete events.

---

# 13.2 Venue Management

Admins can configure event venues.

---

# 13.3 Zone Management

Venues can be divided into operational zones.

---

# 13.4 Location Management

Zones contain meaningful event locations such as:

- Gates
- Stages
- Help areas
- Medical locations
- Facility points

---

# 13.5 Facility Management

Facilities can be attached to event locations and assigned operational status.

---

# 13.6 Incident Management

Admins can view event incidents and update status/severity.

---

# 13.7 Announcement Management

Admins can:

- Create announcements
- Edit announcements
- Toggle active state
- Delete announcements
- Set priority

---

# 13.8 Brand Management

Admins can manage brands used in Consumer Behavior experiments and event promotions.

---

# 13.9 Offer Management

Admins can associate promotional offers with events and brands.

---

# 13.10 Consumer Insights

The Consumer Insights dashboard summarizes stored consumer-interaction data.

---

# 14. Crowd Prediction Architecture

```text
Current Event State
       +
Weather Context
       +
Incident Context
       +
Historical Crowd Lags
       ↓
Backend Adapter
       ↓
ML Feature Contract
       ↓
Crowd Prediction API
       ↓
1-Hour Forecast
```

This architecture deliberately separates:

- frontend event concepts
- backend integration logic
- ML-specific feature representation

That makes it easier to replace the prototype ML service later without rewriting the attendee frontend.

---

# 15. Data Reliability Model

Not every data source should be treated equally.

Rahat Setu should maintain a clear distinction between:

### Live Mode

Actual organizer, sensor, external, or validated user data.

### Simulated Mode

Controlled data used for demonstrations and prototype testing.

### Manual Mode

Organizer-managed operational state.

### Predicted Mode

Model-generated estimates.

For example:

```text
Gate A

Predicted pedestrian flow:
473 pedestrians/hour

Forecast horizon:
1 hour

Source:
ML prototype

Model:
würzburg-prototype-v1
```

The platform should never present estimated information as guaranteed fact.

---

# 16. MVP

The MVP should not attempt to implement every long-term feature at once.

## Implemented Core

### User

- Authentication
- Event selection
- Event search
- Event details
- Active announcements
- Venue/facility discovery
- Brand offers
- Prototype crowd forecast

### Admin

- Admin authentication
- Event management
- Venue management
- Zone management
- Location management
- Facility management
- Incident management
- Announcements
- Real dashboard analytics
- Brand management
- Offer management
- Consumer Insights

### Consumer Behavior

- User preferences
- Brand data
- Promotional offers
- Consumer interaction tracking
- Choice-factor tracking
- Consumer analytics

---

# 17. Next Development Phases

## Phase 2 — Event Intelligence

Planned:

- Queue ML integration
- Live/simulated/manual state layer
- More dynamic crowd state
- Real-time notifications
- Event map
- Smarter facility recommendations

---

## Phase 3 — Recommendations & AI

Planned:

- Personalized recommendations
- AI event assistant
- AI tour guide
- Smart navigation
- User-specific attraction strategies
- More advanced consumer segmentation

---

## Phase 4 — Advanced Infrastructure

Potential future features:

- IoT integration
- Occupancy sensors
- Computer vision
- Advanced crowd analytics
- Digital twin of venue
- Offline-first navigation
- Edge processing
- Advanced emergency coordination

---

# 18. Important MVP Principle

The product should not claim to provide real-time information unless the underlying event has a reliable data source.

For example:

> "Washroom occupancy: 32%"

requires an actual mechanism for measuring or estimating occupancy.

Similarly:

> "Live crowd: 12,000"

must only be shown if supported by a real data source.

Prototype predictions should be labeled as predictions.

This keeps the architecture realistic while still allowing a strong demonstrable prototype.

---

# 19. Key Product Differentiator

Rahat Setu should not position itself as another map.

The fundamental difference is:

```text
Traditional Map

Where is the destination?
        ↓
      Route
```

versus:

```text
Rahat Setu

What should I do or choose right now?
        ↓
Considering:
Crowd
Queue
Safety
Time
Facilities
Distance
Offers
Preferences
Brand familiarity
Convenience
        ↓
Context-Aware Decision
```

The product therefore acts as an **event intelligence and consumer decision-support layer**, rather than simply a digital map.

---

# 20. Success Metrics

## Visitor Metrics

Potential metrics include:

- Navigation success rate
- Time saved
- Queue waiting-time reduction
- Facility discovery rate
- Crowd-forecast usage
- Offer engagement
- User satisfaction

## Organizer Metrics

Potential metrics include:

- Incident response time
- Facility downtime
- Announcement engagement
- Crowd bottleneck duration
- Event operational efficiency

## Consumer Behavior Metrics

Current / planned analysis includes:

- Total interactions
- Views
- Clicks
- Selections
- Saves
- Redemptions
- Top decision factors
- Top brands
- Top offers
- Rating trends

---

# 21. Privacy & Safety Requirements

Because the platform may handle location and emergency information, privacy must remain a core product requirement.

The system should implement:

- Explicit location permission
- Opt-in group location sharing
- Temporary location sharing
- Data minimization
- Role-based admin access
- Secure authentication
- Appropriate data-retention policies
- Emergency access controls

The system should avoid exposing individual visitor locations publicly.

Emergency functionality should supplement, not replace, official emergency services.

---

# 22. Development Setup

## Prerequisites

Install:

- Git
- Node.js 24+
- npm
- Docker Desktop

---

## Clone

```bash
git clone https://github.com/EventFlow-AI/Consumer-Behavior-PBL.git
cd Consumer-Behavior-PBL
```

Install dependencies:

```bash
npm install
```

---

## Environment

Create:

```text
server/.env
```

from:

```text
server/.env.example
```

Windows PowerShell:

```powershell
Copy-Item server\.env.example server\.env
```

Core local values include:

```env
DATABASE_URL="postgresql://eventflow:eventflow_dev@localhost:5433/eventflow"
JWT_SECRET="replace_with_a_long_random_secret"

ML_API_BASE_URL="http://your-ml-service"
ML_API_KEY="replace_with_your_local_api_key"
ML_CROWD_ENDPOINT="/internal/v1/predictions/crowd/next-hour"
```

Never commit real secrets.

---

## Start PostgreSQL

```bash
docker compose up -d
```

The local database is exposed on:

```text
localhost:5433
```

---

## Prisma

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

## Run Backend

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

## Run Attendee Web

From project root:

```bash
npm run dev --workspace apps/web
```

---

## Run Admin Portal

From project root:

```bash
npm run dev --workspace apps/admin
```

---

# 23. Build Commands

Backend:

```bash
npm run build --workspace server
```

Attendee web:

```bash
npm run build --workspace apps/web
```

Admin:

```bash
npm run build --workspace apps/admin
```

---

# 24. Current Development Status

## Completed

- Monorepo/workspace setup
- PostgreSQL Docker setup
- Prisma ORM and migrations
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
- Event search
- Event detail experience
- Facility information
- Active announcements
- Active offers
- Crowd backend integration
- One-hour prototype crowd forecast

## Integrated Prototype

- Würzburg-based crowd prediction model

## Pending

- Queue ML
- Recommendation engine
- Live/simulated event-state layer
- Smart navigation
- Interactive map
- Real-time notifications
- AI event assistant
- Multilingual support
- Group/family mode
- Transportation intelligence
- Production event-specific crowd model
- Advanced post-event analytics

---

# 25. Final Product Concept

Rahat Setu can ultimately be viewed as three layers:

### Layer 1 — EXPERIENCE

```text
Discover
Navigate
Explore
Decide
Stay Safe
```

### Layer 2 — INTELLIGENCE

```text
Crowd Intelligence
Queue Intelligence
Consumer Insights
Recommendations
Predictions
AI Assistance
```

### Layer 3 — OPERATIONS

```text
Manage
Monitor
Respond
Coordinate
Analyze
```

Together:

```text
                     RAHAT SETU
                   (EVENTFLOW AI)
                         |
              +----------+----------+
              |                     |
        VISITOR WEBSITE       ORGANIZER PORTAL
              |                     |
          Experience             Operations
              |                     |
              +----------+----------+
                         |
                 EVENT INTELLIGENCE
                         |
           +-------------+-------------+
           |             |             |
         PEOPLE         PLACE          TIME
           |             |             |
      Preferences    Facilities      Schedule
      Decisions      Crowd           Events
      Offers         Incidents       Forecasts
           |             |             |
           +-------------+-------------+
                         |
                         ↓
              DATA + AI + ANALYTICS
                         |
                         ↓
              CONTEXT-AWARE DECISIONS
```

---

# 26. Core Proposition

> **Rahat Setu transforms static event information into an intelligent decision-support layer that helps visitors make better choices and gives organizers operational and consumer-behavior visibility over complex physical events.**

---

# 27. One-Sentence Pitch

> **Rahat Setu is a large-scale event intelligence platform that helps visitors make better decisions about crowds, facilities, alerts, offers, and event experiences while giving organizers operational and consumer-behavior insights.**
