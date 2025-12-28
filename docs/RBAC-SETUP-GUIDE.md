# RBAC System Setup Guide

This guide will help you set up the Role-Based Access Control (RBAC) system with Clerk + Supabase integration for Cedar Elevators.

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

### Step 1: Fix Clerk Loading Issue

The Clerk loading errors occur due to custom domain configuration. To fix this:

#### Option A: Use Custom Domain (If Already Configured)

1. Go to Clerk Dashboard → **Domains**
2. Verify that `clerk.cedarelevator.com` is properly configured
3. Ensure DNS CNAME record points to Clerk's servers
4. Add to your `.env.local`:
   ```bash
   NEXT_PUBLIC_CLERK_FRONTEND_API=clerk.cedarelevator.com
   ```

#### Option B: Use Default Clerk Domain (Recommended for Testing)

1. Remove any custom domain configuration from your code
2. The updated `layout.tsx` now includes `dynamic={true}` which fixes the loading issue
3. Ensure you have in `.env.local`:
   ```bash
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
   CLERK_SECRET_KEY=sk_test_...
   ```

### Step 2: Configure Clerk JWT Template

This is **CRITICAL** for Supabase RLS to work with Clerk authentication.

1. Go to **Clerk Dashboard** → Your Application
2. Navigate to **JWT Templates** in the left sidebar
3. Click **+ New template**
4. Select **Supabase** from the template list
5. Set **Template Name**: `supabase` (exactly this - it's hardcoded in the integration)

6. Configure the JWT claims:
   ```json
   {
     "aud": "authenticated",
     "exp": "{{user.session_expires_at}}",
     "iat": "{{user.session_created_at}}",
     "iss": "{{clerk.frontend_api}}",
     "sub": "{{user.id}}",
     "email": "{{user.primary_email_address}}",
     "role": "{{user.public_metadata.role}}",
     "verification_status": "{{user.public_metadata.verification_status}}",
     "business_name": "{{user.public_metadata.business_name}}",
     "app_metadata": {
       "provider": "clerk"
     },
     "user_metadata": {
       "role": "{{user.public_metadata.role}}",
       "verification_status": "{{user.public_metadata.verification_status}}"
     }
   }
   ```

7. Set **Token Lifetime**: 3600 seconds (1 hour)
8. Click **Save**

### Step 3: Configure Supabase

1. Go to **Supabase Dashboard** → Your Project
2. Navigate to **Settings** → **API**
3. Copy the following values to `.env.local`:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
   SUPABASE_SERVICE_ROLE_KEY=eyJxxx...
   ```

4. Navigate to **Authentication** → **Providers**
5. Scroll down to **Custom Access Token** (JWT)
6. Enable it and configure:
   - **JWT Secret**: Get this from Clerk Dashboard → **API Keys** → Show **JWT Verification Key**
   - **JWKS URL**: `https://[your-clerk-domain].clerk.accounts.dev/.well-known/jwks.json`

### Step 4: Run Database Migrations

1. Open Supabase **SQL Editor**
2. Run the migration file: `/app/supabase/migrations/003_create_rbac_system.sql`
3. This creates:
   - `profiles` table
   - `verification_documents` table
   - `orders` and `order_items` tables
   - `products` table
   - RLS policies
   - Helper functions for JWT claims

4. Verify tables were created:
   ```sql
   SELECT table_name 
   FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name IN ('profiles', 'verification_documents', 'orders', 'order_items', 'products');
   ```

### Step 5: Install Dependencies and Run

1. Install dependencies:
   ```bash
   cd /path/to/project
   pnpm install
   ```

2. Start development server:
   ```bash
   pnpm dev
   ```

3. Open http://localhost:3000

## 🧪 Testing the RBAC System

### Test 1: Guest User
1. Open the app without signing in
2. Browse products (should work)
3. Try to access `/checkout` → Should redirect to sign-in

### Test 2: Individual User
1. Sign up as an individual user
2. Complete profile creation
3. Should be able to place orders
4. No verification options should appear

### Test 3: Business User (Unverified)
1. Sign up as a business user
2. Complete profile with business name
3. Dashboard should show "Submit Verification Documents" button
4. Upload verification documents
5. Status should change to "Pending"

### Test 4: Business User (Verified)
1. Manually update verification status in Supabase:
   ```sql
   UPDATE profiles 
   SET verification_status = 'verified' 
   WHERE user_id = 'user_xxx';
   ```
2. Refresh dashboard
3. Should see "Verified Business Badge"
4. Additional features should be visible

## 🔍 Troubleshooting

### Clerk Loading Errors Persist

**Symptom**: Still seeing "Failed to load Clerk" errors

**Solutions**:
1. Clear browser cache and cookies
2. Check if `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` is set in `.env.local`
3. Restart dev server after changing env variables
4. Check browser console for specific error messages
5. Verify custom domain DNS settings (if using custom domain)

### RLS Policies Blocking Requests

**Symptom**: Getting "permission denied" errors from Supabase

**Solutions**:
1. Verify JWT template is named exactly `supabase` in Clerk
2. Check JWT is being passed correctly:
   ```typescript
   // In browser console
   const { getToken } = await auth()
   const token = await getToken({ template: 'supabase' })
   console.log(token) // Should show JWT with claims
   ```
3. Test JWT helper functions in Supabase SQL Editor:
   ```sql
   -- This should return your user ID if JWT is working
   SELECT get_current_user_id();
   ```

### Profile Not Creating Automatically

**Symptom**: User signed in but no profile in database

**Solutions**:
1. Check `/api/profile` endpoint is working
2. Manually sync profile by calling:
   ```javascript
   await fetch('/api/profile', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({
       email: user.email,
       role: 'individual',
       business_name: null
     })
   })
   ```

### Verification Documents Not Uploading

**Symptom**: Document upload fails

**Solutions**:
1. Check file size (should be < 5MB)
2. Check file format (PDF, JPG, PNG only)
3. For production, implement proper file storage (Supabase Storage or AWS S3)
4. Current implementation uses data URLs for demo purposes

## 📁 File Structure

```
/app/
├── middleware.ts                              # Route protection
├── supabase/migrations/
│   └── 003_create_rbac_system.sql            # Database schema
├── src/
│   ├── app/
│   │   ├── layout.tsx                        # Updated with Clerk fix
│   │   └── api/
│   │       ├── profile/route.ts              # Profile sync endpoint
│   │       └── verification-documents/route.ts # Document upload endpoint
│   ├── components/
│   │   └── dashboard/
│   │       ├── user-dashboard.tsx            # Main dashboard component
│   │       └── verification-upload.tsx       # Document upload modal
│   └── lib/
│       └── supabase/
│           └── server.ts                     # Clerk + Supabase integration
└── .env.example                               # Environment variables template
```

## 🔐 Security Considerations

1. **Never expose service role key** - Only use on server-side
2. **Always validate user input** - Both client and server side
3. **Use RLS policies** - Never disable RLS in production
4. **Implement rate limiting** - For API endpoints
5. **Validate file uploads** - Check file type, size, and scan for malware
6. **Audit verification** - Log all verification status changes

## 🎨 Customization

### Adding New User Roles

1. Update profile table enum:
   ```sql
   ALTER TABLE profiles 
   DROP CONSTRAINT profiles_role_check;
   
   ALTER TABLE profiles 
   ADD CONSTRAINT profiles_role_check 
   CHECK (role IN ('individual', 'business', 'enterprise'));
   ```

2. Update RLS policies accordingly
3. Update TypeScript types in components

### Custom Verification Flow

1. Modify `verification_documents` table to add custom fields
2. Update upload component with additional form fields
3. Implement admin approval workflow in admin panel

## 📚 Additional Resources

- [Clerk Documentation](https://clerk.com/docs)
- [Supabase RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Clerk + Supabase Integration](https://clerk.com/docs/integrations/databases/supabase)
- [Next.js Middleware](https://nextjs.org/docs/app/building-your-application/routing/middleware)

## ✅ Checklist

Before deploying to production:

- [ ] Clerk JWT template configured correctly
- [ ] All environment variables set in production
- [ ] Database migrations run successfully
- [ ] RLS policies tested thoroughly
- [ ] File upload storage configured (not using data URLs)
- [ ] Rate limiting implemented on API routes
- [ ] Error logging and monitoring set up
- [ ] Security audit completed
- [ ] User documentation created
- [ ] Admin verification workflow implemented

## 🆘 Support

If you encounter any issues:
1. Check this guide's troubleshooting section
2. Review the error logs in browser console and server logs
3. Verify all environment variables are set correctly
4. Test each component individually
5. Check Supabase logs for RLS policy violations
