# DEFRAG Platform - Implementation Guide

## Overview

This repository contains the core infrastructure for the DEFRAG platform, a Human Design-based stress management and life optimization system. The implementation adds a complete backend infrastructure on top of the Next.js AI Chatbot template.

## What's Built

### ✅ Complete Core Infrastructure

#### 1. Database Layer (8 New Tables)
- **Subscription**: Payment tiers and Stripe integration tracking
- **Blueprint**: Human Design birth charts with full HD properties
- **VectorState**: Physics-based momentum/energy tracking
- **Event**: Life event logging with stress analysis
- **Experiment**: Behavioral hypothesis testing
- **Relationship**: Synastry and compatibility analysis
- **InversionOutcome**: Script effectiveness feedback
- **SedaEvent**: Crisis event tracking

**Migration:** `lib/db/migrations/0009_nappy_dexter_bennett.sql`
**Indexes:** 18 performance indexes added

#### 2. Stripe Integration
Complete payment infrastructure:
- Checkout session creation (`POST /api/stripe/create-checkout`)
- Customer portal access (`POST /api/stripe/create-portal`)
- Webhook handling (`POST /api/stripe/webhook`)
- Feature gates (blueprints, events per tier)
- Subscription utilities (cancel, resume, status)

**Subscription Tiers:**
- **Free**: 1 blueprint, 10 events/month
- **Starter ($19)**: 3 blueprints, 50 events/month, synastry
- **Professional ($49)**: 10 blueprints, 200 events/month, experiments, SEDA
- **Enterprise ($199)**: Unlimited, API access, white-label

#### 3. God Engine
Human Design protocol system with extensible JSON data:
- Gate protocols (sample: gates 1, 2, 7)
- Type protocols (Generator, Projector)
- Center protocols (Head, Ajna)
- Cached loader with default fallbacks

**Location:** `lib/defrag/god-engine/`

#### 4. Core Logic Engines

**Resolver** (`lib/defrag/resolver.ts`)
- Calculates birth charts from birth data
- Deterministic for testing consistency
- Returns type, profile, authority, definition, centers, gates, channels

**Physics** (`lib/defrag/physics.ts`)
- Models life as vector mechanics
- Tracks momentum, velocity, acceleration, friction
- Calculates kinetic, potential, and total energy
- Stability assessment (0-1 scale)

**Stress Mapper** (`lib/defrag/stress-mapper.ts`)
- Converts life events to force vectors
- Type-specific multipliers (Generator, Projector, etc.)
- Category modifiers (work, relationship, health, etc.)
- SEDA threshold assessment

**Inversion** (`lib/defrag/inversion.ts`)
- Generates behavioral scripts from events
- 3-tier approach: immediate (0-24h), short-term (1-7d), long-term (1w+)
- Type-specific strategy guidance
- Expected outcomes based on severity

**SEDA** (`lib/defrag/seda.ts`)
- 4-level crisis protocol (elevated → high → severe → critical)
- Immediate actions per level
- Escalation/de-escalation criteria
- Check-in schedules
- Stabilization plans

#### 5. Server Actions

**createBlueprint(formData)**
- Validates birth data
- Checks subscription limits
- Calculates chart via Resolver
- Initializes VectorState

**logEvent(blueprintId, formData)**
- Checks monthly event limits
- Maps event to force (Stress Mapper)
- Generates behavioral script (Inversion)
- Assesses SEDA threshold
- Updates VectorState (Physics)
- Triggers SEDA if needed

**startExperiment(formData)**
- Creates new behavioral experiment
- Tracks hypothesis and method

**completeExperiment(experimentId, formData)**
- Records outcomes and insights
- Rates success (1-10)

## Environment Variables

Add these to your `.env.local`:

```bash
# Stripe
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_ID_STARTER=price_...
STRIPE_PRICE_ID_PROFESSIONAL=price_...
STRIPE_PRICE_ID_ENTERPRISE=price_...

# Resend
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=noreply@defrag.app

# PostHog
NEXT_PUBLIC_POSTHOG_KEY=phc_...
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SITE_NAME=DEFRAG

# Feature Flags
ENABLE_ANALYTICS=true
ENABLE_EMAIL=true
```

## Database Setup

```bash
# Generate migrations (already done)
pnpm db:generate

# Run migrations
pnpm db:migrate

# View database in Drizzle Studio
pnpm db:studio
```

## Running Locally

```bash
# Install dependencies
pnpm install

# Run migrations
pnpm db:migrate

# Start development server
pnpm dev
```

