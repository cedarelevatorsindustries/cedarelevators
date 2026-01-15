# RBAC System Setup Guide - Native Clerk + Supabase Integration

**🎉 Updated for 2025 - Uses Modern Native Integration (No Deprecated JWT Templates)**

This guide implements Role-Based Access Control (RBAC) using Clerk's native Supabase integration, which is more secure, faster, and officially supported.

## 🎯 Overview

The RBAC system supports 4 user types:
1. **Guest**: Unauthenticated users who can browse products only
2. **Individual**: Authenticated users who can place orders
3. **Business (Unverified)**: Authenticated business users who can place orders but need verification
4. **Business (Verified)**: Verified business users with access to bulk ordering and business features

## 📋 Prerequisites

- Node.js 18+ and pnpm installed
- Clerk account (https://clerk.com)
- Supabase account (https://supabase.com)

## 🚀 Step-by-Step Setup

### Step 1: Fix Clerk Loading Issue ✅

**Already Fixed!** The code updates include:
- ✅ Updated `layout.tsx` with `dynamic={true}` and explicit `publishableKey`
- ✅ Created `middleware.ts` for route protection
- ✅ Proper error handling

**Verify your `.env.local` has:**
```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

### Step 2: Customize Clerk Session Tokens (CRITICAL) 🔑

**This replaces the old JWT template approach.**

1. Go to **Clerk Dashboard** → Your Application
2. Navigate to **Customize Session Token** (search for it in settings)
3. Add custom claims in **JSON array format**:

```json
[
  {
    "app_metadata": {
      "provider": "clerk"
    }
  },
  {
    "aud": "authenticated"
  },
  {
    "email": "{{user.primary_email_address}}"
  },
  {
    "role": "authenticated"
  },
  {
    "user_metadata": {
      "account_type": "{{user.public_metadata.account_type}}",
      "verification_status": "{{user.public_metadata.verification_status}}",
      "business_name": "{{user.public_metadata.business_name}}"
    }
  }
]
```

4. **Save** the changes

**What this does:**
- Embeds user role and verification status directly in session tokens
- Makes data accessible to Supabase RLS via `auth.jwt() -> 'user_metadata'`
- No need for separate JWT templates or token fetching
- Automatic updates when metadata changes

### Step 3: Enable Native Integration in Clerk 🔗

1. Go to **Clerk Dashboard** → **Integrations**
2. Search for **"Supabase"**
3. Click **"Connect with Supabase"** or **"Activate"**
4. Note your Clerk domain:
   - If using custom domain: `https://clerk.cedarelevator.com`
   - If default: `https://[your-app].clerk.accounts.dev`

### Step 4: Configure Supabase Third-Party Provider 🔧

1. Go to **Supabase Dashboard** → Your Project
2. Navigate to **Authentication** → **Providers** → **Third-Party**
3. Click **"Add Integration"** → Select **"Clerk"**
4. Enter your **Clerk Domain**:
   ```
   https://clerk.cedarelevator.com
   ```
   (Use your actual domain from Step 3)
5. **Save** the integration

**What this does:**
- Supabase now trusts Clerk tokens automatically
- No need to share JWT secrets between platforms
- Automatic token validation via JWKS
- Better security and performance

### Step 5: Add Supabase Environment Variables 🔐

In your `.env.local`, add:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...
```

**Get these from:** Supabase Dashboard → Settings → API

### Step 6: Run Database Migration 💾

1. Open **Supabase SQL Editor**
2. Copy and paste the entire contents of:
   `/app/supabase/migrations/003_create_rbac_system.sql`
3. Click **"Run"**

**This creates:**
- `profiles` table (user roles and verification status)
- `verification_documents` table
- `orders` and `order_items` tables
- `products` table with 3 sample products
- **RLS policies** using native Clerk JWT structure
- **Helper functions** for accessing JWT claims

**Verify it worked:**
```sql
-- Should return 5 tables
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('profiles', 'verification_documents', 'orders', 'order_items', 'products');
```

### Step 7: Test the Integration 🧪

1. **Start the app:**
   ```bash
   pnpm dev
   ```

2. **Test as Guest:**
   - Open `http://localhost:3000`
   - Browse products (should work)
   - Try `/checkout` → Should redirect to sign-in ✅

3. **Test as Individual User:**
   - Sign up with Clerk
   - After sign-up, user metadata should be synced
   - Check browser console for successful profile sync
   - Should be able to view dashboard

4. **Verify JWT in Supabase:**
   Open Supabase SQL Editor and run:
   ```sql
   -- After logging in via Clerk, run this:
   SELECT 
     auth.jwt() ->> 'sub' as clerk_user_id,
     auth.jwt() -> 'user_metadata' ->> 'account_type' as role,
     auth.jwt() -> 'user_metadata' ->> 'verification_status' as status;
   ```
   
   Should show your Clerk user ID and metadata! ✅

## 🏗️ Architecture Overview

### Token Flow (Native Integration)
```
1. User signs in via Clerk
   ↓
2. Clerk generates standard session token with custom claims
   ↓
3. Frontend gets token via: await getToken()
   ↓
4. Token sent to Supabase in Authorization header
   ↓
5. Supabase validates via Clerk's JWKS endpoint
   ↓
6. RLS policies access claims via auth.jwt()
```

### Key Differences from Old Method

| Old (Deprecated) | New (Native Integration) |
|-----------------|-------------------------|
| JWT Templates | Session Token Customization |
| `getToken({ template: 'supabase' })` | `getToken()` (standard) |
| Share JWT secrets | No secrets shared |
| Slower (extra token fetch) | Faster (direct validation) |
| Manual JWKS setup | Auto JWKS via integration |
| Limited support | Fully supported |

## 🔍 Troubleshooting

### Issue: "Invalid JWT" or "Permission Denied"

**Solutions:**
1. Verify Session Token customization in Clerk Dashboard
2. Check custom claims are saved correctly
3. Ensure Supabase Third-Party integration is active
4. Test JWT in SQL:
   ```sql
   SELECT auth.jwt();  -- Should show your token with claims
   ```

### Issue: RLS Policies Blocking Requests

**Check:**
1. User is authenticated (check `auth.jwt() ->> 'sub'`)
2. Custom claims are present:
   ```sql
   SELECT auth.jwt() -> 'user_metadata';
   ```
3. Helper functions work:
   ```sql
   SELECT get_current_user_id();  -- Should return Clerk user ID
   SELECT get_user_role();  -- Should return 'individual' or 'business'
   ```

### Issue: Profile Not Creating

**Fix:**
1. After sign-up, profile should auto-create via `/api/profile` endpoint
2. Manually trigger sync:
   ```javascript
   await fetch('/api/profile', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({
       email: user.primaryEmailAddress.emailAddress,
       role: user.publicMetadata?.account_type || 'individual',
       business_name: user.publicMetadata?.business_name || null
     })
   })
   ```

### Issue: Clerk Loading Errors Still Occur

**Solutions:**
1. Clear browser cache completely
2. Restart dev server after env variable changes
3. Verify `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` is correct
4. Check custom domain is fully configured in Clerk Dashboard

## 🎨 How to Use in Your App

### Setting User Metadata (During Sign-Up)

When a user signs up, set their metadata:

```typescript
import { useSignUp } from '@clerk/nextjs'

const { signUp } = useSignUp()

// During sign-up flow
await signUp.update({
  publicMetadata: {
    account_type: 'business',  // or 'individual'
    verification_status: 'none',
    business_name: 'Acme Corp'
  }
})
```

### Accessing User Data in Components

```typescript
'use client'
import { useUser } from '@clerk/nextjs'

export default function MyComponent() {
  const { user } = useUser()
  
  const accountType = user?.publicMetadata?.account_type
  const isVerified = user?.publicMetadata?.verification_status === 'verified'
  
  return (
    <div>
      {accountType === 'business' && !isVerified && (
        <button>Submit Verification</button>
      )}
    </div>
  )
}
```

### Accessing User Data in RLS Policies

```sql
-- Check if user is business account
CREATE POLICY "Business users only"
  ON some_table
  FOR SELECT
  TO authenticated
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'account_type') = 'business'
  );

-- Check if user is verified business
CREATE POLICY "Verified businesses only"
  ON some_table
  FOR INSERT
  TO authenticated
  WITH CHECK (
    (auth.jwt() -> 'user_metadata' ->> 'account_type') = 'business' AND
    (auth.jwt() -> 'user_metadata' ->> 'verification_status') = 'verified'
  );
```

## 🔐 Security Best Practices

1. ✅ **Never disable RLS** - Always keep Row Level Security enabled
2. ✅ **Use server-side validation** - Don't trust client-side checks alone
3. ✅ **Validate file uploads** - Check type, size, scan for malware
4. ✅ **Rate limit API endpoints** - Prevent abuse
5. ✅ **Audit critical actions** - Log verification status changes
6. ✅ **Keep service role key secret** - Never expose to client

## 📚 Additional Resources

- [Clerk Native Integrations](https://clerk.com/docs/integrations/databases)
- [Supabase Third-Party Auth](https://supabase.com/docs/guides/auth/social-login/auth-clerk)
- [Clerk Session Token Customization](https://clerk.com/docs/backend-requests/making/custom-session-token)
- [Supabase RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)

## ✅ Deployment Checklist

Before going to production:

- [ ] Session token customization configured in Clerk
- [ ] Native integration enabled in both Clerk and Supabase
- [ ] All environment variables set in production
- [ ] Database migration run successfully
- [ ] RLS policies tested thoroughly
- [ ] File upload storage configured (Supabase Storage or S3)
- [ ] Rate limiting implemented
- [ ] Error monitoring set up
- [ ] User documentation created
- [ ] Admin verification workflow implemented

## 🎉 What's Better About Native Integration

1. **No JWT Templates** - Simpler setup, one less thing to manage
2. **Better Security** - No secret sharing between platforms
3. **Faster Performance** - Direct token validation, no extra fetches
4. **Future-Proof** - Official method with long-term support
5. **Auto JWKS** - Automatic key rotation handled by integration
6. **Easier Debugging** - Standard token structure, better error messages

---

**You're all set!** The native integration is now configured. Just run the migration, test the flow, and you're ready to go. 🚀
