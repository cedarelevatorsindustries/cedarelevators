# Migration Guide: JWT Templates → Native Integration

**⚠️ Important: Migrate Before January 1, 2026**

Clerk's JWT template method for Supabase is deprecated as of April 1, 2025. While it may work with limited support until January 1, 2026, you should migrate to the native integration now.

## Why Migrate?

1. **Security**: No need to share Supabase JWT secrets with Clerk
2. **Performance**: Faster token validation (no extra fetch calls)
3. **Reliability**: Official method with full support
4. **Future-Proof**: Won't break after deprecation deadline
5. **Simplicity**: Fewer moving parts, easier to maintain

## What Changes?

| Component | Old (Deprecated) | New (Native Integration) |
|-----------|-----------------|--------------------------|
| **Clerk Setup** | JWT Templates | Session Token Customization |
| **Token Fetching** | `getToken({ template: 'supabase' })` | `getToken()` (standard) |
| **Supabase Setup** | Paste JWT secret | Add Clerk as Third-Party Provider |
| **Token Validation** | Manual JWKS endpoint | Auto via native integration |
| **Custom Claims** | In JWT template | In session token customization |

## Migration Steps (15-30 minutes)

### Step 1: Update Clerk Dashboard

#### 1.1 Remove JWT Template
1. Go to **Clerk Dashboard** → **JWT Templates**
2. Find your "supabase" template
3. **Delete it** or disable it

#### 1.2 Add Session Token Customization
1. Go to **Clerk Dashboard** → **Customize Session Token**
2. Add this JSON array:

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

3. **Save** changes

#### 1.3 Enable Native Integration
1. Go to **Clerk Dashboard** → **Integrations**
2. Search for **"Supabase"**
3. Click **"Activate"** or **"Connect with Supabase"**
4. Note your Clerk domain (e.g., `https://clerk.cedarelevator.com`)

### Step 2: Update Supabase Dashboard

#### 2.1 Remove Old JWT Secret (if added)
1. Go to **Supabase Dashboard** → **Settings** → **API**
2. If you previously pasted Clerk's JWT secret, you can now remove it
3. Supabase will use the native integration instead

#### 2.2 Add Clerk as Third-Party Provider
1. Go to **Authentication** → **Providers** → **Third-Party**
2. Click **"Add Integration"** → Select **"Clerk"**
3. Enter your Clerk domain: `https://clerk.cedarelevator.com`
4. **Save**

### Step 3: Update Your Code

#### 3.1 Update Supabase Client (Server-Side)

**Old Code:**
```typescript
import { auth } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'

export async function createClerkSupabaseClient() {
  const { getToken } = await auth()
  const clerkToken = await getToken({ template: 'supabase' })  // ❌ Deprecated
  
  return createClient(supabaseUrl, supabaseKey, {
    global: {
      fetch: async (url, options = {}) => {
        const headers = new Headers(options?.headers)
        headers.set('Authorization', `Bearer ${clerkToken}`)
        return fetch(url, { ...options, headers })
      }
    }
  })
}
```

**New Code:**
```typescript
import { auth } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'

export async function createClerkSupabaseClient() {
  const { getToken } = await auth()
  const clerkToken = await getToken()  // ✅ Standard token
  
  return createClient(supabaseUrl, supabaseKey, {
    global: {
      fetch: async (url, options = {}) => {
        const headers = new Headers(options?.headers)
        headers.set('Authorization', `Bearer ${clerkToken}`)
        return fetch(url, { ...options, headers })
      }
    }
  })
}
```

**Change:** Remove `{ template: 'supabase' }` argument

#### 3.2 Update RLS Helper Functions

**Old Code:**
```sql
-- Uses request.jwt.claims (old method)
CREATE OR REPLACE FUNCTION get_jwt_claim(claim text)
RETURNS text AS $$
BEGIN
  RETURN current_setting('request.jwt.claims', true)::json->>claim;
END;
$$ LANGUAGE plpgsql STABLE;

CREATE OR REPLACE FUNCTION get_current_user_id()
RETURNS text AS $$
BEGIN
  RETURN get_jwt_claim('sub');
END;
$$ LANGUAGE plpgsql STABLE;
```