Navigate to `http://localhost:3000`

## Testing Stripe Webhooks

Use Stripe CLI to forward webhooks:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook

# In another terminal
stripe trigger checkout.session.completed
stripe trigger customer.subscription.updated
```

## Architecture

### Data Flow

1. **Blueprint Creation:**
   ```
   User Input → Validator → Resolver → Database → VectorState Init
   ```

2. **Event Logging:**
   ```
   Event Data → Stress Mapper → Force Vector → Physics Engine
                              → Inversion Engine → Script
                              → SEDA Assessment → Protocol (if triggered)
                              → Database (Event + VectorState)
   ```

3. **Subscription Management:**
   ```
   User Action → Stripe Checkout → Webhook → Database Update → Feature Gates
   ```

### Key Concepts

**Vector Physics**
- Life events are modeled as forces
- Momentum accumulates over time
- Friction (stress) creates resistance
- Energy represents system capacity

**SEDA Levels**
- Level 0: Normal operation
- Level 1: Elevated (7.0-7.5 severity)
- Level 2: High (7.5-8.5 severity)
- Level 3: Severe (8.5-9.5 severity)
- Level 4: Critical (9.5+ severity)

**Inversion Philosophy**
- Immediate: Stabilize and create safety
- Short-term: Process and honor design
- Long-term: Integrate and strengthen alignment

## What's Missing (For Full Production)

### UI Components (~2000 lines)
- Landing page
- Dashboard
- Onboarding wizard
- Event logger form
- Blueprint display
- Event history
- Pricing page
- Settings page
- Legal pages (terms, privacy, disclaimer)

### Email System (~500 lines)
- Resend client setup
- React Email templates
- Welcome email
- Blueprint ready notification
- Subscription confirmed

### Analytics (~200 lines)
- PostHog initialization
- Event tracking
- User identification

### Testing (~1000 lines)
- Unit tests for engines
- Integration tests for API routes
- E2E tests for critical flows

### Documentation
- API reference
- Architecture diagrams
- Deployment guide

## Extending the System

### Adding New Gates

Create a JSON file in `lib/defrag/god-engine/gates/`:

```json
{
  "gateNumber": 13,
  "name": "Gate of the Listener",
  "center": "G",
  "keynote": "Direction of Mankind",
  "protocol": {
    "when_activated": {
      "strength": "...",
      "guidance": "...",
      "warning": "..."
    },
    "when_undefined": {
      "challenge": "...",
      "guidance": "...",
      "opportunity": "..."
    }
  },
  "stress_response": {
    "type": "...",
    "severity_multiplier": 1.0,
    "recommended_action": "..."
  }
}
```

### Adding New Types

Create a JSON file in `lib/defrag/god-engine/types/`:

```json
{
  "type": "Manifestor",
  "description": "...",
  "strategy": "To Inform",
  "signature": "Peace",
  "not_self_theme": "Anger",
  "protocol": {
    "decision_making": "...",
    "energy_management": "...",
    "stress_indicators": [],
    "optimal_approach": {}
  },
  "stress_mapping": {
    "frustration_threshold": 0.7,
    "exhaustion_multiplier": 1.0,
    "recovery_protocol": "..."
  }
}
```

### Adding New Centers

Create a JSON file in `lib/defrag/god-engine/centers/`:

```json
{
  "center": "Throat",
  "name": "Throat Center",
  "function": "Communication and Manifestation",
  "description": "...",
  "when_defined": {},
  "when_undefined": {},
  "stress_protocol": {}
}
```

## Troubleshooting

### Build Fails with Font Error
This is a known issue with Google Fonts network access. Not related to DEFRAG code. The build works in production environments with network access.

### TypeScript Errors in models.test.ts
These are pre-existing errors from the base template, unrelated to DEFRAG implementation.

### Webhook Not Receiving Events
Ensure Stripe CLI is running:
```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

### Database Migration Issues
Reset and re-run:
```bash
pnpm db:push
```

## Security

- ✅ Security headers configured in vercel.json
- ✅ Stripe webhook signature verification
- ✅ Authentication required for all actions
- ✅ Subscription tier enforcement
- ✅ Input validation with Zod schemas

## Performance

- ✅ 18 database indexes for query optimization
- ✅ God Engine protocol caching
- ✅ Type-safe queries with Drizzle
- ✅ Server-side rendering with Next.js

## License

See LICENSE file

## Support

For issues or questions, open a GitHub issue.

---

**Built by:** Copilot Agent
**Date:** February 2026
**Status:** Core infrastructure complete, UI pending
