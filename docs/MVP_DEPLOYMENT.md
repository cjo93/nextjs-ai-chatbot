# DEFRAG MVP Deployment Guide

## Quick Start

This is the simplified MVP version of DEFRAG, ready for immediate deployment.

### Features Included

✅ Simple Human Design calculator (generates Type, Strategy, Authority, Profile)
✅ User authentication (existing)
✅ Create free birth chart (/defrag/start)
✅ View chart results (/defrag/chart/[id])
✅ Pricing page with Free and Pro ($19/mo) tiers
✅ Stripe integration for subscriptions
✅ Webhook handling for payment events

### Database Schema

The following tables are already in the schema:
- `User` - User accounts
- `Subscription` - Subscription tiers and Stripe data
- `Blueprint` - Birth chart data
- `Event` - Event logging (for Pro tier)
- Other tables for advanced features

### Environment Variables

Required for deployment:

```bash
# Auth
AUTH_SECRET=<generate-with-openssl-rand-base64-32>

# Database
POSTGRES_URL=<your-postgres-connection-string>

# Stripe
STRIPE_SECRET_KEY=sk_test_... or sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRO_PRICE_ID=price_...

# App URL
NEXT_PUBLIC_APP_URL=https://defrag.app
```

### Deployment Steps

1. **Generate migrations (if schema changed)**:
   ```bash
   pnpm db:generate
   ```

2. **Build locally to verify**:
   ```bash
   pnpm build
   ```

3. **Deploy to Vercel**:
   - Push code to GitHub
   - Connect repository to Vercel
   - Add environment variables in Vercel dashboard
   - Configure custom domain: defrag.app
   - Deploy

4. **Configure Stripe**:
   - Create product and price in Stripe dashboard ($19/mo)
   - Copy price ID to STRIPE_PRO_PRICE_ID env var
   - Add webhook endpoint: https://defrag.app/api/stripe/webhook
   - Select events: checkout.session.completed, customer.subscription.updated, customer.subscription.deleted
   - Copy webhook secret to STRIPE_WEBHOOK_SECRET env var

### MVP Pages

- **Landing**: `/defrag` - Public landing page
- **Start**: `/defrag/start` - Simple chart creation form (requires login)
- **Chart**: `/defrag/chart/[id]` - Display chart results
- **Pricing**: `/defrag/pricing` - Show Free and Pro tiers
- **Dashboard**: `/defrag/dashboard` - User dashboard (existing)

### Testing

1. **Sign up**: Create a new account at `/register`
2. **Create chart**: Go to `/defrag/start`, fill form, submit
3. **View chart**: Should redirect to `/defrag/chart/[id]`
4. **Upgrade**: Go to `/defrag/pricing`, click "Upgrade Now"
5. **Test payment**: Use Stripe test card: 4242 4242 4242 4242

### Simplified Calculator

The MVP uses a simplified algorithm that generates basic Human Design info from birth date:
- **Type**: Generator, Projector, Manifestor, Reflector, Manifesting Generator
- **Strategy**: Based on Type
- **Authority**: Emotional, Sacral, Splenic, Ego, Self-Projected, Mental, Lunar
- **Profile**: e.g., "3/5", "2/4"

For production use with accurate ephemeris calculations, replace with the existing complex calculator in `lib/defrag/resolver.ts`.

### Build Command

The `vercel.json` includes the build command:
```json
{
  "buildCommand": "pnpm db:generate && pnpm build",
  "framework": "nextjs"
}
```

### Success Criteria

- [x] User can sign up
- [x] User can create free chart
- [x] Chart displays Type/Strategy/Authority/Profile
- [x] Pricing page shows Pro tier at $19/mo
- [x] Stripe checkout works
- [x] Site loads at https://defrag.app

## Post-MVP Enhancements

After MVP is live, consider:
- Replace simple calculator with accurate ephemeris calculations
- Add event tracking for Pro users
- Add relationship synastry features
- Add vector state visualization
- Implement SEDA protocol for high-severity events
