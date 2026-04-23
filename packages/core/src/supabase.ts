import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export function createIlgamClient(url: string, anonKey: string): SupabaseClient {
  return createClient(url, anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
    global: { headers: { "x-app": "ilgam" } },
  });
}

export const TABLES = {
  profiles: "profiles",
  workers: "workers",
  employers: "employers",
  jobs: "jobs",
  applications: "job_applications",
  matches: "matches",
  shifts: "shifts",
  payments: "payments",
  notifications: "notifications",
  cxTickets: "cx_tickets",
  reviews: "reviews",
} as const;
