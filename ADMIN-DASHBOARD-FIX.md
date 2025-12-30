# 🔧 Admin Dashboard - Unable to Save Data Fix

## Problem
Admin dashboard cannot save data to Supabase database.

## Root Cause Analysis

Your application has **TWO SEPARATE authentication systems**:

```
┌─────────────────────────────────────────┐
│  Cedar Elevators Application            │
├─────────────────────────────────────────┤
│                                         │
│  1. CLERK AUTH (Store Users)            │
│     - Individual users                  │
│     - Business users (verified/unverified) │
│     - Shopping, orders, cart            │
│     - JWT: account_type, verification   │
│                                         │
│  2. SUPABASE AUTH (Admin Panel)         │
│     - Super Admin only                  │
│     - Admin panel at /admin/*           │
│     - Manage products, orders, settings │
│     - Separate login: /admin/login      │
│                                         │
└─────────────────────────────────────────┘
```

The issue occurs when:
1. Clerk JWT template is not properly configured → Store users can't access their data
2. Admin is not properly authenticated via Supabase → Admin can't save changes

## ✅ Solution

### Part 1: Fix Clerk Integration (Store Users)

The code has been updated to use **Native Integration**. Now configure:

#### Step 1: Clerk Dashboard - Customize Session Token

1. Go to Clerk Dashboard → Your App → **Sessions** → **Customize session token**
2. Add this JSON:

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

3. Click **Save**

#### Step 2: Clerk Dashboard - Enable Supabase Integration

1. Go to **Integrations** → Search "Supabase"
2. Click **Add integration** → **Enable**
3. Note your Clerk domain (e.g., `https://your-app.clerk.accounts.dev`)

#### Step 3: Supabase Dashboard - Add Third-Party Auth

1. Go to Supabase Dashboard → **Authentication** → **Providers**
2. Scroll to **Third-Party Auth** → Select **Clerk**
3. Enter Clerk domain from Step 2
4. Click **Save**

**Wait 5-10 minutes for changes to propagate**

---

### Part 2: Fix Admin Authentication (Super Admin Panel)

The admin panel uses **Supabase Auth** (completely separate from Clerk).

#### Verify Admin Setup

1. **Check if setup is complete:**

Go to Supabase SQL Editor and run:

```sql
SELECT * FROM admin_settings;
```

Expected result:
```
setup_completed | true
recovery_key_hash | (some hash value)
```

2. **Check if admin profile exists:**

```sql
SELECT * FROM admin_profiles WHERE is_active = true;
```

Expected result:
```
user_id    | (UUID)
role       | super_admin
is_active  | true
```

#### If Setup NOT Complete

1. Go to: `http://localhost:3000/admin/setup`
2. Enter your admin setup key (from `.env` file: `ADMIN_SETUP_KEY`)
3. Create Super Admin account:
   - Email: your-admin@example.com
   - Password: (strong password)
4. **SAVE THE RECOVERY KEY** shown after setup
5. Click "Continue to Login"

#### If Admin Profile Exists But Can't Login

1. Verify admin is active:

```sql
UPDATE admin_profiles 
SET is_active = true 
WHERE role = 'super_admin';
```

2. Reset admin password (if forgotten):
   - Use recovery key at `/admin/recover`
   - Or create new admin via SQL:

```sql
-- First, create Supabase auth user
-- Then create admin profile linking to that user_id
INSERT INTO admin_profiles (user_id, role, is_active, approved_at)
VALUES ('your-supabase-user-uuid', 'super_admin', true, NOW());
```

---

## 🧪 Testing

### Test 1: Verify Admin Login

1. Go to: `http://localhost:3000/admin/login`
2. Login with Super Admin credentials
3. Should redirect to `/admin` dashboard
4. No errors in browser console

### Test 2: Test Admin Can Save Data

1. Login to admin panel
2. Go to: `/admin/products/create`
3. Create a test product
4. Click "Save"
5. Should save successfully without errors

### Test 3: Verify in Database

```sql
-- Check admin session
SELECT auth.uid() as admin_user_id;

-- Check admin profile
SELECT * FROM admin_profiles WHERE user_id = auth.uid();

-- Check admin can read data
SELECT * FROM products LIMIT 5;
```

### Test 4: Verify Store Users Can Access Data

1. Sign up/login as store user (via Clerk)
2. Browse products
3. Add to cart, place order
4. Check order in database:

