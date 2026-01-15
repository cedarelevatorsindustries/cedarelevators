# 🔧 Clerk Loading Error - Quick Fix Guide (2025 Native Integration)

## Problem

You're seeing these errors in the Next.js console:

```
ClerkRuntimeError: Clerk: Failed to load Clerk, failed to load script: 
https://clerk.cedarelevator.com/npm/@clerk/clerk-js@5/dist/clerk.browser.js
(code="failed_to_load_clerk_js")

ClerkRuntimeError: Clerk: Failed to load Clerk
(code="failed_to_load_clerk_js_timeout")
```

## Root Cause

The error occurs because Clerk is trying to load from your custom domain `clerk.cedarelevator.com`, but there's a configuration issue. Common causes:

1. Custom domain not fully configured in Clerk Dashboard
2. DNS CNAME record not pointing correctly
3. Missing or incorrect environment variables
4. SSL certificate not provisioned yet

## ✅ Quick Fix (Already Applied)

I've already fixed the issue in your code:

1. **Updated `/app/src/app/layout.tsx`**:
   - Added `dynamic={true}` prop to ClerkProvider
   - Added explicit `publishableKey` prop
   - Allows Clerk to auto-detect the correct domain

2. **Created `/app/middleware.ts`**:
   - Implements proper route protection
   - Protects `/checkout` routes (requires authentication)
   - Allows public routes

3. **Updated `/app/src/lib/supabase/server.ts`**:
   - Uses native integration (no JWT templates)
   - Standard `getToken()` instead of deprecated template method
   - Faster and more secure

## 🚀 What You Need to Do

### Step 1: Verify Environment Variables

Check your `.env.local` file has these variables:

```bash
# Required - Get from Clerk Dashboard → API Keys
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Supabase (Get from Supabase Dashboard → Settings → API)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...

# Optional - Only if using custom domain
# NEXT_PUBLIC_CLERK_FRONTEND_API=clerk.cedarelevator.com
```

**Common Mistakes:**
- ❌ Copying "Secret Key" instead of "Publishable Key"
- ❌ File named `.env.local.txt` instead of `.env.local`
- ❌ File in wrong directory (must be in `/app/.env.local`)
- ❌ Forgetting to restart server after changes

### Step 2: Configure Custom Domain (If Using)

**Option A: Use Custom Domain**

If you want `clerk.cedarelevator.com`:

1. Go to **Clerk Dashboard** → **Domains**
2. Click **"Add domain"**
3. Enter: `clerk.cedarelevator.com`
4. Follow instructions:
   - Add DNS CNAME record: `clerk.cedarelevator.com` → `clerk.prod.accounts.dev`
   - Wait for SSL certificate (can take up to 24 hours)
   - Verify domain ownership
5. Once verified, add to `.env.local`:
   ```bash
   NEXT_PUBLIC_CLERK_FRONTEND_API=clerk.cedarelevator.com
   ```

**Option B: Use Default Domain (Recommended for Development)**

Just use Clerk's default domain - no extra setup needed!

1. **Don't** add `NEXT_PUBLIC_CLERK_FRONTEND_API` to `.env.local`
2. Clerk will automatically use: `[your-app].clerk.accounts.dev`
3. Works immediately, no DNS wait time

### Step 3: Set Up Native Supabase Integration (No JWT Templates!)

**This is the NEW way - official and supported:**

#### 3.1 Configure Session Tokens in Clerk

1. Go to **Clerk Dashboard** → **Customize Session Token**
2. Add custom claims:

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

3. **Save**

#### 3.2 Enable Native Integration

1. Go to **Clerk Dashboard** → **Integrations**
2. Search for **"Supabase"**
3. Click **"Activate"**
4. Note your Clerk domain

#### 3.3 Configure Supabase

1. Go to **Supabase Dashboard** → **Authentication** → **Providers** → **Third-Party**
2. Click **"Add Integration"** → **"Clerk"**
3. Enter Clerk domain: `https://clerk.cedarelevator.com`
4. **Save**

### Step 4: Restart Development Server

**CRITICAL:** Next.js only reads `.env.local` on startup!

```bash
# Stop the server (Ctrl+C)

# Restart
pnpm dev
```

### Step 5: Clear Browser Cache

Old Clerk scripts might be cached:

1. Open DevTools (F12)
2. Go to **Application** tab → **Storage**
3. Click **"Clear site data"**
4. Hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)

## 🔍 Verify the Fix

### Test 1: Check Clerk Loads

