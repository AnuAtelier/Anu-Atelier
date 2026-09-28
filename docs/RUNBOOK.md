# Operations & Incident Runbook: Anu Atelier

**Branch:** `backend`  
**Audience:** Store Owner, DevOps, Support & Warehouse Team  
**Last Updated:** Phase B7 Hardening

---

## 1. Quick Emergency Triage: Site / DB Outage

### Symptoms
- Frontend displays connection errors or product cards fail to load.
- Health check `GET /api/health` returns status `503` or `{ "status": "down" }`.

### Immediate Actions
1. **Check Supabase Status**:
   - Log in to [Supabase Dashboard](https://supabase.com/dashboard).
   - Check if the database instance is healthy in region `ap-south-1` (Mumbai).
   - Check **Database Health** → Connection count and CPU/Memory metrics.
2. **Check Vercel Deployment**:
   - Log in to [Vercel Dashboard](https://vercel.com).
   - Navigate to Deployments → View latest build status and Serverless Function logs for `/api/health`.
3. **Fail-Safe Client Degradation**:
   - The React frontend will display customer-friendly maintenance notice if Supabase is temporarily unreachable. Orders in flight retain items in local state for automatic retry once connectivity restores.

---

## 2. API Key Rotation SOP

If a secret is ever exposed or routine quarterly key rotation is performed:

### 2.1 Supabase Service Role Key
1. Go to Supabase Project Settings → **API**.
2. Click **Generate new service_role secret** (note: existing key remains valid for a 24h grace window).
3. Immediately update `SUPABASE_SERVICE_ROLE_KEY` in Vercel Environment Variables.
4. Redeploy latest production commit in Vercel to pick up new environment variables.

### 2.2 Razorpay Key Secret & Webhook Secret
1. In Razorpay Dashboard → **Account & Settings** → **API Keys** → **Regenerate Key**.
2. Update `RAZORPAY_KEY_SECRET` in Vercel.
3. In Razorpay Webhooks → Edit Webhook → Update Secret → Update `RAZORPAY_WEBHOOK_SECRET` in Vercel.
4. Run `npm run test:razorpay` to confirm signature verification succeeds.

### 2.3 Resend API Key
1. In Resend Dashboard → **API Keys** → Create new key.
2. Update `EMAIL_PROVIDER_API_KEY` in Vercel.

---

## 3. Database Backup & Disaster Recovery SOP

### 3.1 Taking a Manual Backup
Run the automated backup script from your secure terminal:
```bash
# Connect using your direct database connection string
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres" ./scripts/backup.sh
```
This generates a gzipped archive: `./backups/anu_atelier_backup_YYYYMMDD_HHMMSS.sql.gz`.

### 3.2 Restoring from Backup (Disaster Recovery)
> **CAUTION:** Restoring overwrites existing database state. Ensure all team members are notified.

1. Uncompress the backup archive:
   ```bash
   gunzip -k ./backups/anu_atelier_backup_YYYYMMDD_HHMMSS.sql.gz
   ```
2. Restore to your target database:
   ```bash
   psql "postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres" < ./backups/anu_atelier_backup_YYYYMMDD_HHMMSS.sql
   ```
3. Run smoke verification:
   ```bash
   npm run smoke
   npm test
   ```

---

## 4. Handling Payment Mismatches & Edge Cases

### 4.1 Payment Amount Mismatch
- **Scenario:** Customer's browser paid ₹499 instead of ₹599 due to an expired promo code during checkout.
- **System Defense:**
  - `mark_order_paid` refuses to transition order status to `paid`.
  - Order stays in `pending_payment`.
  - An entry is logged in `payment_alerts` with severity `CRITICAL`.
  - An automated alert email is sent to `ADMIN_ALERT_EMAIL`.
- **Resolution:**
  1. Inspect the mismatch in `payment_alerts` table.
  2. Initiate refund via `/api/admin/refunds` for the captured amount.
  3. Contact the customer with a fresh checkout link.

### 4.2 Duplicate Payment on Single Order
- **Scenario:** Customer accidentally paid twice due to multiple tabs open.
- **System Defense:**
  - First payment transitions order to `paid`.
  - Second payment event triggers duplicate payment handler.
  - Second payment is marked for refund in `refunds` ledger.
- **Resolution:**
  - Execute `/api/admin/refunds` with reason `'Duplicate payment detected for order'`.

---

## 5. Processing Customer Refunds

### 5.1 Online Refund (Razorpay)
Send authenticated POST request to `/api/admin/refunds`:
```json
{
  "order_id": "8b51d02c-...",
  "amount_paise": 49900,
  "reason": "Customer requested cancellation before shipment",
  "refund_type": "online"
}
```
The endpoint calls Razorpay API, generates a refund record in `refunds`, updates payment status to `refunded` or `partially_refunded`, and queues a confirmation email to the customer.

### 5.2 Cash on Delivery (COD) Refund
For returns on COD orders:
```json
{
  "order_id": "8b51d02c-...",
  "amount_paise": 79900,
  "reason": "Doorstep return approved - NEFT transfer reference #AXIS987123",
  "refund_type": "manual_bank_transfer"
}
```

---

## 6. Unblocking Customer Accounts & COD Access

If a customer was blocked due to suspected abuse or excessive RTO:
```sql
-- Super Admin SQL command
SELECT public.admin_set_customer_status(
  p_customer_id := 'c4e7f8a1-...',
  p_is_blocked := FALSE,
  p_cod_blocked := FALSE,
  p_reason := 'Customer verified identity and paid previous delivery charges'
);
```

---

## 7. Replaying Failed Webhooks

If Razorpay webhook events failed due to a serverless timeout:
1. Query unprocessed events:
   ```sql
   SELECT * FROM public.webhook_events WHERE processed = FALSE ORDER BY created_at DESC;
   ```
2. In Razorpay Dashboard → **Webhooks** → Select Webhook → **Retry** failed delivery.
3. Webhook idempotency ensures previously processed events are ignored safely without double-charging or double-crediting.
