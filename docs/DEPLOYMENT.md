# DEFRAG Platform Deployment Guide

This guide covers deploying the DEFRAG platform to production.

## Prerequisites

- Node.js 18+ and npm/pnpm
- PostgreSQL database
- Stripe account
- Vercel account (recommended) or other hosting platform
- Optional: OpenAI API key for AI-powered inversion scripts

## 1. Environment Setup

### Required Environment Variables

Copy `.env.example` to `.env.local` and configure:

```bash
cp .env.example .env.local
```

#### Core Variables

```env
# NextAuth Secret (generate with: openssl rand -base64 32)
AUTH_SECRET=your-random-secret-here

# Database
POSTGRES_URL=postgresql://user:password@host:5432/dbname

# Application URL
NEXT_PUBLIC_APP_URL=https://your-domain.com

# Redis (optional, for caching)
REDIS_URL=redis://host:6379
```

#### Stripe Configuration

1. **Get API Keys**: https://dashboard.stripe.com/apikeys
   ```env
   STRIPE_SECRET_KEY=sk_live_****
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_****
   ```

2. **Create Products**:
   - Go to https://dashboard.stripe.com/products
   - Create "Pro" product with $29/month recurring price
   - Create "Lineage" product with $99/month recurring price
   - Copy the price IDs:
   ```env
   STRIPE_PRO_PRICE_ID=price_****
   STRIPE_LINEAGE_PRICE_ID=price_****
   ```

3. **Setup Webhook**:
   - Go to https://dashboard.stripe.com/webhooks
   - Add endpoint: `https://your-domain.com/api/stripe/webhook`
   - Select events:
     - `checkout.session.completed`
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_succeeded`
     - `invoice.payment_failed`
   - Copy webhook signing secret:
   ```env
   STRIPE_WEBHOOK_SECRET=whsec_****
   ```

#### Optional: OpenAI for SEDA

```env
OPENAI_API_KEY=sk-****
```

If not provided, only deterministic inversion scripts will be generated (SEDA will be disabled).

## 2. Database Migration

### Initial Setup

```bash
# Install dependencies
npm install
# or
pnpm install

# Run database migrations
npm run db:push
# or use Drizzle directly
npx drizzle-kit push
```

### Verify Schema

Check that all DEFRAG tables are created:
- `Blueprint`
- `VectorState`
- `Event`
- `Experiment`
- `Relationship`
- `InversionOutcome`
- `SedaEvent`
- `Subscription`

### Seed Initial Data (Optional)

Create a seed script if needed for default subscriptions:

```typescript
// scripts/seed.ts
import { db } from "./lib/db/utils";
import { subscription } from "./lib/db/schema";

// Create free tier subscriptions for existing users
// Add your seeding logic here
```

## 3. Build and Test Locally

```bash
# Build the application
npm run build

# Test production build locally
npm run start

# Open http://localhost:3000
```

### Test Checklist

- [ ] Landing page loads
- [ ] Pricing page displays correctly
- [ ] Onboarding flow creates blueprint
- [ ] Dashboard shows blueprints
- [ ] Event logging works
- [ ] Inversion scripts generate
- [ ] Stripe checkout redirects properly
- [ ] Settings page loads

## 4. Vercel Deployment

### Option A: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

### Option B: Deploy via GitHub Integration

1. Push code to GitHub
2. Import project to Vercel: https://vercel.com/new
3. Configure environment variables in Vercel dashboard
4. Deploy

### Vercel Configuration

Create `vercel.json` (if not exists):

```json
{
  "buildCommand": "npm run build",
  "framework": "nextjs",
  "env": {
    "NEXT_PUBLIC_APP_URL": "https://your-domain.vercel.app"
  }
}
```

### Set Environment Variables in Vercel

1. Go to Project Settings → Environment Variables
2. Add all variables from `.env.example`
3. Use Production/Preview/Development scopes appropriately

## 5. Post-Deployment Configuration

### Update Stripe Webhook

Update the webhook URL in Stripe dashboard:
- Old: `http://localhost:3000/api/stripe/webhook`
- New: `https://your-domain.com/api/stripe/webhook`

### Verify Webhook

Test webhook by creating a test subscription:
1. Go to Stripe Dashboard → Webhooks
2. Click your webhook
3. Click "Send test webhook"
4. Verify it succeeds

