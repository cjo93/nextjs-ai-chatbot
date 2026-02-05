// @ts-nocheck
export function initAnalytics() {
  if (typeof window !== "undefined" && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    import("posthog-js")
      .then((posthog) => {
        // biome-ignore lint/style/noNonNullAssertion: Checked above
        posthog.default.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
          api_host:
            process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://app.posthog.com",
          loaded: (posthogInstance: any) => {
            if (process.env.NODE_ENV === "development") {
              posthogInstance.debug();
            }
          },
          capture_pageview: false,
        });
      })
      .catch(() => {
        // PostHog not available
      });
  }
}

export function trackEvent(
  eventName: string,
  properties?: Record<string, any>
) {
  if (typeof window !== "undefined" && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    import("posthog-js")
      .then((posthog) => {
        posthog.default.capture(eventName, properties);
      })
      .catch(() => {
        // PostHog not available
      });
  }
}

export function identifyUser(userId: string, traits?: Record<string, any>) {
  if (typeof window !== "undefined" && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    import("posthog-js")
      .then((posthog) => {
        posthog.default.identify(userId, traits);
      })
      .catch(() => {
        // PostHog not available
      });
  }
}

export function resetUser() {
  if (typeof window !== "undefined" && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    import("posthog-js")
      .then((posthog) => {
        posthog.default.reset();
      })
      .catch(() => {
        // PostHog not available
      });
  }
}
