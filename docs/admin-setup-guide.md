# Admin Authentication Setup Guide

## Overview
This guide walks you through setting up the admin authentication system for Cedar Elevators. The application already has all the authentication utilities and UI components - we just need to configure the database and environment variables.

## Prerequisites
- Access to your Supabase project dashboard (`https://hbkdbrxzqaraarivudej.supabase.co`)
- Admin access to your project settings

## Step 1: Get Supabase Service Role Key

1. Go to your Supabase project dashboard
2. Navigate to **Settings** → **API**
3. Scroll down to **Project API keys**
4. Copy the **service_role** key (⚠️ **Keep this secret!**)

## Step 2: Generate Admin Setup Key

A secure random setup key (you can use this or generate your own):
```
CEADM-2025-${generateRandomString(24)}
```

Example: `CEADM-2025-X7K9P2QM8R4N5T6W8Y3Z1A4B`

## Step 3: Update Environment Variables

Add these variables to your `.env` file:

```env
# Supabase Service Role Key (from Step 1)
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Admin Setup Key (from Step 2 - keep this secret!)
ADMIN_SETUP_KEY=CEADM-2025-X7K9P2QM8R4N5T6W8Y3Z1A4B
```

> **⚠️ IMPORTANT**: Never commit these keys to version control. Ensure `.env` is in your `.gitignore`.

## Step 4: Run Database Migration

### Option A: Using Supabase SQL Editor (Recommended)

1. Go to your Supabase dashboard
2. Navigate to **SQL Editor**
3. Click **New Query**
4. Copy and paste the entire contents of `supabase/migrations/001_create_admin_authentication.sql`
5. Click **Run** to execute the migration
6. Verify success - you should see "Success. No rows returned"

### Option B: Using Supabase CLI (if installed)

```bash
supabase db push
```

## Step 5: Verify Database Setup

Run these queries in the SQL Editor to verify:

```sql
-- Check tables were created
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('admin_settings', 'admin_profiles');

-- Should return 2 rows: admin_settings, admin_profiles

-- Verify RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('admin_settings', 'admin_profiles');

-- Both should show rowsecurity = true

-- Check initial settings row
SELECT * FROM admin_settings;

-- Should return 1 row with setup_completed = false
```

## Step 6: Create First Super Admin

1. Start your development server:
   ```bash
   pnpm dev
   ```

2. Navigate to the admin setup page:
   ```
   http://localhost:3000/admin/setup
   ```

3. Fill in the setup form:
   - **Setup Key**: The `ADMIN_SETUP_KEY` from your `.env` file
   - **Email**: Your admin email address
   - **Password**: A strong password (minimum 8 characters)
   - **Confirm Password**: Same as above

4. Click **Complete Setup**

5. **CRITICAL**: Save the recovery key that is displayed!
   - Click **Download Key** to save it as a text file
   - Or click **Copy Key** and save it in a password manager
   - **This key is shown only once and cannot be recovered!**

6. Click **Continue to Login**

## Step 7: Login to Admin Panel

1. You should be redirected to:
   ```
   http://localhost:3000/admin/login
   ```

2. Login with your super admin credentials

3. You should be redirected to the admin dashboard:
   ```
   http://localhost:3000/admin
   ```

## Step 8: Manage Additional Admin Users

Once logged in as super admin, you can:

1. Navigate to **Settings** → **Admin Users**
2. Click **Add Admin User**
3. Enter their email, assign a role, and create their account
4. New admins will need approval before they can access the system

## Role Hierarchy

- **Super Admin**: Full access to everything, including user management
- **Admin**: Full access except super admin settings
- **Manager**: Can manage products, orders, and customers
- **Staff**: Read-only access to most features

## Security Features

✅ **Row Level Security (RLS)**: Database-level access control  
✅ **Role-based Access Control**: Hierarchical permission system  
✅ **Approval Workflow**: New admins require approval  
✅ **Recovery Key**: Super admin account recovery mechanism  
✅ **Session Management**: Secure authentication with Supabase Auth  
✅ **Audit Trail**: Track who approved admins and when  

## Troubleshooting

### "Setup key is invalid"
- Verify `ADMIN_SETUP_KEY` in `.env` matches what you're entering
- Restart your dev server after changing environment variables

### "Failed to create admin profile"
- Check that the database migration ran successfully
- Verify RLS policies are enabled
- Ensure `SUPABASE_SERVICE_ROLE_KEY` is correct

### "Cannot access admin routes"
- Clear your browser cookies and try logging in again
- Check that your admin profile `is_active` is `true` in the database
- Verify you're using the correct email/password

### Environment variables not loading
- Make sure `.env` is in the root of your project
- Restart your development server
- Check for typos in variable names

## Next Steps

After setup is complete:

- [ ] Test the login/logout flow
- [ ] Create additional admin users
- [ ] Configure admin permissions as needed
- [ ] Set up your production environment variables
- [ ] Deploy to production

## Support

For issues or questions:
- Check the implementation plan: `implementation_plan.md`
- Review the admin utilities: `src/lib/admin-auth.ts`
- Inspect the login page: `src/app/admin/(auth)/login/page.tsx`
