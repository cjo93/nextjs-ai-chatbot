export function initAnalytics() {
  if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    import('posthog-js').then((posthog) => {
      posthog.default.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
        api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
        loaded: (posthogInstance) => {
          if (process.env.NODE_ENV === 'development') posthogInstance.debug()
        },
        capture_pageview: false,
      })
    })
  }
}

export function trackEvent(eventName: string, properties?: Record<string, any>) {
  if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    import('posthog-js').then((posthog) => {
      posthog.default.capture(eventName, properties)
    })
  }
}

export function identifyUser(userId: string, traits?: Record<string, any>) {
  if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    import('posthog-js').then((posthog) => {
      posthog.default.identify(userId, traits)
    })
  }
}

export function resetUser() {
  if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    import('posthog-js').then((posthog) => {
      posthog.default.reset()
    })
  }
}
