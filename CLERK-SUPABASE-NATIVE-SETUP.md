# 🔧 Clerk + Supabase Native Integration Setup Guide

## Overview

Your Cedar Elevators application uses **TWO separate authentication systems**:

1. **Clerk Auth** → For store users (Individual, Business verified/unverified)
2. **Supabase Auth** → For Super Admin panel access only

This guide will help you properly configure the **Native Integration** between Clerk and Supabase for store users.

---

## ✅ What's Already Done

The code has been updated to use **Native Integration** (no JWT templates):
- ✅ `/app/src/lib/supabase/server.ts` - Uses `getToken()` without template
- ✅ Database migrations with RLS policies for native JWT structure
- ✅ Helper functions for accessing JWT claims
- ✅ Admin authentication completely separate (Supabase Auth)

---

## 🚀 Step-by-Step Configuration

### Step 1: Configure Clerk Session Token Customization

1. Go to **Clerk Dashboard** → https://dashboard.clerk.com
2. Select your application
3. Navigate to **Sessions** → **Customize session token** (or search for "session token" in settings)
4. Click **Edit** or **Configure**
5. Replace the entire content with this JSON array:

```json
{
  "aud": "authenticated",
  "email": "{{user.primary_email_address}}",
  "role": "authenticated",
  "app_metadata": {
    "provider": "clerk"
  },
  "user_metadata": {
    "account_type": "{{user.public_metadata.account_type}}",
    "verification_status": "{{user.public_metadata.verification_status}}",
    "business_name": "{{user.public_metadata.business_name}}"
  }
}
```

6. Click **Save** or **Apply Changes**

**What this does:**
- Embeds user role (`account_type`: individual/business) in the JWT token
- Includes verification status (none/pending/verified/rejected)
- Makes metadata accessible to Supabase RLS policies via `auth.jwt() -> 'user_metadata'`
- Automatic updates when user metadata changes in Clerk

---

### Step 2: Enable Native Integration in Clerk

1. In **Clerk Dashboard** → Navigate to **Integrations**
2. Search for **"Supabase"**
3. Click **"Add integration"** or **"Connect"**
4. You'll see your Clerk domain displayed (keep this for Step 3):
   - Format: `https://YOUR-APP-NAME.clerk.accounts.dev`
   - Or if using custom domain: `https://clerk.cedarelevator.com`
5. Click **Enable** or **Activate**

**Important:** Copy your Clerk domain - you'll need it in the next step!

---

### Step 3: Configure Supabase Third-Party Authentication

1. Go to **Supabase Dashboard** → https://supabase.com/dashboard
2. Select your Cedar Elevators project
3. Navigate to **Authentication** → **Providers**
4. Scroll down to **Third-Party Auth** section
5. Look for **Clerk** integration or click **Add New Provider**
6. Select **Clerk** from the list
7. Enter your **Clerk Issuer URL** (from Step 2):
   ```
   https://YOUR-APP-NAME.clerk.accounts.dev
   ```
   Or your custom domain:
   ```
   https://clerk.cedarelevator.com
   ```
8. Click **Save** or **Enable**

**What this does:**
- Supabase now trusts JWT tokens from Clerk
- Automatic token validation via Clerk's JWKS endpoint
- No need to share JWT secrets between platforms
- Better security and performance

---

### Step 4: Verify JWT Claims in Clerk Dashboard

Let's make sure the custom claims are being added correctly:

1. In **Clerk Dashboard**, go to **Users**
2. Create a test user or select an existing one
3. Click on the user to view details
4. Go to **Metadata** tab
5. Under **Public Metadata**, add:

```json
{
  "account_type": "individual",
  "verification_status": "none"
}
```

Or for business user:

```json
{
  "account_type": "business",
  "business_name": "Test Company Ltd",
  "verification_status": "pending"
}
```

6. Click **Save**

---

### Step 5: Test the Integration

#### 5.1 Start Your Application

```bash
cd /app
pnpm dev
```

#### 5.2 Test Sign-Up Flow

1. Open your app in browser: `http://localhost:3000`
2. Sign up as a new user (or sign in with test account)
3. After sign-up, the user should be automatically synced to Supabase
4. Check browser console - you should see: `✅ Role synced successfully to Supabase`

#### 5.3 Verify JWT Token in Supabase

1. Go to **Supabase Dashboard** → **SQL Editor**
2. Sign in to your app in another tab (to have an active session)
3. Run this query in SQL Editor:

