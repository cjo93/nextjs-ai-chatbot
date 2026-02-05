# DEFRAG Platform

**D**eterministic **E**motional/**F**riction **R**esolution **A**nalysis & **G**rounding

A production-grade platform for tracking emotional states through the lens of Human Design, providing personalized grounding protocols and testable experiments.

## Features

### Core Functionality

- **Blueprint Creation**: Generate Human Design charts from birth data
- **Event Logging**: Track emotional friction with severity levels 1-5
- **Inversion Protocols**: Receive personalized grounding scripts based on your unique blueprint
- **Experiments**: Test hypothesis-driven actions to discover what works for you
- **Vector State Tracking**: 3D modeling of emotional states (Resilience, Autonomy, Connectivity)
- **SEDA Protocol**: Automatic crisis detection and emergency grounding

### Subscription Tiers

#### Free Tier
- 1 blueprint
- 3 events per month
- Severity levels 1-2 (signal, friction)
- Basic grounding scripts

#### Pro Tier ($19/month)
- Unlimited blueprints
- Unlimited events
- All severity levels (1-5)
- Relationship compatibility analysis
- Advanced vector state visualizations

#### Lineage Tier ($99/month)
- Everything in Pro
- API access
- Family mapping
- Lineage analysis
- Custom integrations

## Technology Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: NextAuth v5
- **Payments**: Stripe
- **UI**: shadcn/ui + Radix UI
- **Styling**: Tailwind CSS v4
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm 9+
- PostgreSQL database
- Stripe account (for payments)

### Installation

```bash
# Clone repository
git clone https://github.com/cjo93/nextjs-ai-chatbot.git
cd nextjs-ai-chatbot

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your values

# Run database migrations
pnpm db:migrate

# Start development server
pnpm dev
```

Access DEFRAG at `http://localhost:3000/defrag/defrag`

### Environment Variables

See `.env.example` for required variables:

```bash
# Core
AUTH_SECRET=<your-secret>
POSTGRES_URL=<database-url>
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Stripe
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_PRO_MONTHLY=price_...
STRIPE_PRICE_LINEAGE_MONTHLY=price_...
```

## Project Structure

```
app/
├── (defrag)/              # DEFRAG route group
│   ├── defrag/            # Landing page
│   ├── pricing/           # Pricing & plans
│   ├── dashboard/         # User dashboard
│   ├── onboarding/        # Blueprint creation
│   ├── events/            # Event logging & history
│   ├── experiments/       # Experiment tracking
│   └── settings/          # User settings
├── api/
│   ├── stripe/            # Stripe integration
│   │   ├── create-checkout/
│   │   ├── webhook/
│   │   └── create-portal/
│   └── subscription/      # Subscription API
lib/
├── db/                    # Database layer
│   ├── schema.ts          # Drizzle ORM schema
│   ├── index.ts           # DB connection
│   └── migrations/        # Migration files
├── stripe/                # Stripe utilities
│   ├── client.ts          # Server-side
│   └── client-side.ts     # Client-side
└── defrag/                # DEFRAG core logic
    ├── subscription.ts    # Subscription utilities
    └── god-engine/        # (To be implemented)
docs/
├── DEFRAG_ARCHITECTURE.md
├── GOD_ENGINE_SPEC.md
└── DEPLOYMENT.md
```

## Database Schema

### Core Tables

- **User**: Authentication and profile
- **Subscription**: Stripe subscription management
- **Blueprint**: Human Design charts
- **VectorState**: 3D emotional state tracking
- **Event**: Logged emotional/friction events
- **Experiment**: User experiments
- **Relationship**: Synastry analysis (Pro+)
- **InversionOutcome**: Protocol feedback
- **SedaEvent**: Crisis protocol activations

## Development

### Scripts

```bash
# Development
pnpm dev              # Start dev server
pnpm build            # Build for production
pnpm start            # Start production server

# Database
pnpm db:generate      # Generate migration
pnpm db:migrate       # Run migrations
pnpm db:push          # Push schema (dev only)
pnpm db:studio        # Open Drizzle Studio

# Code Quality
pnpm lint             # Run linter
pnpm format           # Format code
pnpm test             # Run tests
```

### Testing

```bash
# Run all tests
pnpm test

# Run specific test file
pnpm test path/to/test.ts

# Run tests in watch mode
pnpm test --watch
```

## Implementation Status

### ✅ Completed

- [x] Database schema (8 tables)
- [x] Stripe integration (checkout, webhooks, portal)
- [x] Subscription management
- [x] Route structure and navigation
- [x] Marketing pages (landing, pricing)
- [x] Dashboard with basic stats
- [x] User authentication
- [x] Settings page

### 🚧 In Progress

- [ ] Blueprint creation flow
- [ ] Birth chart calculation
- [ ] Event logging with inversion
- [ ] God Engine data
- [ ] Physics engine
- [ ] Relationship synastry

### 📋 Planned

- [ ] Comprehensive UI components
- [ ] Advanced analytics
- [ ] Mobile app
- [ ] API for Lineage tier
- [ ] Webhooks
- [ ] Advanced reporting

## API Documentation

### Subscription API

**GET** `/api/subscription`
- Returns current user's subscription
- Requires authentication

### Stripe APIs

**POST** `/api/stripe/create-checkout`
- Creates Stripe checkout session
- Body: `{ priceId, tier }`
- Returns: `{ url, sessionId }`

**POST** `/api/stripe/webhook`
- Handles Stripe webhook events
- Requires valid Stripe signature

**POST** `/api/stripe/create-portal`
- Creates billing portal session
- Returns: `{ url }`

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style

- Use TypeScript strict mode
- Follow existing patterns
- Add JSDoc comments
- Use Zod for validation
- Write tests for new features

## Deployment

See [DEPLOYMENT.md](docs/DEPLOYMENT.md) for comprehensive deployment guide.

Quick deploy to Vercel:

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

## Architecture

See [DEFRAG_ARCHITECTURE.md](docs/DEFRAG_ARCHITECTURE.md) for system architecture details.

### Key Concepts

- **Blueprint**: Your Human Design chart (Type, Strategy, Authority, Gates, Centers)
- **Vector State**: 3D point representing emotional state (x, y, z)
- **Event**: Logged friction/emotional occurrence with severity 1-5
- **Inversion**: Grounding protocol specific to your gates and context
- **Experiment**: Testable hypothesis to discover what works
- **SEDA**: Crisis protocol for severity 4-5 events

## Security

- All routes require authentication (NextAuth v5)
- Input validation with Zod
- Stripe webhook signature verification
- Rate limiting on API endpoints
- Secure environment variable handling
- HTTPS-only in production

## Performance

- Server-side rendering for fast initial load
- Code splitting for optimal bundle size
- Database query optimization with indexes
- Stripe API call minimization
- In-memory caching for God Engine data

## Support

- **Issues**: [GitHub Issues](https://github.com/cjo93/nextjs-ai-chatbot/issues)
- **Documentation**: `/docs` directory
- **Email**: [your-support-email]

## License

[Your License Here]

## Acknowledgments

- Human Design system by Ra Uru Hu
- Gene Keys by Richard Rudd
- Next.js by Vercel
- Stripe for payment infrastructure

## Roadmap

### Q1 2024
- [ ] Complete God Engine data (64 gates)
- [ ] Birth chart calculation implementation
- [ ] Event logging with full inversion
- [ ] Basic vector state visualization

### Q2 2024
- [ ] Advanced physics engine
- [ ] Relationship synastry (Pro tier)
- [ ] Mobile-responsive improvements
- [ ] Performance optimizations

### Q3 2024
- [ ] API access (Lineage tier)
- [ ] Family mapping features
- [ ] Advanced analytics dashboard
- [ ] Export/import functionality

### Q4 2024
- [ ] Mobile app (React Native)
- [ ] AI-powered script personalization
- [ ] Community features
- [ ] Coaching tools

---

Built with ❤️ by the DEFRAG team
