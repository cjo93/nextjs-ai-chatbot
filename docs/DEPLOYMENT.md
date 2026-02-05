# DEFRAG Deployment Guide

## Prerequisites

- Vercel account
- Stripe account (for payments)
- PostgreSQL database (Vercel Postgres or other)
- Domain name (optional)

## Environment Variables

### Required Variables

Create these in Vercel dashboard or `.env.local`:

```bash
# Authentication
AUTH_SECRET=<generate with: openssl rand -base64 32>

# Database
POSTGRES_URL=<postgresql connection string>

# Stripe (Production)
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_PRO_MONTHLY=price_...
STRIPE_PRICE_PRO_ANNUAL=price_...
STRIPE_PRICE_LINEAGE_MONTHLY=price_...
STRIPE_PRICE_LINEAGE_ANNUAL=price_...

# Application URL
NEXT_PUBLIC_APP_URL=https://yourdomain.com

# Optional: AI Gateway (for chat features)
AI_GATEWAY_API_KEY=...

# Optional: Blob Storage (for file uploads)
BLOB_READ_WRITE_TOKEN=...

# Optional: Redis (for caching)
REDIS_URL=...
```

## Stripe Setup

### 1. Create Products and Prices

In Stripe Dashboard:

1. Go to **Products** → **Add Product**
2. Create three products:
   - **DEFRAG Pro** - $19/month
   - **DEFRAG Pro Annual** - $190/year (20% discount)
   - **DEFRAG Lineage** - $99/month
   - **DEFRAG Lineage Annual** - $990/year (17% discount)

3. Copy the Price IDs (starts with `price_...`)
4. Add to environment variables

### 2. Configure Webhook

1. Go to **Developers** → **Webhooks**
2. Click **Add endpoint**
3. Set URL: `https://yourdomain.com/api/stripe/webhook`
4. Select events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Copy webhook signing secret
6. Add to `STRIPE_WEBHOOK_SECRET` environment variable

### 3. Configure Customer Portal

1. Go to **Settings** → **Billing** → **Customer portal**
2. Enable customer portal
3. Configure:
   - Allow customers to update payment methods
   - Allow customers to cancel subscriptions
   - Allow customers to switch plans
4. Set return URL: `https://yourdomain.com/defrag/settings`

## Database Setup

### 1. Create Database

Using Vercel Postgres:
```bash
vercel postgres create defrag-prod
```

Or use any PostgreSQL provider (Neon, Supabase, RDS, etc.)

### 2. Run Migrations

```bash
# Set POSTGRES_URL in .env.local
export POSTGRES_URL="postgresql://..."

# Run migrations
pnpm db:migrate
```

### 3. Verify Tables

```bash
# Open Drizzle Studio
pnpm db:studio

# Verify all tables exist:
# - User
# - Subscription
# - Blueprint
# - VectorState
# - Event
# - Experiment
# - Relationship
# - InversionOutcome
# - SedaEvent
```

## Vercel Deployment

### 1. Initial Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

### 2. Configure Project Settings

In Vercel Dashboard:

1. **Build Settings**:
   - Framework: Next.js
   - Build Command: `pnpm build`
   - Output Directory: `.next`
   - Install Command: `pnpm install`

2. **Environment Variables**:
   - Add all variables from Prerequisites section
   - Mark production-only variables appropriately

3. **Domains**:
   - Add custom domain if desired
   - Configure DNS records

### 3. Git Integration

1. Connect GitHub repository
2. Enable automatic deployments on push
3. Configure branch deployments:
   - `main` → Production
   - `develop` → Preview

## Post-Deployment Checklist

### Immediate (Within 1 hour)

- [ ] Verify homepage loads: `/defrag/defrag`
- [ ] Test user registration/login
- [ ] Verify database connection
- [ ] Test Stripe checkout flow (use test card)
- [ ] Verify webhook receives events
- [ ] Check error tracking (Sentry)
- [ ] Verify subscription creation in database

### Day 1

- [ ] Test all page routes
- [ ] Verify authentication redirects
- [ ] Test subscription upgrades
- [ ] Test subscription cancellation via portal
- [ ] Monitor error logs
- [ ] Check database query performance
- [ ] Verify email notifications (if implemented)

### Week 1

- [ ] Monitor Stripe webhook delivery
- [ ] Check subscription renewals
- [ ] Review user feedback
- [ ] Monitor performance metrics
- [ ] Check for any edge cases
- [ ] Review Stripe dashboard for anomalies

## Monitoring Setup

### 1. Error Tracking (Sentry)