```sql
-- Check if JWT is being parsed correctly
SELECT 
  auth.jwt() ->> 'sub' as clerk_user_id,
  auth.jwt() ->> 'email' as email,
  auth.jwt() ->> 'role' as role,
  auth.jwt() -> 'user_metadata' ->> 'account_type' as account_type,
  auth.jwt() -> 'user_metadata' ->> 'verification_status' as verification_status,
  auth.jwt() -> 'user_metadata' ->> 'business_name' as business_name;
```

**Expected Result:**
```
clerk_user_id    | user_2abc123xyz...
email            | testuser@example.com
role             | authenticated
account_type     | individual (or business)
verification_status | none (or pending/verified)
business_name    | null (or company name)
```

#### 5.4 Test RLS Policies

```sql
-- Test helper functions
SELECT get_current_user_id();        -- Should return your Clerk user ID
SELECT get_user_role();               -- Should return 'individual' or 'business'
SELECT get_verification_status();    -- Should return 'none', 'pending', or 'verified'

-- Test profile access
SELECT * FROM profiles WHERE user_id = get_current_user_id();
```

---

## 🔍 Troubleshooting

### Issue 1: "Invalid JWT" or "Permission Denied" in Supabase

**Possible Causes:**
- Session token customization not saved in Clerk
- Third-Party integration not enabled in Supabase
- Clerk domain mismatch between Clerk and Supabase settings

