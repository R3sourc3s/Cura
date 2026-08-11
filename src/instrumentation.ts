import * as Sentry from "@sentry/nextjs";

// Inert until NEXT_PUBLIC_SENTRY_DSN is set — same opt-in pattern as the
// other third-party keys in this app (OPENAI_API_KEY, ANTHROPIC_API_KEY).
export function register() {
  if (!process.env.NEXT_PUBLIC_SENTRY_DSN) return;

  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    environment: process.env.SENTRY_ENVIRONMENT ?? process.env.NODE_ENV,
    tracesSampleRate: 0.1,
    // Request/session data here can include resident names and other PHI —
    // never forward it to Sentry by default.
    sendDefaultPii: false,
  });
}

export const onRequestError = Sentry.captureRequestError;
