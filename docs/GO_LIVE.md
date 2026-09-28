# Production Cutover & Go-Live Checklist: Anu Atelier

**Target Branch:** `backend` → `main` (Strictly executed ONLY after explicit user go-live approval)  
**Target Environment:** `anu-atelier-prod` (Supabase) + Production Domain `anuatelier.com` (Vercel)  
**Date:** September 2026

---

## 1. Pre-Flight Verification Checklist

Before starting production cutover, verify all automated gates pass:

- [ ] All 92 backend unit and integration tests pass: `npm test`
- [ ] Razorpay simulation passes: `npm run test:razorpay`
- [ ] Developer smoke test suite passes: `npm run smoke`
- [ ] Light load benchmark passes: `npm run test:load`
- [ ] TypeScript check clean with 0 errors: `npx tsc --noEmit`
- [ ] Git working directory clean: `git status` on branch `backend`
- [ ] Zero exposed credentials or plaintext secrets committed in git history

---

## 2. Production Environment Setup

### 2.1 Provision Supabase Production (`anu-atelier-prod`)
1. Create a new Supabase project named `anu-atelier-prod` in region **South Asia (Mumbai) `ap-south-1`**.
2. Run database migrations in exact sequential order in the SQL Editor:
   - `001_foundation.sql`
   - `002_catalog_and_discovery.sql`
   - `004_cart_to_order.sql`
   - `005_payments.sql`
   - `006_fulfilment_and_post_purchase.sql`
   - `007_admin_operations.sql`
   *(Note: Do NOT apply `003_seed_dev_catalog.sql` on production unless initial crafts are to be loaded as live catalog)*.
3. Create your store owner account in **Authentication** → **Users**.
4. Promote the owner user to `admin`:
   ```sql
   UPDATE public.profiles
   SET role = 'admin'::public.user_role
   WHERE email = 'anushka32199@gmail.com';
   ```

### 2.2 Razorpay Live Mode Activation
1. Complete Razorpay Business KYC:
   - Business Legal Name & PAN card.
   - Bank Account verification (Account Number + IFSC).
   - Website compliance pages published:
     - About Us
     - Contact Us (with Grievance Officer details)
     - Shipping & Delivery Policy
     - Terms & Conditions
     - Privacy Policy
     - Cancellation & Refund Policy
2. Switch top dashboard toggle from **Test Mode** to **Live Mode**.
3. Generate Live API Keys:
   - Copy `RAZORPAY_KEY_ID` (starts with `rzp_live_...`).
   - Copy `RAZORPAY_KEY_SECRET`.
4. Configure Production Webhook:
   - URL: `https://anuatelier.com/api/webhooks/razorpay`
   - Secret: Generate random 24-character string (`RAZORPAY_WEBHOOK_SECRET`).
   - Events: `order.paid`, `payment.captured`, `payment.failed`, `refund.processed`.

### 2.3 Resend Custom Domain Configuration
1. In Resend Dashboard → **Domains** → **Add Domain** (`anuatelier.com`).
2. Add DNS records to domain registrar (Cloudflare / GoDaddy):
   - DKIM TXT record
   - SPF TXT record
   - Return-Path MX record
3. Once status is **Verified**, set `EMAIL_FROM='orders@anuatelier.com'`.

### 2.4 Vercel Production Environment Configuration
In Vercel Project Settings → **Environment Variables**, configure the Production scope:

| Key | Scope | Example Value |
|---|---|---|
| `APP_ENV` | Production | `production` |
| `APP_BASE_URL` | Production | `https://anuatelier.com` |
| `SUPABASE_URL` | Production | `https://[prod-ref].supabase.co` |
| `SUPABASE_ANON_KEY` | Production | `[prod-anon-key]` |
| `SUPABASE_SERVICE_ROLE_KEY` | Production (Secret) | `[prod-service-role-key]` |
| `RAZORPAY_KEY_ID` | Production | `rzp_live_[key]` |
| `RAZORPAY_KEY_SECRET` | Production (Secret) | `[prod-secret]` |
| `RAZORPAY_WEBHOOK_SECRET` | Production (Secret) | `[prod-webhook-secret]` |
| `EMAIL_PROVIDER_API_KEY` | Production (Secret) | `re_[prod-key]` |
| `EMAIL_FROM` | Production | `orders@anuatelier.com` |
| `ADMIN_ALERT_EMAIL` | Production | `anushka32199@gmail.com` |
| `CRON_SECRET` | Production (Secret) | `[random-32-char-secret]` |
| `TURNSTILE_SECRET_KEY` | Production (Secret) | `[cloudflare-turnstile-secret]` |

---

## 3. Go-Live Cutover Execution

Once approved:
1. Merge `backend` branch into `main`:
   ```bash
   git checkout main
   git merge backend --no-ff -m "chore: merge backend production architecture (Phases B0-B7)"
   git push origin main
   ```
2. Vercel automatically triggers production deployment.
3. Perform Live ₹1 Smoke Verification:
   - Place a live test order on `anuatelier.com` using UPI (Google Pay / PhonePe).
   - Verify SMS/Email notification received.
   - Verify order recorded in Supabase `orders` table.
   - Immediately execute refund from Admin panel to refund the ₹1 test payment.
   - Verify refund receipt.

---

## 4. Emergency Rollback Plan

If an unexpected critical issue occurs immediately post-launch:
1. **Frontend / API Rollback**:
   - In Vercel Dashboard → Deployments → Click the 3 dots on the previous working deployment → **Instant Rollback**.
2. **Database Migration Rollback**:
   - Supabase Point-in-Time Recovery (PITR) allows rolling back to any minute within the last 7 days.
   - Alternatively, restore the pre-cutover backup via `scripts/backup.sh`.
3. Notify users via Twitter/Instagram status update if any maintenance window is required.