**Solutions:**
1. Double-check that session token customization is saved in Clerk Dashboard
2. Verify Third-Party integration is **Active** in Supabase
3. Ensure Clerk domain matches exactly (including https://)
4. Wait 5-10 minutes for changes to propagate
5. Sign out and sign back in to get a fresh token
6. Clear browser cache and cookies

---

### Issue 2: JWT Claims Not Appearing

**Possible Causes:**
- User metadata not set in Clerk
- Old session token cached

**Solutions:**
1. Check user's Public Metadata in Clerk Dashboard
2. Ensure `account_type` is set to 'individual' or 'business'
3. Sign out completely and sign back in
4. Run this in SQL Editor to check JWT structure:
```sql
SELECT auth.jwt();  -- Shows full JWT token with all claims
```

---

### Issue 3: RLS Policies Blocking Requests

**Possible Causes:**
- User not authenticated
- JWT claims missing
- Helper functions not working

**Solutions:**
1. Verify user is authenticated:
```sql
SELECT auth.jwt() ->> 'sub';  -- Should return user ID, not null
```

2. Check custom claims exist:
```sql
SELECT auth.jwt() -> 'user_metadata';  -- Should show account_type, etc.
```

3. Test helper functions:
```sql
SELECT get_current_user_id();      -- Should return Clerk user ID
SELECT is_authenticated();          -- Should return true
SELECT get_user_role();             -- Should return role
```

4. If helper functions return NULL, re-run the migration:
```sql
-- Re-run the helper functions from migration 003
-- Copy from /app/supabase/migrations/003_create_rbac_system.sql
```

---

### Issue 4: Admin Dashboard Can't Save to Supabase

**Possible Causes:**
- Mixing up Clerk auth with Supabase auth
- Admin trying to use Clerk tokens instead of Supabase auth

**Solutions:**
1. **IMPORTANT:** Admin panel uses **separate Supabase Auth**, NOT Clerk
2. Admin login is at `/admin/login` - uses email/password via Supabase
3. Store users use Clerk - completely separate system
4. Make sure you're logged in as admin via `/admin/login`, not Clerk
5. Check admin session:
```sql
-- Should return admin user ID from Supabase Auth (UUID format)
SELECT auth.uid();

-- Check admin profile
SELECT * FROM admin_profiles WHERE user_id = auth.uid();
```

6. If admin authentication isn't working, verify:
   - Admin setup completed at `/admin/setup`
   - Admin profile exists in `admin_profiles` table
   - Admin is marked as `is_active = true`

---

### Issue 5: Store Users Can't Access Their Data

**Possible Causes:**
- Profile not created in Supabase
- RLS policies too restrictive

**Solutions:**
1. Check if profile exists:
```sql
SELECT * FROM profiles WHERE user_id = 'user_xxx';  -- Replace with Clerk user ID
```

2. If profile doesn't exist, create it manually (or via API):
```sql
INSERT INTO profiles (user_id, email, role, verification_status)
VALUES ('user_xxx', 'test@example.com', 'individual', 'none');
```

3. Check RLS policies allow access:
```sql
-- This should work when logged in as that user
SELECT * FROM profiles WHERE user_id = get_current_user_id();
```

---

## 📋 Verification Checklist

Before considering the integration complete, verify:

- [ ] Session token customization saved in Clerk Dashboard
- [ ] Native integration enabled in Clerk → Integrations → Supabase
- [ ] Third-Party auth configured in Supabase → Authentication → Providers
- [ ] Clerk domain matches exactly in both platforms
- [ ] Test user has `account_type` in Public Metadata
- [ ] JWT token contains custom claims (run SQL query to verify)
- [ ] Helper functions work correctly (`get_current_user_id()`, etc.)
- [ ] User can access their own profile data
- [ ] Admin login works separately at `/admin/login`
- [ ] Admin can save data to Supabase (using Supabase Auth, not Clerk)

---

## 🎯 Key Differences: Native Integration vs JWT Templates

| Feature | Old (JWT Templates) | New (Native Integration) |
|---------|-------------------|------------------------|
| Token Method | `getToken({ template: 'supabase' })` | `getToken()` (standard) |
| Configuration | JWT template in Clerk | Session token customization |
| Secret Sharing | Required | Not required |
| Validation | Manual JWKS setup | Auto via Third-Party integration |
| Performance | Slower (extra fetch) | Faster (direct validation) |
| Support | Deprecated | Fully supported |
| Security | Good | Better (no secret sharing) |

---

## 🔐 Important Security Notes

1. **Two Separate Auth Systems:**
   - **Clerk** = Store users (shopping, orders, business verification)
   - **Supabase Auth** = Admin panel (Super Admin access only)
   - These are completely independent!

2. **Never Mix Auth Contexts:**
   - Store APIs should use `createClerkSupabaseClient()`
   - Admin APIs should use `createServerSupabase()`
   - Don't try to use Clerk tokens for admin operations

3. **RLS is Critical:**
   - Never disable Row Level Security (RLS)
   - Always test policies with actual user accounts
   - Use service role key only in server-side API routes

4. **Token Security:**
   - Clerk tokens are automatically validated by Supabase
   - No manual token verification needed in your code
   - Let RLS policies handle authorization

---

## 📚 Additional Resources

- [Clerk Session Token Customization](https://clerk.com/docs/backend-requests/making/custom-session-token)
- [Supabase Third-Party Auth](https://supabase.com/docs/guides/auth/social-login/auth-clerk)
- [Clerk Native Integrations](https://clerk.com/docs/integrations/databases/supabase)
- [Supabase RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)

---

## ✅ Post-Setup Testing

After completing all steps above, test these scenarios:

### Scenario 1: Individual User Flow
1. Sign up as individual user
2. Browse products
3. Add to cart
4. Place order
5. View order history
6. Verify data in Supabase `orders` and `profiles` tables

### Scenario 2: Business User Flow
1. Sign up as business user
2. Set `account_type = 'business'` in Public Metadata
3. Upload verification documents
4. Admin approves verification
5. User gets access to business features
6. Place bulk order

### Scenario 3: Admin Flow
1. Go to `/admin/login`
2. Login with Super Admin credentials (Supabase Auth)
3. View dashboard
4. Manage products, orders, customers
5. Approve business verification requests
6. Verify all data saves correctly to Supabase

---

## 🎉 Success Indicators

You'll know the integration is working correctly when:

1. ✅ Users can sign up/login via Clerk
2. ✅ User profiles automatically sync to Supabase
3. ✅ JWT query in SQL Editor returns user data with custom claims
4. ✅ Users can access their own data (orders, profiles)
5. ✅ RLS policies correctly restrict data access
6. ✅ Admin panel works independently with Supabase Auth
7. ✅ Admin can save changes (products, settings, etc.)
8. ✅ No "Invalid JWT" or "Permission Denied" errors

---

## 🆘 Still Having Issues?

If you've followed all steps and still experiencing issues:

1. **Check Browser Console:**
   - Look for authentication errors
   - Check network requests (401/403 errors?)
   - Verify JWT token is present in requests

2. **Check Server Logs:**
   - Look for Supabase connection errors
   - Check for RLS policy violations
   - Verify environment variables are loaded

3. **Verify Database State:**
   ```sql
   -- Check if RLS is enabled
   SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';
   
   -- Check existing policies
   SELECT schemaname, tablename, policyname FROM pg_policies WHERE schemaname = 'public';
   
   -- Test JWT parsing
   SELECT auth.jwt();
   ```

4. **Nuclear Reset (Last Resort):**
   - Clear all browser cookies and cache
   - Sign out from both Clerk and Supabase
   - Restart dev server
   - Sign in fresh and test again

---

**✨ The code is already updated! You just need to configure Clerk and Supabase dashboards following Steps 1-3 above.**

Good luck! 🚀
