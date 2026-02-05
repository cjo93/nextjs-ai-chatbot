# DEFRAG Architecture

## Overview

DEFRAG (Deterministic Emotional/Friction Analysis & Grounding) is a comprehensive platform for tracking emotional states through the lens of Human Design, providing personalized grounding protocols and experiments.

## System Architecture

### Technology Stack

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: NextAuth v5
- **Payments**: Stripe
- **UI**: shadcn/ui + Radix UI
- **Styling**: Tailwind CSS v4
- **Deployment**: Vercel

### Core Components

#### 1. Database Layer (`lib/db/`)

**Schema Tables:**
- `User` - User authentication and profile
- `Subscription` - Stripe subscription and tier management
- `Blueprint` - Human Design charts with birth data
- `VectorState` - 3D emotional state tracking (x, y, z coordinates)
- `Event` - Logged friction/emotional events
- `Experiment` - Hypothesis-driven experiments
- `Relationship` - Synastry analysis (Pro+ feature)
- `InversionOutcome` - Feedback on grounding protocols
- `SedaEvent` - Crisis protocol activations

**Key Files:**
- `schema.ts` - Drizzle ORM schema definitions
- `index.ts` - Database connection export
- `queries.ts` - Existing chat/document queries
- `migrations/` - Database migration files

#### 2. Stripe Integration (`lib/stripe/`, `app/api/stripe/`)

**Server-side (`lib/stripe/client.ts`):**
- Stripe instance for API calls
- Uses secret key

**Client-side (`lib/stripe/client-side.ts`):**
- Stripe.js loader
- Uses publishable key

**API Routes:**
- `/api/stripe/create-checkout` - Initiates subscription purchase
- `/api/stripe/webhook` - Handles Stripe events
- `/api/stripe/create-portal` - Opens billing management

**Webhook Events:**
- `checkout.session.completed` - New subscription
- `customer.subscription.updated` - Subscription changes
- `customer.subscription.deleted` - Cancellation
- `invoice.payment_succeeded` - Successful payment
- `invoice.payment_failed` - Failed payment

#### 3. Subscription Management (`lib/defrag/subscription.ts`)

**Tier Limits:**
```typescript
Free: {
  blueprints: 1,
  eventsPerMonth: 3,
  severityLevels: [1, 2],
  relationships: false,
  apiAccess: false
}

Pro: {
  blueprints: Infinity,
  eventsPerMonth: Infinity,
  severityLevels: [1, 2, 3, 4, 5],
  relationships: true,
  apiAccess: false
}

Lineage: {
  blueprints: Infinity,
  eventsPerMonth: Infinity,
  severityLevels: [1, 2, 3, 4, 5],
  relationships: true,
  apiAccess: true
}
```

**Key Functions:**
- `getUserSubscription(userId)` - Fetch subscription
- `canLogEvent(userId, severity)` - Check event limits
- `canCreateBlueprint(userId)` - Check blueprint limits
- `incrementEventCount(userId)` - Track usage
- `resetMonthlyLimits()` - Reset counters (cron job)

#### 4. Route Structure (`app/(defrag)/`)

**Pages:**
- `/defrag/defrag` - Marketing landing page
- `/defrag/pricing` - Pricing tiers with Stripe checkout
- `/defrag/dashboard` - User dashboard with stats
- `/defrag/onboarding` - Blueprint creation (placeholder)
- `/defrag/events` - Event list (placeholder)
- `/defrag/events/new` - Log new event (placeholder)
- `/defrag/experiments` - Experiment tracking (placeholder)
- `/defrag/settings` - Account and subscription management

**Layout (`layout.tsx`):**
- Header with navigation
- Protected routes (requires authentication)
- Minimal design focused on functionality

#### 5. Core DEFRAG Logic (To Be Implemented)

**God Engine (`lib/defrag/god-engine/`):**
- Gate definitions (64 gates with shadow/gift/siddhi)
- Type definitions (Generator, Projector, Manifestor, Reflector, Manifesting Generator)
- Center definitions (9 centers with defined/undefined states)
- Inversion protocols (context-aware grounding scripts)

