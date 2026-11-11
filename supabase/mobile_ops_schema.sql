-- Isolated Mobile & Field Operations tables for Rahat Setu.
-- Uses the `mobile_` prefix so existing Prisma tables are untouched.

CREATE TABLE IF NOT EXISTS public.mobile_sos_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_name text NOT NULL DEFAULT 'Pilgrim',
  phone text,
  alert_type text NOT NULL,
  severity text NOT NULL DEFAULT 'HIGH',
  title text NOT NULL,
  description text NOT NULL,
  sector text NOT NULL DEFAULT 'Sector 4, North Pathway Ramp',
  latitude double precision,
  longitude double precision,
  status text NOT NULL DEFAULT 'OPEN',
  assigned_volunteer text,
  resolution_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.mobile_facility_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_id text NOT NULL,
  facility_name text NOT NULL,
  facility_type text NOT NULL DEFAULT 'WATER_WC',
  sector text,
  issue_type text NOT NULL,
  reporter_phone text,
  status text NOT NULL DEFAULT 'OPEN',
  handled_by text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.mobile_queue_gates (
  id text PRIMARY KEY,
  name text NOT NULL,
  sector text NOT NULL,
  category text NOT NULL,
  wait_minutes integer NOT NULL,
  walk_distance_meters integer NOT NULL DEFAULT 150,
  walk_minutes integer NOT NULL DEFAULT 2,
  active_lanes integer NOT NULL,
  total_lanes integer NOT NULL,
  throughput_per_min integer NOT NULL DEFAULT 60,
  capacity_ratio double precision NOT NULL DEFAULT 0.35,
  trend text NOT NULL DEFAULT 'stable',
  is_fastest boolean NOT NULL DEFAULT false,
  is_ramp_accessible boolean NOT NULL DEFAULT true,
  directions jsonb NOT NULL DEFAULT '[]'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.mobile_quiet_reservations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_name text NOT NULL,
  people_count integer NOT NULL DEFAULT 1,
  zone_name text NOT NULL DEFAULT 'Dashashwamedh Sector Amphitheatre',
  event_title text NOT NULL DEFAULT 'Maha Ganga Aarti',
  status text NOT NULL DEFAULT 'CONFIRMED',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.mobile_volunteers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  badge_code text UNIQUE NOT NULL,
  pin text NOT NULL,
  name text NOT NULL,
  role_title text NOT NULL DEFAULT 'Field Marshal',
  assigned_sector text NOT NULL DEFAULT 'Sector 4',
  phone text,
  on_duty boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Expose new tables via Supabase Data API (PostgREST)
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE
  public.mobile_sos_alerts,
  public.mobile_facility_reports,
  public.mobile_queue_gates,
  public.mobile_quiet_reservations,
  public.mobile_volunteers
TO anon, authenticated;

-- Seed initial queue gates matching QueueRadarScreen
INSERT INTO public.mobile_queue_gates (
  id, name, sector, category, wait_minutes, walk_distance_meters, walk_minutes,
  active_lanes, total_lanes, throughput_per_min, capacity_ratio, trend,
  is_fastest, is_ramp_accessible, directions
) VALUES
  (
    'gate-4b', 'Gate 4-B Express Entry', 'Dashashwamedh East Sector', 'general',
    4, 180, 3, 8, 10, 95, 0.22, 'falling', true, true,
    '["Head East along Sector 4 Promenade for 80m","Pass the Sector 4 Medical Kiosk on your left","Turn right into Express Barricade Queue 4-B","Scan QR / RFID at Turnstile Lane 3 or 4"]'::jsonb
  ),
  (
    'gate-3', 'Gate 3 South Promenade', 'South Ghat Approach', 'general',
    12, 110, 2, 5, 6, 60, 0.55, 'stable', false, false,
    '["Walk south towards the clock tower for 60m","Turn left at Sector 3 Water Station","Join Queue Lane 2 at South Gate"]'::jsonb
  ),
  (
    'gate-2a', 'Gate 2-A West Corridor', 'Market Corridor Sector', 'general',
    24, 260, 4, 4, 8, 45, 0.78, 'rising', false, true,
    '["Head West through the Sector 2 Bazaar walkway","Proceed 200m towards the main pavilion","Join queue line marked Gate 2-A"]'::jsonb
  ),
  (
    'gate-1', 'Gate 1 Main Ghat Entry', 'Central Amphitheatre', 'general',
    46, 70, 1, 6, 6, 40, 0.94, 'rising', false, false,
    '["Walk 70m directly towards the main central arch","Expect heavy compression; high crowd density warning active"]'::jsonb
  ),
  (
    'gate-2r', 'Ramp Gate 2-R (Divyangjan & Senior)', 'South Barrier-Free Zone', 'senior',
    2, 140, 2, 4, 4, 40, 0.15, 'falling', true, true,
    '["Follow the tactile green path 90m south","Enter dedicated wheelchair/senior ramp at Corridor 2-R","Volunteers with mobility assistance stationed at gate entrance"]'::jsonb
  ),
  (
    'gate-4r', 'Gate 4-R Priority Pavilion', 'North Administrative Sector', 'senior',
    6, 210, 3, 3, 3, 30, 0.35, 'stable', false, true,
    '["Head north towards the Administrative Camp","Dedicated battery e-rickshaw available at pickup post 4"]'::jsonb
  ),
  (
    'gate-vip-1', 'Gate 6 Protocol & Media Entry', 'Riverside Enclosure', 'vip',
    1, 160, 2, 3, 4, 25, 0.10, 'stable', true, true,
    '["Present Digital Pass / Badge at Checkpoint 6","Direct escort into VIP Reserved Balcony"]'::jsonb
  ),
  (
    'food-2', 'Annakshetra Hall 2 (East)', 'Sector 4 Service Zone', 'prasad',
    3, 180, 3, 6, 6, 120, 0.25, 'falling', true, true,
    '["Follow dining signage 180m East of Main Amphitheatre","Coupons dispensed via automated kiosk outside entrance"]'::jsonb
  ),
  (
    'food-1', 'Main Prasad Kendra 1', 'Central Plaza', 'prasad',
    22, 90, 1, 4, 4, 50, 0.85, 'rising', false, false,
    '["Walk 90m towards the Central Bell","Long serpentine queue; Hall 2 is recommended instead"]'::jsonb
  )
ON CONFLICT (id) DO NOTHING;

-- Seed demo field volunteers for the mobile Portal Login flow
INSERT INTO public.mobile_volunteers (badge_code, pin, name, role_title, assigned_sector, phone, on_duty)
VALUES
  ('VOL-101', '1234', 'Aarav Sharma', 'Sector Marshal', 'Sector 4 Promenade', '+91 98765 11001', true),
  ('VOL-102', '1234', 'Priya Verma', 'Medical & Crowd Lead', 'Ganga Ghat Gate 3', '+91 98765 11002', true)
ON CONFLICT (badge_code) DO NOTHING;