**New Code:**
```sql
-- Uses auth.jwt() (native method)
CREATE OR REPLACE FUNCTION get_current_user_id()
RETURNS text AS $$
BEGIN
  RETURN auth.jwt() ->> 'sub';
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_user_role()
RETURNS text AS $$
BEGIN
  RETURN auth.jwt() -> 'user_metadata' ->> 'account_type';
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_verification_status()
RETURNS text AS $$
BEGIN
  RETURN auth.jwt() -> 'user_metadata' ->> 'verification_status';
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;
```

**Changes:**
- Use `auth.jwt()` instead of `current_setting('request.jwt.claims')`
- Access custom claims via `auth.jwt() -> 'user_metadata'`
- Add `SECURITY DEFINER` for better performance

#### 3.3 Update RLS Policies

**Old Policy:**
```sql
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');
```

**New Policy:**
```sql
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (user_id = (auth.jwt() ->> 'sub'));
```

**For custom metadata access:**
```sql
-- Check user role
CREATE POLICY "Business users only"
  ON some_table FOR SELECT
  TO authenticated
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'account_type') = 'business'
  );
```

### Step 4: Test the Migration

#### 4.1 Restart Your App
```bash
# Stop server
# Restart
pnpm dev
```

#### 4.2 Test Authentication
1. Sign in via Clerk
2. Check browser console for errors
3. Verify token is working

#### 4.3 Verify JWT in Supabase
Run in Supabase SQL Editor:

```sql
-- Should show your Clerk user ID
SELECT auth.jwt() ->> 'sub' as user_id;

-- Should show your custom metadata
SELECT auth.jwt() -> 'user_metadata' as metadata;

-- Test helper functions
SELECT get_current_user_id();  -- Your user ID
SELECT get_user_role();  -- 'individual' or 'business'
SELECT get_verification_status();  -- Verification status
```

#### 4.4 Test RLS Policies
Try to:
- ✅ View your own profile → Should work
- ✅ Create an order → Should work
- ❌ View another user's profile → Should fail (RLS blocks it)

### Step 5: Clean Up (Optional)

1. **Remove old JWT template references** from documentation
2. **Update internal wiki** if you have one
3. **Notify team members** about the migration
4. **Remove unused code** that referenced the old template method

## Troubleshooting

### Issue: "Invalid JWT" after migration

**Cause:** Supabase still expecting old JWT format

**Fix:**
1. Verify Third-Party integration is active in Supabase
2. Clear browser cache and cookies
3. Sign out and sign back in via Clerk
4. Check Supabase logs for detailed error

### Issue: RLS policies returning "permission denied"

**Cause:** Custom claims not accessible in new token structure

**Fix:**
1. Verify Session Token customization in Clerk Dashboard
2. Check claims are in `user_metadata` section
3. Update RLS policies to use `auth.jwt() -> 'user_metadata'`
4. Test: `SELECT auth.jwt();` in SQL Editor

### Issue: Token validation fails

**Cause:** Native integration not fully configured

**Fix:**
1. Re-check Clerk domain in Supabase Third-Party settings
2. Ensure it matches exactly (including https://)
3. Wait 5-10 minutes for DNS propagation
4. Try with a new session (sign out and in)

## Rollback Plan (If Needed)

If you encounter critical issues:

1. **Re-enable JWT Template** in Clerk Dashboard (temporarily)
2. **Revert code changes** to use `getToken({ template: 'supabase' })`
3. **Keep old RLS policies** (don't delete them yet)
4. **Debug the issue** before trying migration again
5. **Contact support** if stuck

## Benefits After Migration

✅ **Faster**: ~50ms faster per request (no extra token fetch)
✅ **Simpler**: One less configuration to maintain
✅ **Secure**: No JWT secrets shared between platforms
✅ **Reliable**: Official method with full support
✅ **Future-proof**: Won't break after deprecation

## Timeline

- **April 1, 2025**: JWT template method deprecated
- **Now - Dec 31, 2025**: Limited support with exemptions
- **January 1, 2026**: JWT template method may stop working
- **Recommendation**: Migrate ASAP

## Need Help?

1. Check [Clerk Native Integration Docs](https://clerk.com/docs/integrations/databases/supabase)
2. Check [Supabase Third-Party Auth Docs](https://supabase.com/docs/guides/auth/social-login/auth-clerk)
3. Join [Clerk Discord](https://clerk.com/discord)
4. Join [Supabase Discord](https://discord.supabase.com)

---

**Migration complete!** Your app now uses the modern, officially supported integration method. 🎉
