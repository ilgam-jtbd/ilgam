// 프로덕션 하네스 H6 — Sentry 공통 init
//
// 사용 (Next.js):
//   import { initSentry } from "@ilgam/observability";
//   initSentry({ dsn: process.env.SENTRY_DSN, env: process.env.VERCEL_ENV });
//
// 사용 (Edge Function Deno) — 별도 deno init은 supabase/functions 각자 inline.
//
// 정책:
// - tracesSampleRate 0.1 (prod) / 1.0 (preview·dev)
// - PII 자동 스크럽 (전화번호·이메일·계좌·CI 토큰)
// - release tag = git SHA (deploy.yml DEPLOY_SHA env 주입)

import * as Sentry from "@sentry/nextjs";

export interface InitSentryOptions {
  dsn?: string;
  env?: string;
  release?: string;
  enabled?: boolean;
}

/** PII 패턴 (한국 전화·이메일·계좌·CI) */
const PII_PATTERNS = [
  /\b01[0-9]-?\d{3,4}-?\d{4}\b/g, // 010-1234-5678
  /\+82[0-9]{9,10}/g, // +821012345678
  /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g, // 이메일
  /\b\d{3}-?\d{2,6}-?\d{6,8}\b/g, // 계좌
  /\b[A-Za-z0-9+/=]{40,}\b/g, // CI 토큰 (base64 의심)
];

function scrubPII(text: string): string {
  let out = text;
  for (const re of PII_PATTERNS) out = out.replace(re, "***");
  return out;
}

export function initSentry(opts: InitSentryOptions = {}): void {
  const dsn = opts.dsn ?? process.env.SENTRY_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN;
  const enabled =
    opts.enabled ?? (Boolean(dsn) && (opts.env ?? process.env.VERCEL_ENV) !== "development");
  if (!enabled || !dsn) return;

  const env = opts.env ?? process.env.VERCEL_ENV ?? "production";
  const release =
    opts.release ?? process.env.DEPLOY_SHA ?? process.env.VERCEL_GIT_COMMIT_SHA ?? "unknown";

  Sentry.init({
    dsn,
    environment: env,
    release,
    tracesSampleRate: env === "production" ? 0.1 : 1.0,
    profilesSampleRate: env === "production" ? 0.0 : 0.5,
    sendDefaultPii: false,

    beforeSend(event) {
      // PII 자동 스크럽 (message·exception·breadcrumb)
      if (event.message) event.message = scrubPII(event.message);
      if (event.exception?.values) {
        for (const ex of event.exception.values) {
          if (ex.value) ex.value = scrubPII(ex.value);
        }
      }
      if (event.breadcrumbs) {
        for (const b of event.breadcrumbs) {
          if (b.message) b.message = scrubPII(b.message);
        }
      }
      // 운영자 액션은 항상 audit (sentry는 tag로만 표시)
      if (event.tags?.audit === "operator") {
        event.fingerprint = ["operator-action", String(event.tags.action_type ?? "unknown")];
      }
      return event;
    },

    ignoreErrors: [
      "ResizeObserver loop limit exceeded",
      "Network request failed", // 시니어 LTE 단절 빈번 — error 노이즈 제외
      "AbortError",
    ],
  });
}

/** 운영자 액션 추적 (operator_actions audit 보강) */
export function trackOperatorAction(
  actionType: string,
  metadata: Record<string, unknown> = {},
): void {
  Sentry.addBreadcrumb({
    category: "operator",
    level: "info",
    message: `operator: ${actionType}`,
    data: metadata,
  });
  Sentry.setTag("audit", "operator");
  Sentry.setTag("action_type", actionType);
}

/** 외부 API 호출 wrapping (Claude·PortOne·Bizppurio) */
export async function tracedFetch(name: string, fn: () => Promise<Response>): Promise<Response> {
  return Sentry.startSpan({ name: `fetch:${name}`, op: "http.client" }, async () => {
    const res = await fn();
    if (!res.ok) {
      Sentry.captureMessage(`${name} ${res.status}`, "warning");
    }
    return res;
  });
}

export { Sentry };
