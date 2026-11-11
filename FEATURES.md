# Rahat Setu (EventFlow AI) — Platform Features

> Comprehensive feature inventory across the Mobile App, Web Admin Portal, Attendee Web App, Backend API, and ML Crowd Prediction Service on `main`.

---

## 1. Mobile App (`apps/mobile` — Flutter)

Entry point: `apps/mobile/lib/main.dart` (`RahatSetuApp` → `LoginScreen`).

### 1.1 Authentication & Onboarding (`lib/screens/login_screen.dart`)
- **Multi-Language Selector:** Modal bottom sheet supporting 11 languages:
  - English, Hindi, Bengali, Tamil, Telugu, Marathi, Gujarati, Kannada, Malayalam, Punjabi, and Odia.
- **Phone + OTP Flow:** `IN +91` mobile number input with `Continue with OTP` navigation to `HomeScreen`.
- **Guest / Pilgrim Fast-Path:** `Continue as Pilgrim / Guest` bypass to access navigation and safety screens without signing in.
- **Field Volunteers & Marshals Card:** Dedicated portal card (`_buildVolunteerPortalCard`) for duty roster & mesh response access.

### 1.2 Home Hub & Context Engine (`lib/screens/home_screen.dart`)
- **Mesh Sync Status Banner:** Displays offline/peer relay readiness (`Mesh Sync Active • BT Relaying 14 Peers`, `100% OFFLINE-READY`).
- **Live Venue Pulse Card:** Event header (`MAHA KUMBH 2025`) with venue crowd/pulse overview.
- **2×2 Quick Action Grid:**
  - **Shortest Queue** → `QueueRadarScreen`
  - **Find My Family** → `FamilyRadarScreen`
  - **Water & WC** → `WaterWcScreen`
  - **Medical / SOS** → `MedicalSosScreen`
- **Nearby Amenities Bar (Sector 4):** Quick-status cards for:
  - **Toilets** (opens `WaterWcScreen` filtered to restrooms)
  - **Water ATM** (opens `WaterWcScreen` filtered to water ATMs)
  - **Lost/Found** camp summary
- **AI Context Engine ("Where Should I Go?" / EventFlow AI):**
  - **Quiet Ghat Dip** recommendation card with interactive **Quiet Spot Reservation Dialog** (`_QuietSpotReservationDialog`).
  - **Food & Prasadam** recommendation card.
  - **Upcoming Ritual / Ganga Aarti Surge** alert card.
- **Bottom Navigation Bar:** `Home`, `Crowd Map`, `My Group`, and `SOS & Help` (opens `MedicalSosScreen`).

### 1.3 Queue Radar (`lib/screens/queue_radar_screen.dart`)
- **Category Filter Chips (`QueueCategory`):**
  - `General Entry`, `Senior & Divyangjan`, `VIP / Pass Holders`, `Prasadam / Food`.
- **Accessibility Toggle:** Filter gates by step-free / ramp accessibility (`_stepFreeOnly`).
- **Fastest Gate Hero & Gate Comparison Cards:** Displays estimated wait time (minutes), walking distance/time, active vs. total lanes, throughput per minute, capacity ratio, and crowd trend (`falling`, `stable`, `rising`).
- **Turn-by-Turn Navigation:** Step-by-step gate directions and an active navigation banner (`_buildActiveNavigationBanner`).
- **Refresh & Crowd Insight Tip:** Manual refresh button (`_refreshData`) and crowd-avoidance guidance.

### 1.4 Find My Family Radar (`lib/screens/family_radar_screen.dart`)
- **Backend HTTP + WebSocket Sync (with offline fallback):**
  - Fetches active group state from `GET /api/v1/family/active`.
  - Connects to `ws://.../ws/family` for real-time `RING_BUZZER`, `BUZZER_TRIGGERED`, and `MEMBER_LOCATION_CHANGED` events, with a live sync status badge (`_buildBackendSyncBadge`).
