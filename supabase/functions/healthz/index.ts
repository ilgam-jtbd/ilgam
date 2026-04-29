import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

serve(() => Response.json({
  ok: true,
  service: "ilgam-edge-functions",
  deploy_sha: Deno.env.get("DEPLOY_SHA") || "unknown",
  timestamp: new Date().toISOString(),
}));
