# 🏗️ Cedar Elevators - Authentication Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                  CEDAR ELEVATORS APPLICATION                     │
│                      (Next.js + Supabase)                        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │
        ┌─────────────────────┴─────────────────────┐
        │                                           │
        ▼                                           ▼
┌───────────────────┐                   ┌──────────────────────┐
│   CLERK AUTH      │                   │   SUPABASE AUTH      │
│   (Store Users)   │                   │   (Admin Panel)      │
└───────────────────┘                   └──────────────────────┘
        │                                           │
        │                                           │
        ▼                                           ▼
┌───────────────────────────────────────┐   ┌──────────────────┐
│  User Types:                          │   │  Admin Roles:    │
│  • Individual                         │   │  • Super Admin   │
│  • Business (Unverified)              │   │  • Admin         │
│  • Business (Verified)                │   │  • Manager       │
│                                       │   │  • Staff         │
│  Routes:                              │   │                  │
│  • /                                  │   │  Routes:         │
│  • /products                          │   │  • /admin/*      │
│  • /checkout                          │   │  • /admin/login  │
│  • /sign-in                           │   │                  │
│  • /sign-up                           │   │  Login Method:   │
│                                       │   │  • Email + Pwd   │
│  Login Method:                        │   │  • Supabase Auth │
│  • Email, Social (Google, etc.)       │   │                  │
│  • Clerk handles authentication       │   │  Tables Used:    │
│                                       │   │  • admin_profiles│
│  Tables Used:                         │   │  • admin_settings│
│  • profiles                           │   │                  │
│  • orders                             │   └──────────────────┘
│  • order_items                        │
│  • verification_documents             │
│                                       │
└───────────────────────────────────────┘
        │
        │ Native Integration
        ▼
┌─────────────────────────────────────────────────┐
│           SUPABASE DATABASE                     │
│                                                 │
│  Authentication:                                │
│  • JWT validation via Clerk JWKS               │
│  • Third-Party integration enabled             │
│  • Row Level Security (RLS) policies           │
│                                                 │
│  Store User Access (via Clerk JWT):            │
│  • RLS uses: auth.jwt() ->> 'sub'             │
│  • Custom claims in user_metadata              │
│                                                 │
│  Admin Access (via Supabase Auth):             │
│  • RLS uses: auth.uid()                        │
│  • Role-based access control                   │
│                                                 │
└─────────────────────────────────────────────────┘
```

## Authentication Flow Comparison

### Store User Flow (Clerk Auth)

```
1. User visits store
   └─> Clicks "Sign Up" or "Sign In"
       └─> Clerk authentication modal opens
           └─> User enters credentials / uses social login
               └─> Clerk validates and creates session
                   └─> Clerk generates JWT with custom claims
                       └─> Frontend gets token: await getToken()
                           └─> Token sent to Supabase with API requests
                               └─> Supabase validates JWT via Clerk JWKS
                                   └─> RLS policies check user_metadata
                                       └─> User accesses own data ✅
```

**JWT Structure (Store User):**
```json
{
  "sub": "user_2abc123xyz",
  "email": "customer@example.com",
  "role": "authenticated",
  "aud": "authenticated",
  "app_metadata": {
    "provider": "clerk"
  },
  "user_metadata": {
    "account_type": "individual",
    "verification_status": "none",
    "business_name": null
  }
}
```

### Admin Flow (Supabase Auth)

```
1. Admin navigates to /admin/login
   └─> Enters email and password
       └─> Supabase Auth validates credentials
           └─> Session cookie created
               └─> Redirects to /admin dashboard
                   └─> Admin makes API requests
                       └─> Supabase server client uses session
                           └─> RLS checks admin_profiles table
                               └─> Admin accesses all data ✅
```

**Admin Identification:**
```sql
-- Store User (Clerk)
auth.jwt() ->> 'sub'  -- Returns: user_2abc123

-- Admin (Supabase Auth)
auth.uid()            -- Returns: UUID format
```

## Data Access Patterns

### Store User Data Access (via Clerk JWT)

```typescript
// In API Route or Server Action
import { createClerkSupabaseClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  // This client automatically includes Clerk JWT token
  const supabase = await createClerkSupabaseClient()
  
  // RLS policies automatically filter data for current user
  const { data, error } = await supabase
    .from('orders')
    .select('*')
  
  // Only returns orders for the logged-in Clerk user
  return Response.json({ data, error })
}
```

**RLS Policy (orders table):**
```sql
CREATE POLICY "Users can view own orders"
  ON orders FOR SELECT
  TO authenticated
  USING (clerk_user_id = get_current_user_id());
  
-- get_current_user_id() extracts from JWT:
-- RETURNS auth.jwt() ->> 'sub'
```

### Admin Data Access (via Supabase Auth)

```typescript
// In Admin API Route
import { createServerSupabase } from '@/lib/supabase/server'

export async function GET(request: Request) {
  // This client uses Supabase Auth session
  const supabase = await createServerSupabase()
  
  // Admin RLS policies allow full access
  const { data, error } = await supabase
    .from('orders')
    .select('*')
  
  // Returns ALL orders (admin has full access)
  return Response.json({ data, error })
}
```

**RLS Policy (orders table - admin access):**
```sql
CREATE POLICY "Service role has full access"
  ON orders FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
  
-- Admins use service_role key for full access
```

## Database Tables Structure

### Store User Tables (Clerk Auth)

```
profiles
├── id (UUID)
├── user_id (TEXT) ← Clerk user ID (user_xxx format)
├── email (TEXT)
├── role (TEXT) ← 'individual' or 'business'
├── business_name (TEXT)
├── verification_status (TEXT) ← 'none', 'pending', 'verified', 'rejected'
└── created_at, updated_at

orders
├── id (UUID)
├── clerk_user_id (TEXT) ← References profiles.user_id
├── order_number (TEXT)
├── total_amount (DECIMAL)
├── status (TEXT)
└── created_at, updated_at

verification_documents
├── id (UUID)
├── user_id (TEXT) ← References profiles.user_id
├── document_type (TEXT)
├── file_url (TEXT)
├── status (TEXT)
└── uploaded_at
```

### Admin Tables (Supabase Auth)

```
admin_settings (singleton)
├── id (UUID)
├── setup_completed (BOOLEAN)
├── recovery_key_hash (TEXT)
└── created_at, updated_at

admin_profiles
├── id (UUID)
├── user_id (UUID) ← References auth.users(id) from Supabase Auth
├── role (ENUM) ← 'super_admin', 'admin', 'manager', 'staff'
├── is_active (BOOLEAN)
├── approved_by (UUID)
├── approved_at (TIMESTAMP)
└── created_at, updated_at
```

## RLS Helper Functions

```sql
-- For Store Users (Clerk JWT)
CREATE FUNCTION get_current_user_id()
RETURNS text AS $$
BEGIN
  RETURN auth.jwt() ->> 'sub';  -- Extracts Clerk user ID
END;
$$ LANGUAGE plpgsql;

CREATE FUNCTION get_user_role()
RETURNS text AS $$
BEGIN
  RETURN auth.jwt() -> 'user_metadata' ->> 'account_type';
END;
$$ LANGUAGE plpgsql;

CREATE FUNCTION get_verification_status()
RETURNS text AS $$
BEGIN
  RETURN auth.jwt() -> 'user_metadata' ->> 'verification_status';
END;
$$ LANGUAGE plpgsql;

-- For Admins (Supabase Auth)
-- Use built-in: auth.uid()
-- Returns UUID of logged-in admin
```

## Key Differences

| Aspect | Clerk Auth (Store) | Supabase Auth (Admin) |
|--------|-------------------|---------------------|
| **User Type** | Customers, Businesses | Admins only |
| **Login URL** | `/sign-in`, `/sign-up` | `/admin/login` |
| **User ID Format** | TEXT (`user_2abc123`) | UUID |
| **Auth Provider** | Clerk (external) | Supabase (native) |
| **JWT Source** | Clerk token | Supabase session |
| **RLS Check** | `get_current_user_id()` | `auth.uid()` |
| **Client Function** | `createClerkSupabaseClient()` | `createServerSupabase()` |
| **Access Scope** | Own data only | All data |
| **Tables** | profiles, orders, etc. | admin_profiles, admin_settings |
| **Role Types** | individual, business | super_admin, admin, manager, staff |

## Native Integration Setup (Required Steps)

### Step 1: Clerk Dashboard
```
Clerk Dashboard
└─> Your Application
    └─> Sessions
        └─> Customize session token
            └─> Add JSON with user_metadata
                └─> Save ✅
```

### Step 2: Clerk Integration
```
Clerk Dashboard
└─> Integrations
    └─> Search "Supabase"
        └─> Click "Add integration"
            └─> Enable ✅
                └─> Note Clerk domain
```

### Step 3: Supabase Configuration
```
Supabase Dashboard
└─> Authentication
    └─> Providers
        └─> Third-Party Auth
            └─> Select "Clerk"
                └─> Enter Clerk domain
                    └─> Save ✅
```

### Step 4: Verification
```sql
-- Run in Supabase SQL Editor (as store user)
SELECT 
  auth.jwt() ->> 'sub' as clerk_user_id,
  auth.jwt() -> 'user_metadata' as metadata;

-- Should return:
-- clerk_user_id: user_2abc123
-- metadata: {"account_type": "individual", ...}
```

## Security Model

### Store Users (Limited Access)
- ✅ Can read/write own data only
- ✅ RLS policies enforce data isolation
- ✅ JWT claims validated by Supabase
- ✅ No direct database access
- ❌ Cannot see other users' data
- ❌ Cannot modify RLS policies
- ❌ No admin access

### Admins (Full Access)
- ✅ Full CRUD on all tables
- ✅ Can manage users and settings
- ✅ Can approve verifications
- ✅ Access to analytics and reports
- ✅ Role-based permissions
- ⚠️ Super Admin only for critical settings
- ⚠️ All actions logged

## Success Indicators

✅ **Store User Auth Working:**
```sql
SELECT auth.jwt() ->> 'sub';  -- Returns: user_xxx
SELECT get_user_role();        -- Returns: 'individual' or 'business'
SELECT * FROM profiles WHERE user_id = get_current_user_id(); -- Returns data
```

✅ **Admin Auth Working:**
```sql
SELECT auth.uid();  -- Returns: UUID
SELECT * FROM admin_profiles WHERE user_id = auth.uid(); -- Returns profile
SELECT role, is_active FROM admin_profiles WHERE user_id = auth.uid(); 
-- Returns: super_admin, true
```

## Troubleshooting Quick Reference

| Issue | Check | Fix |
|-------|-------|-----|
| Store user can't access data | `SELECT auth.jwt() ->> 'sub'` | Configure Clerk session token |
| Admin can't save | `SELECT auth.uid()` | Login at /admin/login |
| JWT claims missing | `SELECT auth.jwt() -> 'user_metadata'` | Enable Third-Party integration |
| Permission denied | `SELECT get_current_user_id()` | Sign out and sign in again |

---

**For complete setup instructions, see:**
- `/app/INTEGRATION-FIX-SUMMARY.md`
- `/app/CLERK-SUPABASE-NATIVE-SETUP.md`
- `/app/ADMIN-DASHBOARD-FIX.md`
