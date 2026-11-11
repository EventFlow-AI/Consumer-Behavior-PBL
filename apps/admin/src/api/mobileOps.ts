const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_KEY = import.meta.env
  .VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;

export interface MobileSosAlert {
  id: string;
  reporter_name: string;
  phone: string | null;
  alert_type: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  title: string;
  description: string;
  sector: string;
  latitude: number | null;
  longitude: number | null;
  status: "OPEN" | "DISPATCHED" | "RESOLVED" | "CANCELLED";
  assigned_volunteer: string | null;
  resolution_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface MobileFacilityReport {
  id: string;
  facility_id: string;
  facility_name: string;
  facility_type: string;
  sector: string | null;
  issue_type: string;
  reporter_phone: string | null;
  status: "OPEN" | "IN_PROGRESS" | "FIXED";
  handled_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface MobileQueueGate {
  id: string;
  name: string;
  sector: string;
  category: "general" | "senior" | "vip" | "prasad";
  wait_minutes: number;
  walk_distance_meters: number;
  walk_minutes: number;
  active_lanes: number;
  total_lanes: number;
  throughput_per_min: number;
  capacity_ratio: number;
  trend: "falling" | "stable" | "rising";
  is_fastest: boolean;
  is_ramp_accessible: boolean;
  updated_at: string;
}

export interface MobileQuietReservation {
  id: string;
  visitor_name: string;
  people_count: number;
  zone_name: string;
  event_title: string;
  status: "CONFIRMED" | "CANCELLED";
  created_at: string;
}

export interface MobileVolunteer {
  id: string;
  badge_code: string;
  pin: string;
  name: string;
  role_title: string;
  assigned_sector: string;
  phone: string | null;
  on_duty: boolean;
  created_at: string;
}

function getConfig() {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    throw new Error(
      "VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY is not configured in apps/admin/.env",
    );
  }
  return {
    baseUrl: SUPABASE_URL.replace(/\/$/, ""),
    apiKey: SUPABASE_KEY,
  };
}

async function supabaseRest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const { baseUrl, apiKey } = getConfig();
  const headers = new Headers(options.headers);
  headers.set("apikey", apiKey);
  headers.set("Content-Type", "application/json");

  const response = await fetch(`${baseUrl}/rest/v1/${path}`, {
    ...options,
    headers,
  });

  const text = await response.text();
  if (!response.ok) {
    let message = `Supabase request failed (${response.status})`;
    if (text) {
      try {
        const parsed = JSON.parse(text) as { message?: string; hint?: string };
        message = parsed.message ?? parsed.hint ?? message;
      } catch {
        message = text;
      }
    }
    throw new Error(message);
  }

  return (text ? JSON.parse(text) : null) as T;
}

export function getSosAlerts() {
  return supabaseRest<MobileSosAlert[]>(
    "mobile_sos_alerts?select=*&order=created_at.desc",
  );
}

export function updateSosAlert(
  id: string,
  patch: Partial<
    Pick<
      MobileSosAlert,
      "status" | "assigned_volunteer" | "resolution_notes" | "severity"
    >
  >,
) {
  return supabaseRest<MobileSosAlert[]>(
    `mobile_sos_alerts?id=eq.${encodeURIComponent(id)}`,
    {
      method: "PATCH",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify({ ...patch, updated_at: new Date().toISOString() }),
    },
  );
}

export function getFacilityReports() {
  return supabaseRest<MobileFacilityReport[]>(
    "mobile_facility_reports?select=*&order=created_at.desc",
  );
}

export function updateFacilityReport(
  id: string,
  patch: Partial<Pick<MobileFacilityReport, "status" | "handled_by">>,
) {
  return supabaseRest<MobileFacilityReport[]>(
    `mobile_facility_reports?id=eq.${encodeURIComponent(id)}`,
    {
      method: "PATCH",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify({ ...patch, updated_at: new Date().toISOString() }),
    },
  );
}

export function getQueueGates() {
  return supabaseRest<MobileQueueGate[]>(
    "mobile_queue_gates?select=*&order=category.asc,wait_minutes.asc",
  );
}

export function updateQueueGate(
  id: string,
  patch: Partial<
    Pick<
      MobileQueueGate,
      "wait_minutes" | "active_lanes" | "trend" | "is_fastest" | "capacity_ratio"
    >
  >,
) {
  return supabaseRest<MobileQueueGate[]>(
    `mobile_queue_gates?id=eq.${encodeURIComponent(id)}`,
    {
      method: "PATCH",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify({ ...patch, updated_at: new Date().toISOString() }),
    },
  );
}

export function getQuietReservations() {
  return supabaseRest<MobileQuietReservation[]>(
    "mobile_quiet_reservations?select=*&order=created_at.desc",
  );
}

export function updateQuietReservation(
  id: string,
  status: "CONFIRMED" | "CANCELLED",
) {
  return supabaseRest<MobileQuietReservation[]>(
    `mobile_quiet_reservations?id=eq.${encodeURIComponent(id)}`,
    {
      method: "PATCH",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify({ status }),
    },
  );
}

export function getVolunteers() {
  return supabaseRest<MobileVolunteer[]>(
    "mobile_volunteers?select=*&order=badge_code.asc",
  );
}

export function createVolunteer(input: {
  badge_code: string;
  pin: string;
  name: string;
  role_title: string;
  assigned_sector: string;
  phone?: string;
}) {
  return supabaseRest<MobileVolunteer[]>("mobile_volunteers", {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({
      ...input,
      on_duty: true,
    }),
  });
}

export function updateVolunteer(
  id: string,
  patch: Partial<Pick<MobileVolunteer, "on_duty" | "assigned_sector">>,
) {
  return supabaseRest<MobileVolunteer[]>(
    `mobile_volunteers?id=eq.${encodeURIComponent(id)}`,
    {
      method: "PATCH",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify(patch),
    },
  );
}