```sql
-- Run while logged in as store user
SELECT 
  auth.jwt() ->> 'sub' as clerk_user_id,
  auth.jwt() -> 'user_metadata' ->> 'account_type' as role;

SELECT * FROM profiles WHERE user_id = get_current_user_id();
SELECT * FROM orders WHERE clerk_user_id = get_current_user_id();
```

---

## 🔍 Common Issues & Fixes

### Issue 1: "Permission Denied" When Admin Tries to Save

**Cause:** Admin not properly authenticated via Supabase Auth

**Fix:**
1. Make sure you're logged in at `/admin/login` (not using Clerk)
2. Check browser cookies - should have Supabase auth cookie
3. Verify admin profile is active:
```sql
SELECT * FROM admin_profiles WHERE user_id = auth.uid() AND is_active = true;
```

---

### Issue 2: "Invalid JWT" for Store Users

**Cause:** Clerk integration not configured

**Fix:**
1. Complete Steps 1-3 in Part 1 above
2. Sign out and sign back in to get fresh token
3. Verify JWT in SQL Editor:
```sql
SELECT auth.jwt() -> 'user_metadata';
```

---

### Issue 3: Admin Can Login But Can't Modify Settings

**Cause:** RLS policies restricting access based on role

**Fix:**
1. Check admin role:
```sql
SELECT role FROM admin_profiles WHERE user_id = auth.uid();
```

2. Ensure role is `super_admin` for full access:
```sql
UPDATE admin_profiles 
SET role = 'super_admin' 
WHERE user_id = auth.uid();
```

---

### Issue 4: Changes Don't Persist After Reload

**Cause:** Using wrong Supabase client or not committing changes

**Fix:**
1. Admin operations should use `createServerSupabase()` from `/app/src/lib/supabase/server.ts`
2. Store user operations should use `createClerkSupabaseClient()`
3. Check server logs for errors
4. Verify environment variables:
```bash
SUPABASE_SERVICE_ROLE_KEY=eyJ...  # Must be set for admin operations
```

---

## 📋 Quick Diagnostic Checklist

Run these queries to diagnose issues:

```sql
-- 1. Check RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
-- All should show rowsecurity = true

-- 2. Check admin authentication
SELECT auth.uid() as current_user_id;
-- Should return UUID if logged in as admin

-- 3. Check admin profile
SELECT user_id, role, is_active 
FROM admin_profiles 
WHERE user_id = auth.uid();
-- Should return: super_admin, true

-- 4. Test admin can read products
SELECT id, name FROM products LIMIT 3;
-- Should return products without error

-- 5. Test admin can insert (use with caution!)
-- INSERT INTO products (name, slug, sku) 
-- VALUES ('Test Product', 'test-product', 'TEST-001');
-- Should insert without permission error

-- 6. Check Clerk integration (when logged in as store user)
SELECT get_current_user_id();
-- Should return Clerk user ID (user_xxx format)

-- 7. Check store user can access own data
SELECT * FROM profiles WHERE user_id = get_current_user_id();
-- Should return user's profile
```

---

## 🎯 Success Criteria

Admin dashboard is working correctly when:

- ✅ Can login at `/admin/login` with email/password
- ✅ Dashboard loads without errors
- ✅ Can create/edit products
- ✅ Can save settings
- ✅ Can view orders and customers
- ✅ Can approve business verification requests
- ✅ Changes persist after page reload
- ✅ No "Permission Denied" or "Invalid JWT" errors

Store users can access data when:

- ✅ Can sign up/login via Clerk
- ✅ Can browse products
- ✅ Can place orders
- ✅ Can view order history
- ✅ JWT contains custom claims (account_type, verification_status)
- ✅ RLS policies allow access to own data

---

## 🆘 Emergency Reset

If everything is broken:

### Reset Admin Access

```sql
-- 1. Find admin user
SELECT * FROM auth.users WHERE email = 'your-admin@example.com';

-- 2. Ensure admin profile is active
UPDATE admin_profiles 
SET is_active = true, role = 'super_admin' 
WHERE user_id = 'admin-user-uuid-here';

-- 3. Clear admin_settings if needed
UPDATE admin_settings SET setup_completed = false;
-- Then redo setup at /admin/setup
```

### Reset Store User Integration

1. Clear all browser cookies
2. Sign out from Clerk
3. Reconfigure Clerk session token (Part 1, Step 1)
4. Wait 10 minutes
5. Sign in fresh

---

## 📞 Need More Help?

See the comprehensive setup guide: `/app/CLERK-SUPABASE-NATIVE-SETUP.md`

Key sections:
- Troubleshooting (detailed solutions)
- Verification Checklist (step-by-step testing)
- Additional Resources (official documentation)
