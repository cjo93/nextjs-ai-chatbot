export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs" && process.env.SENTRY_DSN) {
    await import("./sentry.server.config").catch(() => {
      // Sentry not available
    });
  }

  if (process.env.NEXT_RUNTIME === "edge" && process.env.SENTRY_DSN) {
    await import("./sentry.edge.config").catch(() => {
      // Sentry not available
    });
  }
}