### Custom Domain (Optional)

In Vercel:
1. Go to Project Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed
4. Update `NEXT_PUBLIC_APP_URL` environment variable

## 6. Database Backups

### Automated Backups (Recommended)

If using Vercel Postgres:
- Automatic daily backups included
- Point-in-time recovery available

If using external PostgreSQL:
- Setup automated backups with your provider
- Recommended: Daily backups with 30-day retention

### Manual Backup

```bash
# Export database
pg_dump $POSTGRES_URL > backup.sql

# Restore database
psql $POSTGRES_URL < backup.sql
```

## 7. Monitoring and Logging

### Vercel Analytics

Enable in Project Settings:
- Web Analytics
- Speed Insights
- Logs

### Error Tracking (Recommended)

Integrate error tracking service:
- Sentry
- LogRocket
- Datadog

Add to `instrumentation.ts` or create error boundary.

### Health Check Endpoint

Create `/api/health` route:

```typescript
// app/api/health/route.ts
export async function GET() {
  // Check database connection
  // Check external services
  return Response.json({ status: "healthy" });
}
```

## 8. Security Checklist

- [ ] All environment variables are set and secret
- [ ] HTTPS is enforced (automatic on Vercel)
- [ ] AUTH_SECRET is cryptographically random
- [ ] Stripe webhook secret is configured
- [ ] Database has strong password
- [ ] Rate limiting is configured (optional)
- [ ] CORS is properly configured
- [ ] CSP headers are set (optional)

## 9. Performance Optimization

### Edge Runtime (Optional)

Some routes can use Edge runtime for faster response:

```typescript
export const runtime = "edge";
```

### Image Optimization

Ensure images use Next.js Image component:
```tsx
import Image from "next/image";
```

### Caching Strategy

Configure Redis for:
- Session storage
- Rate limiting
- Cached calculations

## 10. Scaling Considerations

### Database

- Monitor query performance
- Add indexes for frequently queried fields
- Consider read replicas for high traffic

### API Rate Limiting

Implement rate limiting for:
- Event creation
- Blueprint generation
- AI script generation

### Cost Management

Monitor Stripe dashboard for:
- Subscription metrics
- Revenue tracking
- Failed payments

## 11. Maintenance

### Regular Tasks

- Monitor error logs weekly
- Review Stripe webhook logs
- Check database performance metrics
- Update dependencies monthly
- Review security advisories

### Update Process

```bash
# Update dependencies
npm update

# Test locally
npm run build && npm test

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

## 12. Rollback Procedure

If deployment fails:

1. **Vercel**: Instantly rollback to previous deployment
   - Go to Deployments tab
   - Click "..." on previous deployment
   - Select "Promote to Production"

2. **Database**: Restore from backup if schema changed
   ```bash
   psql $POSTGRES_URL < backup.sql
   ```

## 13. Support and Troubleshooting

### Common Issues

**Issue: Stripe webhook fails**
- Solution: Verify webhook secret matches
- Check webhook URL is correct
- Ensure HTTPS is enabled

**Issue: Database connection fails**
- Solution: Check POSTGRES_URL format
- Verify database allows connections from Vercel IPs
- Check connection pool limits

**Issue: Build fails**
- Solution: Check TypeScript errors
- Verify all dependencies are installed
- Check Node.js version compatibility

### Debug Mode

Enable verbose logging:
```env
DEBUG=true
NODE_ENV=development
```

## 14. Production Checklist

Before going live:

- [ ] All environment variables configured
- [ ] Database migrated and tested
- [ ] Stripe products and prices created
- [ ] Webhook configured and tested
- [ ] Custom domain configured (if applicable)
- [ ] SSL certificate active
- [ ] Error tracking enabled
- [ ] Backups configured
- [ ] Legal pages reviewed (Terms, Privacy, Disclaimer)
- [ ] Test user flows end-to-end
- [ ] Load testing completed (if expecting high traffic)

## 15. Contact and Support

For deployment issues:
- GitHub Issues: [Your repo]
- Email: support@defrag.app
- Vercel Support: https://vercel.com/support

---

**Deployment Time Estimate**: 2-4 hours for first deployment

**Recommended**: Test on Vercel preview environment before production deployment.
