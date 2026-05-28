
Deno.serve(() => Response.json({
  ok: true,
  service: "ilgam-edge-functions",
  deploy_sha: Deno.env.get("DEPLOY_SHA") || "unknown",
  timestamp: new Date().toISOString(),
}));
