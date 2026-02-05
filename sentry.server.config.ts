// @ts-nocheck
let Sentry: any;

try {
  Sentry = require("@sentry/nextjs");

  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 0.1,
    debug: false,
    environment: process.env.NODE_ENV,
    beforeSend(event: any) {
      if (process.env.NODE_ENV === "development") {
        return null;
      }
      return event;
    },
  });
} catch (_error) {
  // Sentry package not installed, monitoring disabled
}

export default Sentry;
