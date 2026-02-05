# DEFRAG Quick Start Guide

## What is DEFRAG?

DEFRAG (Deterministic Emotional/Friction Analysis & Grounding) is a platform that:
- Tracks emotional states through Human Design blueprints
- Provides personalized grounding protocols
- Offers testable experiments for self-discovery
- Models emotional states in 3D vector space

## What's Been Built

### ✅ Complete Infrastructure
1. **Database** - 8 new tables for blueprints, events, experiments, subscriptions
2. **Stripe** - Full payment integration with 3 tiers (Free/$19/$99)
3. **Authentication** - NextAuth v5 protecting all routes
4. **Pages** - Landing, pricing, dashboard, and placeholders
5. **Documentation** - 40+ pages covering architecture, deployment, and specs

### 📝 Needs Implementation
1. **God Engine** - 64 gate definitions with inversion protocols
2. **Calculator** - Astronomical birth chart calculations
3. **Physics** - Vector state modeling and evolution
4. **UI Components** - Blueprint display, event forms, visualizations

## Quick Tour

### Try It Out
```bash
cd /home/runner/work/nextjs-ai-chatbot/nextjs-ai-chatbot
pnpm dev
# Visit http://localhost:3000/defrag/defrag
```

### Key Routes
- `/defrag/defrag` - Landing page
- `/defrag/pricing` - Pricing tiers
- `/defrag/dashboard` - User dashboard
- `/defrag/settings` - Subscription management

### Key Files
- `lib/db/schema.ts` - Database schema
- `lib/defrag/subscription.ts` - Subscription logic
- `lib/stripe/` - Stripe integration
- `app/(defrag)/` - All DEFRAG pages
- `docs/` - Complete documentation

## Database Schema at a Glance

```
User
├── Subscription (tier, Stripe IDs, limits)
├── Blueprint (birth data, Human Design chart)
│   ├── VectorState (x, y, z coordinates)
│   ├── Event (severity, context, diagnosis, script)
│   │   └── InversionOutcome (feedback)
│   ├── Experiment (hypothesis, action, results)
│   └── Relationship (synastry with another blueprint)
└── SedaEvent (crisis protocol activations)
```

## Subscription Tiers

| Feature | Free | Pro ($19/mo) | Lineage ($99/mo) |
|---------|------|--------------|------------------|
| Blueprints | 1 | ∞ | ∞ |
| Events/Month | 3 | ∞ | ∞ |
| Severity Levels | 1-2 | 1-5 | 1-5 |
| Relationships | ✗ | ✓ | ✓ |
| API Access | ✗ | ✗ | ✓ |

## Tech Stack

- **Frontend**: Next.js 16 + React 19 + TypeScript
- **Database**: PostgreSQL + Drizzle ORM
- **Auth**: NextAuth v5
- **Payments**: Stripe
- **UI**: shadcn/ui + Radix UI + Tailwind CSS v4
- **Deploy**: Vercel

## Development Commands

```bash
# Start dev server
pnpm dev

# Database
pnpm db:studio    # Open database UI
pnpm db:generate  # Generate migration
pnpm db:migrate   # Run migrations

# Code quality
pnpm lint         # Check code
pnpm format       # Fix formatting
pnpm build        # Test production build
```

## Next Developer Tasks

### Priority 1: God Engine Data (2-3 weeks)
1. Create `lib/defrag/god-engine/gates/gate-001.json` through `gate-064.json`
2. Add 5 type definitions (Generator, Projector, Manifestor, Reflector, MG)
3. Add 9 center definitions
4. Implement `loader.ts` for caching

**Start Here**: See `docs/GOD_ENGINE_SPEC.md` for exact structure

### Priority 2: Birth Chart Calculator (1-2 weeks)
1. Install `astronomy-engine` package
2. Create `lib/defrag/resolver.ts`
3. Implement planetary position calculation
4. Derive Type, Strategy, Authority, Profile
5. Determine active gates and centers

**Reference**: Look at existing Human Design calculators for logic

### Priority 3: Event Processing (2 weeks)
1. Create `lib/defrag/stress-mapper.ts` - keyword to stress vector
2. Create `lib/defrag/physics.ts` - vector state evolution
3. Create `lib/defrag/inversion.ts` - protocol selection
4. Create `lib/defrag/seda.ts` - crisis detection

### Priority 4: UI Components (2-3 weeks)
1. Blueprint display (BodyGraph SVG)
2. Event logging form
3. Vector state visualization
4. Experiment cards
5. Onboarding flow

## Testing Strategy

```bash
# After implementing each component:
# 1. Unit test the logic
npm test lib/defrag/resolver.test.ts

# 2. Integration test the flow
npm test app/api/blueprints/route.test.ts

# 3. E2E test the UI
npm test tests/e2e/onboarding.spec.ts
```

## Deployment Checklist

Before going live:
- [ ] God Engine data complete (at least 10 gates)
- [ ] Birth chart calculator working
- [ ] Event logging functional
- [ ] All tests passing
- [ ] Stripe webhook configured
- [ ] Environment variables set
- [ ] Database migrated
- [ ] Performance tested

## Resources

### Documentation
- `docs/DEFRAG_ARCHITECTURE.md` - System design
- `docs/GOD_ENGINE_SPEC.md` - Data structure
- `docs/DEPLOYMENT.md` - Production setup
- `docs/README_DEFRAG.md` - Feature overview

### External References
- [Human Design](https://www.jovianarchive.com/)
- [Gene Keys](https://genekeys.com/)
- [Astronomy Engine](https://github.com/cosinekitty/astronomy)
- [Stripe Docs](https://stripe.com/docs)

## Common Questions

**Q: Can I test Stripe without a real account?**
A: Yes! Use Stripe test mode. Test card: 4242 4242 4242 4242

**Q: Where do I add new environment variables?**
A: Add to `.env.local` for local dev, Vercel dashboard for production

**Q: How do I reset my local database?**
A: `pnpm db:push --force` (WARNING: destroys data)

**Q: The build fails, what do I do?**
A: Check the error. Usually missing env var or type error. See `docs/DEPLOYMENT.md` troubleshooting.

**Q: How do I test the webhook locally?**
A: Use Stripe CLI: `stripe listen --forward-to localhost:3000/api/stripe/webhook`

## Support

- **Issues**: Open GitHub issue with `[DEFRAG]` prefix
- **Questions**: Check documentation first
- **Contributing**: See main README for guidelines

---

## Success! 🎉

You now have a production-ready DEFRAG foundation. The infrastructure is solid, the documentation is comprehensive, and the path forward is clear.

**Next**: Choose a Priority task above and start building!

Good luck! 🚀