- **Interactive Polar Radar Canvas (`_RadarPainter`):** Plots linked family members by distance (meters) and angle, with selectable member cards showing relation, distance, battery percentage, and last-updated time.
- **Acoustic Buzzer Alert:** Sends real-time chime/buzzer alerts to a selected family member over WebSocket (`_sendBuzzerAlert`).
- **Group Invite & Join Sheet (`_showInviteSheet`):** Displays the active 6-character group invite code (e.g., `EVF-123`) and supports joining a group via code (`_joinGroupByApi`).
- **Meeting Point Card & Direct SOS Shortcut:** Displays designated rally point details and one-tap navigation to `MedicalSosScreen`.

### 1.5 Water & Restrooms (`lib/screens/water_wc_screen.dart`)
- **Search & Category Filtering (`WaterWcCategory`):** Search input plus category pills for `All Facilities`, `Water ATMs`, and `Restrooms / Toilets`.
- **Facility Cards & Detail Bottom Sheet:** Shows distance, walk time, operational status, cleanliness rating, ramp accessibility, and facility specs (e.g., RO/TDS water specs or Western/Indian/Divyang stall counts).
- **Turn-by-Turn Directions Dialog:** Step-by-step walking directions (`_showDirectionsDialog`).
- **Report Facility Issue Dialog (`_showReportIssueDialog`):** Demo issue reporting for `No Water`, `Broken Tap / Leakage`, `Dirty Toilet / Needs Cleaning`, `Long Queue`, `Ramp Access Blocked`, or `Other Issue`.

### 1.6 Medical & Emergency SOS (`lib/screens/medical_sos_screen.dart`)
- **Live Coordinate Card:** Displays current sector/coordinate info for emergency responders.
- **SOS Alarm Activation & Cancellation:** High-priority SOS trigger card with active alarm state and cancel control.
- **Instant Triage Assistance (Demo Dispatch):** 2×2 quick-dispatch triggers:
  - **Medical / Injury** (Paramedic & First Aid Kit)
  - **Crowd Bottleneck** (Sector Marshal Crowd Control)
  - **Missing Member** (Lost & Found Camp Announcement)
  - **Mobility Assist** (Divyangjan Stretcher Escort)
- **Nearest Medical Facilities:** Nearby medical tents/kiosks with step-by-step directions dialog (`_showDirectionsDialog`).
- **Emergency Helplines:** Helpline cards with simulated call dialog (`_showSimulatedCallDialog`).

---

## 2. Web Admin Portal (`apps/admin` — React + TypeScript)

Entry point & routing: `apps/admin/src/App.tsx`, protected by `ProtectedRoute` inside `AdminLayout` (`apps/admin/src/layouts/AdminLayout.tsx`).

### 2.1 Authentication (`src/pages/LoginPage.tsx`)
- Admin sign-in with protected route guarding and sign-out in `AdminLayout`.

### 2.2 Operations Dashboard (`src/pages/DashboardPage.tsx`)
- **Event Operations Summary:** Counts for total, live, and upcoming events; active and critical incidents; active and urgent announcements.
- **Infrastructure Summary:** Counts for configured venues, zones, locations, and facilities.
- **Recent Incidents Table:** Latest reported incidents with title, type, event, location, severity, status, and reported timestamp.

### 2.3 Event & Infrastructure Management
- **Events (`src/pages/EventsPage.tsx`):** Create, edit, and delete events with status (`DRAFT`, `UPCOMING`, `LIVE`, etc.) and type (`CONCERT`, `SPORTS`, `PILGRIMAGE`, etc.).
- **Venues (`src/pages/VenuesPage.tsx`):** Event-scoped CRUD for venues.
- **Zones (`src/pages/ZonesPage.tsx`):** Event- and venue-scoped CRUD for operational zones.
- **Locations (`src/pages/LocationsPage.tsx`):** Event-, venue-, and zone-scoped CRUD for mapped locations (`GATE`, `EXIT`, `STAGE`, etc.) with latitude/longitude coordinates.
- **Facilities (`src/pages/FacilitiesPage.tsx`):** Location-scoped CRUD for facilities with operational status (`AVAILABLE`, `BUSY`, `FULL`, etc.).

### 2.4 Safety & Communications
- **Incidents (`src/pages/IncidentsPage.tsx`):** Filter by event, inspect reported incidents (`MEDICAL`, `SECURITY`, `FIRE`, `CROWD`, `LOST_PERSON`, `INFRASTRUCTURE`, `OTHER`), and update:
  - **Severity:** `LOW`, `MEDIUM`, `HIGH`, `CRITICAL`
  - **Status:** `OPEN`, `ACKNOWLEDGED`, `IN_PROGRESS`, `RESOLVED`, `CLOSED`