**Resolver (`lib/defrag/resolver.ts`):**
- Birth chart calculation using astronomical data
- Planetary position calculation
- Gate and center activation determination
- Type, Strategy, Authority derivation
- Profile calculation

**Physics Engine (`lib/defrag/physics.ts`):**
- Vector state modeling (x=Resilience, y=Autonomy, z=Connectivity)
- Physics constants derived from blueprint (mass, permeability, elasticity)
- Stress vector calculation
- State evolution over time

**Stress Mapper (`lib/defrag/stress-mapper.ts`):**
- Context keyword analysis
- Severity level mapping
- Stress vector generation

**Inversion Engine (`lib/defrag/inversion.ts`):**
- Protocol selection based on gates and severity
- Script generation
- Experiment hypothesis creation
- SEDA trigger detection

**SEDA Protocol (`lib/defrag/seda.ts`):**
- Crisis keyword detection
- Multi-phase grounding protocol
- Emergency response automation

## Data Flow

### Event Logging Flow

```
User logs event →
  Check subscription limits →
    Calculate stress vector →
      Update vector state →
        Run inversion engine →
          Generate script + experiments →
            Store event + vector state →
              Return to user
```

### Blueprint Creation Flow

```
User enters birth data →
  Validate inputs →
    Calculate astronomical positions →
      Determine gates + centers →
        Derive type + strategy + authority →
          Calculate physics constants →
            Initialize vector state →
              Store blueprint →
                Display to user
```

### Subscription Upgrade Flow

```
User clicks upgrade →
  Create Stripe checkout session →
    Redirect to Stripe →
      User completes payment →
        Stripe webhook fires →
          Update subscription in DB →
            User redirected to dashboard
```

## Security Considerations

1. **Authentication**: All DEFRAG routes require authentication via NextAuth
2. **Ownership Verification**: All data access checks user ownership
3. **Input Validation**: Zod schemas for all user inputs
4. **Rate Limiting**: API endpoints should be rate-limited
5. **Stripe Webhook Verification**: Signature validation on all webhook events
6. **Environment Variables**: Sensitive keys in environment only

## Performance Optimizations

1. **Database Indexes**: Add indexes on foreign keys and commonly queried fields
2. **Caching**: Cache God Engine JSON data in memory
3. **Code Splitting**: Lazy load heavy components
4. **Vector State**: Limit history retention to recent states only
5. **Stripe Calls**: Minimize API calls by caching customer/subscription data

## Monitoring & Observability

1. **Error Tracking**: Sentry for error monitoring
2. **Analytics**: PostHog for feature usage tracking
3. **Vercel Analytics**: Performance and Web Vitals
4. **Stripe Dashboard**: Payment and subscription metrics
5. **Database Metrics**: Connection pool, query performance

## Future Enhancements

1. **Mobile App**: React Native companion app
2. **AI Enhancements**: LLM-powered script personalization
3. **Community Features**: Share experiments, compare results
4. **Coaching Integration**: Tools for Human Design coaches
5. **Advanced Analytics**: ML-powered pattern detection
6. **API**: REST/GraphQL API for Lineage tier
7. **Webhooks**: Allow external systems to react to events
8. **Data Export**: Full data export in various formats

## Development Setup

1. Install dependencies: `pnpm install`
2. Set up environment variables (see `.env.example`)
3. Run migrations: `pnpm db:migrate`
4. Start dev server: `pnpm dev`
5. Access at: `http://localhost:3000/defrag/defrag`

## Testing Strategy

1. **Unit Tests**: Core logic (resolver, physics, inversion)
2. **Integration Tests**: API routes and database operations
3. **E2E Tests**: Complete user flows (Playwright)
4. **Stripe Testing**: Use Stripe test mode and test cards
5. **Manual Testing**: Birth chart accuracy validation

## Deployment

1. Push to main branch
2. Vercel auto-deploys
3. Run migrations in production
4. Configure Stripe webhooks
5. Set production environment variables
6. Monitor errors and performance

## Support & Maintenance

1. **Database Backups**: Daily automated backups
2. **Dependency Updates**: Monthly security updates
3. **Feature Releases**: Bi-weekly release cycle
4. **Bug Fixes**: Hot-fix process for critical issues
5. **User Support**: In-app support widget + email