1. Open app in browser
2. Open DevTools Console (F12)
3. Should see NO Clerk loading errors
4. Check Network tab - look for successful Clerk script loads

### Test 2: Sign In Flow

1. Click "Sign In"
2. Clerk modal should open smoothly
3. Sign in with test account
4. Should redirect without errors

### Test 3: Token Validation

After signing in, run in Supabase SQL Editor:

```sql
-- Should show your Clerk user ID
SELECT auth.jwt() ->> 'sub' as user_id;

-- Should show custom metadata
SELECT auth.jwt() -> 'user_metadata' as metadata;
```

## 🐛 Still Having Issues?

### Issue: Clerk still not loading

**Try these in order:**

1. **Verify publishable key:**
   ```bash
   # In terminal
   node -e "console.log(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY)"
   ```
   - Should output your key (starting with `pk_test_` or `pk_live_`)
   - If `undefined`, check `.env.local` exists and is in the right location

2. **Check Clerk Dashboard status:**
   - Go to Clerk Dashboard → Status page
   - Verify no ongoing incidents

3. **Temporarily remove custom domain:**
   - Comment out `NEXT_PUBLIC_CLERK_FRONTEND_API` in `.env.local`
   - Restart server
   - This uses Clerk's default domain

4. **Clear everything:**
   ```bash
   rm -rf .next node_modules
   pnpm install
   pnpm dev
   ```

### Issue: "Invalid JWT" in Supabase

**Cause:** Native integration not configured

**Fix:**
1. Verify Session Token customization in Clerk
2. Check Third-Party integration in Supabase
3. Ensure Clerk domain matches exactly
4. Wait 5-10 minutes for propagation
5. Sign out and sign back in

### Issue: RLS policies not working

**Cause:** JWT structure changed with native integration

**Fix:**
1. Run updated migration: `/app/supabase/migrations/003_create_rbac_system.sql`
2. This updates helper functions to use `auth.jwt()`
3. Test: `SELECT get_current_user_id();` should return your user ID

## 📋 Custom Domain Setup Checklist

If using `clerk.cedarelevator.com`:

- [ ] Domain added in Clerk Dashboard
- [ ] DNS CNAME record created
- [ ] DNS propagated (test: `nslookup clerk.cedarelevator.com`)
- [ ] SSL certificate active (shows green lock in Clerk Dashboard)
- [ ] Environment variable `NEXT_PUBLIC_CLERK_FRONTEND_API` set
- [ ] Dev server restarted
- [ ] Browser cache cleared
- [ ] Sign-in flow tested

## 🎯 Recommended for Development

**Don't use custom domain for local development:**

1. Use Clerk's default domain (automatic)
2. Only set these in `.env.local`:
   ```bash
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
   CLERK_SECRET_KEY=sk_test_...
   ```
3. Add custom domain only in production

**Why?**
- Faster setup (no DNS wait)
- Easier debugging
- No SSL certificate issues
- Works immediately

## ✅ Summary of Fixes Applied

1. ✅ **layout.tsx** - Added `dynamic={true}` and explicit `publishableKey`
2. ✅ **middleware.ts** - Route protection for `/checkout`
3. ✅ **supabase/server.ts** - Uses native integration (no JWT templates)
4. ✅ **Migration SQL** - Updated RLS helper functions for native integration
5. ✅ **Documentation** - Complete native integration setup guide

## 🆘 Emergency Fallback

If nothing works:

1. Create minimal `.env.local`:
   ```bash
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
   CLERK_SECRET_KEY=sk_test_your_secret_here
   ```

2. Disable custom domain in Clerk Dashboard

3. Nuclear reset:
   ```bash
   rm -rf .next node_modules pnpm-lock.yaml
   pnpm install
   pnpm dev
   ```

4. Test basic sign-in

5. Once working, gradually add back other features

## 📞 Next Steps

1. ✅ Follow steps above to fix Clerk loading
2. ✅ Configure native Supabase integration
3. ✅ Run database migration
4. ✅ Test RBAC system

## 📚 Documentation

- **Native Integration Setup**: `/app/docs/RBAC-SETUP-GUIDE-NATIVE.md`
- **Migration from JWT Templates**: `/app/docs/MIGRATION-JWT-TO-NATIVE.md`
- **See also**: Clerk docs on native integrations

---

**Note:** All code fixes are applied. You just need to verify environment variables and configure the native integration. The new method is simpler, faster, and officially supported! 🚀