```bash
# Install Sentry
pnpm add @sentry/nextjs

# Initialize
npx @sentry/wizard@latest -i nextjs
```

Add to environment variables:
```bash
NEXT_PUBLIC_SENTRY_DSN=...
SENTRY_AUTH_TOKEN=...
```

### 2. Analytics (PostHog)

```bash
# Install PostHog
pnpm add posthog-js

# Add to environment
NEXT_PUBLIC_POSTHOG_KEY=...
NEXT_PUBLIC_POSTHOG_HOST=...
```

### 3. Vercel Analytics

Already included - just enable in Vercel dashboard:
- Speed Insights
- Web Analytics

## Backup Strategy

### Database Backups

1. **Automatic Backups** (Vercel Postgres):
   - Daily automated backups
   - 7-day retention
   - Point-in-time recovery

2. **Manual Backups**:
```bash
# Export database
pg_dump $POSTGRES_URL > backup-$(date +%Y%m%d).sql

# Store in S3 or similar
aws s3 cp backup-*.sql s3://your-bucket/backups/
```

### Code Backups

- Git repository (GitHub/GitLab)
- Tagged releases for each deployment
- Branch protection on `main`

## Rollback Procedure

### Application Rollback

1. In Vercel Dashboard:
   - Go to Deployments
   - Find last working deployment
   - Click "..." → "Promote to Production"

2. Via CLI:
```bash
# List deployments
vercel ls

# Rollback to specific deployment
vercel alias <deployment-url> production
```

### Database Rollback

1. Stop new deployments
2. Restore from backup:
```bash
psql $POSTGRES_URL < backup-YYYYMMDD.sql
```
3. Test thoroughly before resuming

## Performance Optimization

### 1. Caching Strategy

- Edge caching for static pages
- CDN for assets
- Database query caching
- God Engine JSON in-memory cache

### 2. Database Optimization

```sql
-- Add indexes for common queries
CREATE INDEX idx_subscription_user ON "Subscription"("userId");
CREATE INDEX idx_blueprint_user ON "Blueprint"("userId");
CREATE INDEX idx_event_blueprint ON "Event"("blueprintId");
CREATE INDEX idx_event_user_created ON "Event"("userId", "createdAt" DESC);
CREATE INDEX idx_experiment_blueprint ON "Experiment"("blueprintId");
CREATE INDEX idx_vectorstate_blueprint ON "VectorState"("blueprintId");
```

### 3. Code Splitting

```typescript
// Lazy load heavy components
const BodyGraph = dynamic(() => import('@/components/defrag/BodyGraph'), {
  loading: () => <Skeleton />
});
```

## Security Hardening

### 1. Rate Limiting

Add to API routes:
```typescript
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '10 s'),
});
```

### 2. Security Headers

Already configured in Next.js, verify:
- HTTPS only
- HSTS enabled
- CSP configured
- XSS protection

### 3. Input Validation

All user inputs validated with Zod schemas.

## Maintenance Schedule

### Daily
- Check error logs
- Monitor Stripe webhooks
- Review failed payments

### Weekly
- Review performance metrics
- Check database size
- Update dependencies (security patches)

### Monthly
- Review user feedback
- Update documentation
- Dependency updates (all packages)
- Security audit

### Quarterly
- Load testing
- Disaster recovery drill
- Security penetration testing
- Cost optimization review

## Troubleshooting

### Webhook Not Firing

1. Check Stripe Dashboard → Webhooks → Event logs
2. Verify webhook URL is correct
3. Test webhook with Stripe CLI:
```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

### Database Connection Issues

1. Verify POSTGRES_URL is correct
2. Check connection pool settings
3. Monitor active connections:
```sql
SELECT count(*) FROM pg_stat_activity;
```

### Build Failures

1. Check build logs in Vercel
2. Verify all environment variables are set
3. Test build locally:
```bash
pnpm build
```

### Stripe Checkout Not Working

1. Verify publishable key is set
2. Check browser console for errors
3. Test with Stripe test cards
4. Verify price IDs are correct

## Support Contacts

- **Vercel Support**: support@vercel.com
- **Stripe Support**: https://support.stripe.com
- **Development Team**: [your-team@email.com]

## Additional Resources

- [Next.js Deployment Docs](https://nextjs.org/docs/deployment)
- [Vercel Documentation](https://vercel.com/docs)
- [Stripe Integration Guide](https://stripe.com/docs/payments/checkout)
- [PostgreSQL Best Practices](https://wiki.postgresql.org/wiki/Tuning_Your_PostgreSQL_Server)
