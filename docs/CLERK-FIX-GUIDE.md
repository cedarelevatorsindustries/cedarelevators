# 🔧 Clerk Loading Error - Quick Fix Guide

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

The error occurs because Clerk is trying to load from your custom domain `clerk.cedarelevator.com`, but there's a configuration issue. This can happen due to:

1. Custom domain not fully configured in Clerk Dashboard
2. DNS CNAME record not pointing correctly
3. Missing or incorrect environment variables
4. Clerk frontend API not properly set

## ✅ Quick Fix (Already Applied)

I've already fixed the issue in your code by:

1. **Updated `/app/src/app/layout.tsx`**:
   - Added `dynamic={true}` prop to ClerkProvider
   - Added explicit `publishableKey` prop
   - This allows Clerk to auto-detect the correct domain

2. **Created `/app/middleware.ts`**:
   - Implements proper route protection
   - Protects `/checkout` routes (requires authentication)
   - Allows public routes like products, sign-in, sign-up

3. **Created `.env.example`**:
   - Shows required environment variables
   - Documents custom domain configuration

## 🚀 What You Need to Do

### Step 1: Verify Your Environment Variables

Check your `.env.local` file has these variables:

```bash
# Required - Get from Clerk Dashboard
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Optional - Only if using custom domain
# NEXT_PUBLIC_CLERK_FRONTEND_API=clerk.cedarelevator.com
```

**Important**: If you're using a custom domain, make sure:
- The custom domain is fully configured in Clerk Dashboard → Domains
- DNS CNAME record points to Clerk's servers
- SSL certificate is active

### Step 2: Configure Custom Domain in Clerk (If Using)

1. Go to **Clerk Dashboard** → Your Application
2. Navigate to **Domains** in sidebar
3. Click **Add domain**
4. Enter: `clerk.cedarelevator.com`
5. Follow Clerk's instructions to:
   - Add DNS CNAME record
   - Verify domain ownership
   - Wait for SSL certificate provisioning (can take up to 24 hours)

6. Once verified, add to `.env.local`:
   ```bash
   NEXT_PUBLIC_CLERK_FRONTEND_API=clerk.cedarelevator.com
   ```

### Step 3: Restart Development Server

After updating environment variables:

```bash
# Stop the current server (Ctrl+C)
# Then restart
pnpm dev
```

**Important**: Next.js only reads `.env.local` on server start, so you MUST restart after changes.

### Step 4: Clear Browser Cache

The old Clerk script might be cached:

1. Open DevTools (F12)
2. Go to **Application** tab (Chrome) or **Storage** tab (Firefox)
3. Click **Clear storage** or **Clear site data**
4. Refresh the page (Cmd/Ctrl + Shift + R for hard refresh)

## 🔍 Verify the Fix

### Test 1: Check Clerk Loads Successfully

1. Open your app in browser
2. Open DevTools Console (F12 → Console tab)
3. You should see Clerk loading without errors
4. Check Network tab - look for successful Clerk script loads

### Test 2: Test Authentication

1. Click "Sign In" button
2. Clerk sign-in modal should open smoothly
3. Sign in with test credentials
4. Should redirect to dashboard without errors

### Test 3: Check Middleware Protection

1. While logged out, try to access: `http://localhost:3000/checkout`
2. Should redirect to sign-in page
3. Sign in, then access `/checkout` again
4. Should now allow access

## 🐛 Still Having Issues?

### Issue: Still seeing loading errors

**Try these in order:**

1. **Double-check environment variables**:
   ```bash
   # In terminal, check if variables are set
   node -e "console.log(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY)"
   ```
   - If it returns `undefined`, your `.env.local` is not loaded
   - Make sure file is named exactly `.env.local` (not `.env.local.txt`)
   - Make sure it's in the root directory `/app/.env.local`

2. **Remove custom domain temporarily**:
   - Comment out or remove `NEXT_PUBLIC_CLERK_FRONTEND_API` from `.env.local`
   - Restart server
   - This will use Clerk's default domain

3. **Check Clerk Dashboard status**:
   - Go to Clerk Dashboard → Status
   - Make sure there are no ongoing incidents
   - Check your app's status

4. **Verify publishable key**:
   - Go to Clerk Dashboard → API Keys
   - Copy the **Publishable Key** (starts with `pk_test_` or `pk_live_`)
   - Make sure it matches exactly in `.env.local`
   - **Common mistake**: Copying "Secret Key" instead of "Publishable Key"

### Issue: Middleware not protecting routes

**Check these:**

1. Make sure `/app/middleware.ts` exists (I created it)
2. Restart dev server
3. Clear Next.js cache:
   ```bash
   rm -rf .next
   pnpm dev
   ```

### Issue: "Clerk is not defined" error

**Solution:**
1. The `dynamic={true}` prop should fix this
2. If not, try updating Clerk packages:
   ```bash
   pnpm update @clerk/nextjs
   ```

## 📋 Custom Domain Setup Checklist

If you want to use `clerk.cedarelevator.com`:

- [ ] Domain added in Clerk Dashboard
- [ ] DNS CNAME record created: `clerk.cedarelevator.com` → `clerk.prod.accounts.dev`
- [ ] DNS propagated (check with `nslookup clerk.cedarelevator.com`)
- [ ] SSL certificate active in Clerk Dashboard
- [ ] Environment variable `NEXT_PUBLIC_CLERK_FRONTEND_API` set
- [ ] Dev server restarted
- [ ] Browser cache cleared
- [ ] Test authentication flow works

## 🎯 Recommended Approach for Development

For development and testing, I recommend **NOT using custom domain**:

1. Use Clerk's default domain (automatic with the fix I applied)
2. Only set these in `.env.local`:
   ```bash
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
   CLERK_SECRET_KEY=sk_test_...
   ```
3. Configure custom domain only for production deployment

## ✅ Summary of Changes Made

1. ✅ Fixed `layout.tsx` - Added `dynamic={true}` and explicit `publishableKey`
2. ✅ Created `middleware.ts` - Route protection with Clerk
3. ✅ Created `.env.example` - Documentation for env variables
4. ✅ Created comprehensive RBAC setup guide
5. ✅ Created this quick fix guide

## 🆘 Emergency Fallback

If nothing works, try this minimal configuration:

1. Create a fresh `.env.local`:
   ```bash
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
   CLERK_SECRET_KEY=sk_test_your_secret_here
   ```

2. Temporarily disable custom domain in Clerk Dashboard

3. Restart everything:
   ```bash
   rm -rf .next node_modules pnpm-lock.yaml
   pnpm install
   pnpm dev
   ```

4. Test basic sign-in flow

5. Once working, gradually add back other configurations

## 📞 Next Steps

1. Follow the steps above to verify the fix
2. Once Clerk loads successfully, proceed with JWT template setup (see RBAC-SETUP-GUIDE.md)
3. Run database migrations
4. Test the complete RBAC system

---

**Note**: The code fixes are already applied. You just need to verify your environment variables and optionally configure the custom domain in Clerk Dashboard.
