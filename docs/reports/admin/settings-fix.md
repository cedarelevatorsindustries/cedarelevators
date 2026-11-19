# 🔧 Admin Settings - Save Issue Fix

## Problem
When you configure settings in the Admin Settings page and click "Save Changes", nothing happens - no button feedback, no error messages, no data saving.

## Root Cause
The **`store_settings` table does not exist in the database**. The code is trying to save data to a table that was never created.

## ✅ Solution

### Step 1: Run the Migration Script

1. Go to **Supabase Dashboard** → Your Project
2. Navigate to **SQL Editor**
3. Click **New Query**
4. Copy the entire contents of `/app/supabase/migrations/010_create_store_settings.sql`
5. Paste into the SQL Editor
6. Click **Run**

**Expected Result:** "Success. No rows returned" or "1 row affected"

### Step 2: Verify the Table Was Created

Run this query in SQL Editor:

```sql
-- Check if table exists
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'store_settings';

-- Should return 1 row: store_settings
```

### Step 3: Verify RLS Policies

```sql
-- Check RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'store_settings';

-- Should show: rowsecurity = true
```

### Step 4: Check Default Data

```sql
-- View default settings
SELECT * FROM store_settings;

-- Should return 1 row with default Cedar Elevators data
```

### Step 5: Test the Admin Settings Page

1. Restart your dev server (important!):
   ```bash
   cd /app
   pnpm dev
   ```

2. Go to Admin Panel: `http://localhost:3000/admin/login`
3. Login with your Super Admin credentials
4. Navigate to **Settings** → **Store & Branding**
5. Modify any field (e.g., Store Name)
6. Click **"Save Changes"**

**Expected Behavior:**
- Button shows "Saving..." while processing
- Success toast appears: "Store settings updated successfully"
- Data persists after page reload

---

## 🧪 Troubleshooting

### Issue 1: "Failed to load store settings"

**Check:**
```sql
-- Is there a row in the table?
SELECT COUNT(*) FROM store_settings;
-- Should return 1
```

**Fix:**
```sql
-- Insert default row if missing
INSERT INTO store_settings (
    store_name, invoice_prefix, currency, timezone
) VALUES (
    'Cedar Elevators', 'CE', 'INR', 'Asia/Kolkata'
) ON CONFLICT (singleton_guard) DO NOTHING;
```

---

### Issue 2: "Failed to update settings" or "Permission Denied"

**Check Admin Session:**
```sql
-- Are you logged in as admin?
SELECT auth.uid();
-- Should return a UUID (not null)

-- Check your admin profile
SELECT user_id, role, is_active 
FROM admin_profiles 
WHERE user_id = auth.uid();
-- Should show: role = super_admin, is_active = true
```

**Fix:**
```sql
-- Activate your admin profile
UPDATE admin_profiles 
SET is_active = true 
WHERE user_id = auth.uid();
```

---

### Issue 3: Button Doesn't Change to "Saving..."

**Possible Cause:** Browser console might have JavaScript errors

**Check:**
1. Open browser DevTools (F12)
2. Go to **Console** tab
3. Look for red errors
4. Check **Network** tab when clicking Save
5. Look for failed API requests (red color)

**Common Fixes:**
- Clear browser cache (Ctrl+Shift+R)
- Restart dev server
- Check if `toast` from `sonner` is working

---

### Issue 4: Data Doesn't Persist After Reload

**Check RLS Policy:**
```sql
-- Test if you can update
UPDATE store_settings 
SET store_name = 'Test Store' 
WHERE singleton_guard = true 
RETURNING *;

-- Should return the updated row
-- If error "new row violates row-level security policy", RLS is blocking you
```

**Fix:**
```sql
-- Verify service role policy exists
SELECT policyname 
FROM pg_policies 
WHERE tablename = 'store_settings' 
AND policyname = 'Service role has full access to store_settings';

-- If missing, run the migration script again
```

---

### Issue 5: "Settings not loaded" Toast

**This means the initial `getStoreSettings()` call failed.**

**Check:**
```sql
-- Can you read the settings?
SELECT * FROM store_settings;
```

**Debug Steps:**
1. Check browser console for error messages
2. Look at Network tab → Find the request to `/api/...`
3. Check the response status code
4. If 401/403 → Authentication issue
5. If 500 → Server error, check terminal logs

---

## 🔍 Testing Checklist

After running the migration, verify:

- [ ] Table `store_settings` exists in database
- [ ] Default row with Cedar Elevators data exists
- [ ] RLS is enabled on the table
- [ ] RLS policies allow admin access
- [ ] Admin is logged in (check `auth.uid()` returns UUID)
- [ ] Admin profile is active and has correct role
- [ ] Settings page loads without errors
- [ ] Form shows current settings values
- [ ] Button changes to "Saving..." when clicked
- [ ] Success toast appears after save
- [ ] Data persists after page reload
- [ ] Browser console has no errors

---

## 💡 Why This Happened

The migration file `007_create_settings_tables.sql` created these tables:
- ✅ `payment_settings`
- ✅ `tax_settings`
- ✅ `shipping_settings`
- ✅ `system_settings`

But it was **missing**:
- ❌ `store_settings`

The frontend code in `/app/src/modules/admin/settings/store-settings-form.tsx` was calling:
- `getStoreSettings()` → Tries to read from `store_settings` table
- `updateStoreSettings()` → Tries to write to `store_settings` table

Since the table didn't exist, the queries failed silently, and no error feedback was shown to the user.

---

## 📋 Quick Fix Summary

1. **Run Migration:** Copy `/app/supabase/migrations/010_create_store_settings.sql` into Supabase SQL Editor and execute
2. **Verify:** Run `SELECT * FROM store_settings;` to confirm table exists with default data
3. **Restart:** Restart your dev server (`pnpm dev`)
4. **Test:** Login to admin panel, go to Settings → Store & Branding, make changes, click Save

**That's it!** The settings page should now work perfectly. 🎉

---

## 🎯 Other Settings Pages

The same pattern applies to all settings pages:

| Setting Page | Table | Status |
|-------------|-------|--------|
| Store & Branding | `store_settings` | ✅ Fixed (new migration) |
| Pricing Rules | `pricing_rules` or similar | ❓ Check if exists |
| Payment Settings | `payment_settings` | ✅ Exists |
| Tax (GST) Settings | `tax_settings` | ✅ Exists |
| Shipping Settings | `shipping_settings` | ✅ Exists |
| Admin Users | `admin_profiles` | ✅ Exists |
| System Settings | `system_settings` | ✅ Exists |

If other settings pages have the same issue, check if their tables exist:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
    'store_settings',
    'payment_settings',
    'tax_settings',
    'shipping_settings',
    'system_settings',
    'pricing_rules'
);
```

---

## 🆘 Still Not Working?

1. **Check Server Logs:** Look at your terminal where `pnpm dev` is running
2. **Check Browser Console:** Look for error messages (F12 → Console tab)
3. **Check Network Tab:** Look for failed API requests (F12 → Network tab)
4. **Check Admin Session:**
   ```sql
   SELECT auth.uid(), auth.role();
   ```
5. **Check Admin Profile:**
   ```sql
   SELECT * FROM admin_profiles WHERE user_id = auth.uid();
   ```

If all else fails, see `/app/ADMIN-DASHBOARD-FIX.md` for comprehensive troubleshooting.
