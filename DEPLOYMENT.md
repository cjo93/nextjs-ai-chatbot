# DEFRAG Production Deployment Guide

## Overview
This guide covers deploying the DEFRAG application to production at https://defrag.app using Vercel.

## Prerequisites

- Vercel account with domain `defrag.app` configured
- PostgreSQL database (Vercel Postgres recommended)
- Redis instance (Upstash or similar)
- Stripe account with production keys
- Resend account for email sending
- PostHog account for analytics (optional)
- Sentry account for error tracking (optional)

## 1. Environment Variables Setup

### Required Variables

Add these to your Vercel project settings under Environment Variables (Production):

```bash
# App Configuration
NEXT_PUBLIC_APP_URL=https://defrag.app
NEXT_PUBLIC_APP_NAME=DEFRAG
NODE_ENV=production

# Database (Vercel Postgres)
POSTGRES_URL=postgresql://...
POSTGRES_PRISMA_URL=postgresql://...
POSTGRES_URL_NON_POOLING=postgresql://...

# Authentication (NextAuth v5)
AUTH_SECRET=<generate-with-openssl-rand-base64-32>
NEXTAUTH_URL=https://defrag.app

# AI Gateway (Vercel)
AI_GATEWAY_API_KEY=<your-key>
BLOB_READ_WRITE_TOKEN=<your-token>

# Redis
REDIS_URL=redis://...
```

### Optional Production Services

```bash
# Stripe (PRODUCTION KEYS)
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_PRO_MONTHLY=price_...
STRIPE_PRICE_PRO_ANNUAL=price_...
STRIPE_PRICE_LINEAGE_MONTHLY=price_...
STRIPE_PRICE_LINEAGE_ANNUAL=price_...

# Email (Resend)
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=noreply@defrag.app

# Analytics (PostHog)
NEXT_PUBLIC_POSTHOG_KEY=phc_...
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com

# Monitoring (Sentry)
SENTRY_DSN=https://...@sentry.io/...
SENTRY_AUTH_TOKEN=...

# Feature Flags
NEXT_PUBLIC_ENABLE_AI_ENHANCEMENT=false
NEXT_PUBLIC_ENABLE_TRANSITS=false
NEXT_PUBLIC_MAINTENANCE_MODE=false
```

### Generate AUTH_SECRET

```bash
openssl rand -base64 32
```

## 2. Domain Configuration

### Vercel Domain Setup

1. Go to Vercel Project Settings → Domains
2. Add `defrag.app`
3. Add `www.defrag.app` (will auto-redirect to defrag.app)
4. Configure DNS records as provided by Vercel:
   - A record: `76.76.21.21`
   - CNAME record for www: `cname.vercel-dns.com`

### SSL/HTTPS

Vercel automatically provisions SSL certificates. HTTPS is enforced via:
- `Strict-Transport-Security` headers
- Automatic redirects in `vercel.json`

## 3. Email Domain Configuration (Resend)

Add these DNS records to your domain:

### SPF Record
```
Type: TXT
Name: @
Value: v=spf1 include:_spf.resend.com ~all
```

### DKIM Record
Get from Resend dashboard after adding domain

### DMARC Record
```
Type: TXT
Name: _dmarc
Value: v=DMARC1; p=none; rua=mailto:dmarc@defrag.app
```

## 4. Database Setup

### Initial Migration

The build command automatically runs migrations:
```bash
pnpm db:migrate && pnpm build
```

### Manual Migration (if needed)

```bash
pnpm run db:migrate
```

Or use the production migration script:
```bash
npx tsx scripts/production-migrate.ts
```

### Database Indexes

Ensure these indexes exist for optimal performance (should be in migrations):

```sql
CREATE INDEX idx_events_blueprint_id ON "Event"(blueprintId);
CREATE INDEX idx_events_user_id ON "Event"(userId);
CREATE INDEX idx_events_created_at ON "Event"(createdAt);
CREATE INDEX idx_events_severity ON "Event"(severityNumeric);
CREATE INDEX idx_blueprints_user_id ON "Blueprint"(userId);
CREATE INDEX idx_subscriptions_user_id ON "Subscription"(userId);
CREATE INDEX idx_subscriptions_stripe_customer_id ON "Subscription"(stripeCustomerId);
```

## 5. Stripe Configuration

### Webhook Setup

1. Go to Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://defrag.app/api/stripe/webhook`
3. Select these events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
   - `customer.subscription.trial_will_end`
4. Copy webhook signing secret to Vercel environment variables as `STRIPE_WEBHOOK_SECRET`

### Product/Price IDs

Create products in Stripe Dashboard and add price IDs to environment variables:
- `STRIPE_PRICE_PRO_MONTHLY`
- `STRIPE_PRICE_PRO_ANNUAL`
- `STRIPE_PRICE_LINEAGE_MONTHLY`
- `STRIPE_PRICE_LINEAGE_ANNUAL`

## 6. Monitoring Setup

### Sentry (Error Tracking)

Install Sentry SDK if not already installed:
```bash
pnpm add @sentry/nextjs
```

Configuration is in:
- `sentry.server.config.ts` (server-side)
- `sentry.edge.config.ts` (edge runtime)
- `instrumentation.ts` (initialization)

### PostHog (Analytics)

Install PostHog if not already installed:
```bash
pnpm add posthog-js
```

Initialize in your app:
```typescript
import { initAnalytics } from '@/lib/analytics'

// In _app.tsx or layout.tsx
useEffect(() => {
  initAnalytics()
}, [])
```