- **Announcements (`src/pages/AnnouncementsPage.tsx`):** Event-scoped CRUD for announcements with priority levels (`INFO`, `IMPORTANT`, `URGENT`) and active/inactive toggling.

### 2.5 Brands, Offers & Consumer Behavior Analytics
- **Brands (`src/pages/BrandsPage.tsx`):** Create, edit, delete, and toggle active status for partner brands and categories.
- **Offers (`src/pages/OffersPage.tsx`):** Event- and brand-linked CRUD for promotional offers with active/inactive toggling.
- **Consumer Insights (`src/pages/ConsumerInsightsPage.tsx`):** Filterable across all events or a single event:
  - **Decision-Making Overview:** Total recorded interactions, top choice factor, brands engaged, and offers engaged.
  - **Consumer Actions Breakdown:** Interaction counts grouped by action type.
  - **Decision Factors Table:** Choice factor counts and percentage share.
  - **Top Brands & Top Promotional Offers:** Ranked engagement tables.

---

## 3. Attendee Web App (`apps/web` — React + TypeScript)

- **Authentication (`src/pages/LoginPage.tsx`, `src/pages/RegisterPage.tsx`):** Email/password login and account registration via `/api/v1/auth/*` with `ProtectedRoute` gating in `src/App.tsx`.
- **Event Discovery (`src/pages/HomePage.tsx`):** Browse and search events and open event detail views.
- **Event Details & Decision Support (`src/pages/EventDetailsPage.tsx`):**
  - **Announcements & Venue Tree:** Active announcements and full venue → zone → location → facility hierarchy.
  - **Crowd Forecast Tool (`src/api/crowd.ts`):** Predicts next-hour crowd count using location, timestamp, temperature, weather condition, incident flag, current crowd, `towardsRatio`, and historical lag inputs (`lag1h`, `lag2h`, `lag3h`, `lag24h`, `lag168h`).
  - **Offer Recommendations (`src/utils/recommendOffers.ts`):** Ranks active offers based on selected priority (`PRICE`, `DISCOUNT`, `BRAND_FAMILIARITY`, `CONVENIENCE`, `DISTANCE`, `CROWD`, `QUEUE`, `OTHER`).
  - **Consumer Interaction Tracking (`src/api/interactions.ts`):** Captures offer actions and selected `ChoiceFactor` reasons for admin analytics.

---

## 4. Backend API (`server` — Express + Prisma + WebSockets)

Mounted in `server/src/app.ts` under `/api/v1`:
- **Health Check:** `GET /api/v1/health`
- **Auth & Preferences:** `/api/v1/auth`, `/api/v1/preferences`
- **Event Infrastructure:** `/api/v1/events`, venues, zones, locations, and facilities endpoints
- **Safety & Admin Operations:** incidents, announcements, and `/api/v1/dashboard` endpoints
- **Consumer Behavior:** brands, offers, interactions, and consumer-insights endpoints
- **Crowd Prediction Proxy:** `/api/v1/crowd`
- **Find My Family Real-Time Service:** `/api/v1/family` REST routes + `/ws/family` WebSocket server (`server/src/modules/family/family.socket.ts`) supporting `LOCATION_UPDATE`, `RING_BUZZER`, and `SOS_ALERT` broadcasts.

---

## 5. ML Crowd Prediction Service (`model-training` — Python / FastAPI)

- **Training & Preprocessing Pipeline:** `src/preprocess.py`, `src/train.py`, `src/predict.py`, and saved HistGradientBoosting model artifacts (`models/crowd_model_wuerzburg_hgb_v1.joblib`).
- **Inference Service (`src/service.py`):** Bearer-token-protected (`ML_API_KEY`) FastAPI endpoint accepting the 13-feature contract (`streetname`, `hour`, `weekday`, `temperature`, `weather_condition`, `incidents`, `n_pedestrians`, `towards_ratio`, `lag_1h`, `lag_2h`, `lag_3h`, `lag_24h`, `lag_168h`) and returning 1-hour-ahead `pedestrians/hour` forecasts.