## 7. Deployment Process

### Via GitHub (Recommended)

1. Push to `main` branch
2. Vercel automatically deploys
3. Monitor deployment in Vercel Dashboard

### Via Vercel CLI

```bash
vercel --prod
```

### Build Command

Configured in `vercel.json`:
```json
{
  "buildCommand": "pnpm db:migrate && pnpm build"
}
```

## 8. Post-Deployment Verification

### Health Check

```bash
curl https://defrag.app/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "version": "3.1.0"
}
```

### Verify Features

- [ ] Homepage loads correctly
- [ ] User signup works
- [ ] Login works
- [ ] Payment flow (test mode first)
- [ ] Email sending
- [ ] Webhook receiving (check Stripe dashboard)
- [ ] Analytics tracking
- [ ] Error logging in Sentry

### Test Payment Flow

Use Stripe test card in production:
```
Card: 4242 4242 4242 4242
Expiry: Any future date
CVC: Any 3 digits
ZIP: Any 5 digits
```

## 9. Backup Strategy

### Automated Backups

Vercel Postgres includes automatic backups:
- Daily backups retained for 7 days
- Weekly backups retained for 30 days
- Monthly backups retained for 1 year

### Manual Backup

```bash
npx tsx scripts/backup.ts
```

Backups are stored in `backups/` directory (gitignored).

## 10. Security Checklist

- [x] HTTPS enforced (automatic with Vercel)
- [x] Security headers configured in `vercel.json`
- [x] Environment variables secured in Vercel dashboard
- [x] API rate limiting enabled (`lib/rate-limit.ts`)
- [x] CORS properly configured
- [x] SQL injection prevention (Drizzle ORM)
- [x] XSS prevention (React)
- [x] CSRF protection (Next.js built-in)
- [ ] Ensure sensitive data is not logged
- [ ] Verify error messages don't leak information
- [ ] Keep dependencies updated regularly

## 11. Performance Optimization

### Image Optimization

Configured in `next.config.ts`:
- AVIF and WebP support
- Multiple device sizes
- Optimized image sizes

### Caching Strategy

Redis caching available via `lib/cache/index.ts`:

```typescript
import { getCached } from '@/lib/cache'

const data = await getCached('key', async () => {
  // Fetch data
  return result
}, 3600) // TTL in seconds
```

### Rate Limiting

Configured in `lib/rate-limit.ts`:
- API: 10 requests per 10 seconds
- Checkout: 3 requests per hour
- Events: 20 requests per minute

Usage:
```typescript
import { ratelimit } from '@/lib/rate-limit'

const { success, remaining } = await ratelimit.api(userId)
if (!success) {
  return new Response('Rate limit exceeded', { status: 429 })
}
```

## 12. Monitoring & Alerts

### Set Up Uptime Monitoring

Use services like:
- UptimeRobot
- Pingdom
- Better Uptime

Monitor these endpoints:
- `https://defrag.app` (homepage)
- `https://defrag.app/api/health` (health check)

### Configure Alerts

Set up alerts for:
- Downtime (> 1 minute)
- High error rate (> 5% in Sentry)
- Slow response times (> 3 seconds)
- Failed payments (Stripe webhook)

### Key Metrics to Track

**Week 1:**
- Total signups
- Onboarding completion rate
- First event logged rate
- Error rates

**Month 1:**
- MRR (Monthly Recurring Revenue)
- Active users
- Churn rate
- Average events per user

**Quarter 1:**
- ARR (Annual Recurring Revenue)
- LTV (Lifetime Value)
- CAC (Customer Acquisition Cost)
- Feature usage rates

## 13. Troubleshooting

### Database Connection Issues

Check environment variables:
```bash
vercel env pull
```

### Build Failures

1. Check Vercel build logs
2. Run build locally: `pnpm build`
3. Check for missing environment variables

### Webhook Issues

1. Check webhook signing secret matches Stripe
2. Verify endpoint URL is correct
3. Check Stripe Dashboard → Webhooks for failed events
4. Review server logs in Vercel

### Email Delivery Issues

1. Verify DNS records are correct
2. Check Resend dashboard for failed emails
3. Ensure `RESEND_FROM_EMAIL` matches verified domain

## 14. Rollback Procedure

### Via Vercel Dashboard

1. Go to Deployments
2. Find previous working deployment
3. Click "..." → "Promote to Production"

### Via CLI

```bash
vercel rollback
```

## 15. Support

### Status Page

Create a status page at `status.defrag.app` to communicate:
- System uptime
- Current incidents
- Scheduled maintenance
- Historical uptime data

### Support Email

Configure: `support@defrag.app`
- Set up auto-responder
- Implement ticket tracking
- Create knowledge base for common issues

## 16. Continuous Improvement

### Post-Launch Roadmap

- Week 2: Optimize performance based on metrics
- Week 4: Implement additional features
- Week 8: Mobile apps (if planned)
- Week 12: Advanced features

### Regular Maintenance

- Weekly: Review error logs
- Monthly: Update dependencies
- Quarterly: Security audit
- Annually: Infrastructure review

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Production Checklist](https://nextjs.org/docs/going-to-production)
- [Stripe Integration Guide](https://stripe.com/docs)
- [Resend Documentation](https://resend.com/docs)
- [PostHog Documentation](https://posthog.com/docs)
- [Sentry Documentation](https://docs.sentry.io)

## Questions?

For technical support, contact: support@defrag.app
