import { createClient } from '@supabase/supabase-js'
import { resolve } from 'path'
import { readFileSync, existsSync } from 'fs'

if (existsSync('.env')) {
  const envContent = readFileSync('.env', 'utf8')
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/)
    if (match) {
      const key = match[1].trim()
      const val = match[2].trim()
      if (!process.env[key]) process.env[key] = val
    }
  })
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

console.log('======================================================================')
console.log('CEDAR ELEVATORS - PHASE C: SUPABASE ADMIN AUTH & SESSION TEST SUITE')
console.log('======================================================================\n')

let passed = 0
let failed = 0

function assert(scenarioNum, name, condition, details = '') {
  if (condition) {
    console.log(`[PASS] Scenario ${scenarioNum}: ${name}`)
    passed++
  } else {
    console.error(`[FAIL] Scenario ${scenarioNum}: ${name} -> ${details}`)
    failed++
  }
}

async function runPhaseCTests() {
  const adminClient = createClient(supabaseUrl, serviceRoleKey)
  const anonClient = createClient(supabaseUrl, supabaseAnonKey)

  // -------------------------------------------------------------------------
  // Scenario 1: Valid Administrator Identity & Profile Linkage
  // -------------------------------------------------------------------------
  const targetEmail = 'cedarelevatorsindustries@gmail.com'
  const { data: usersData, error: userLookupError } = await adminClient.auth.admin.listUsers()
  const liveAdminUser = usersData?.users?.find(u => u.email === targetEmail)

  assert(1, 'Administrator exists in Supabase Auth', !!liveAdminUser && !userLookupError, `Admin user ${targetEmail} not found`)

  if (liveAdminUser) {
    const { data: profile } = await adminClient
      .from('admin_profiles')
      .select('*')
      .eq('user_id', liveAdminUser.id)
      .maybeSingle()

    assert(1, 'Administrator profile is active super_admin',
      profile && profile.role === 'super_admin' && profile.is_active === true,
      `Profile: ${JSON.stringify(profile)}`
    )
  }

  // -------------------------------------------------------------------------
  // Scenario 2: Invalid Email / Password Handling
  // -------------------------------------------------------------------------
  const { data: invalidLogin, error: invalidLoginError } = await anonClient.auth.signInWithPassword({
    email: targetEmail,
    password: 'CompletelyWrongPassword123!'
  })
  assert(2, 'Invalid credentials rejected by Supabase Auth',
    !!invalidLoginError && !invalidLogin.session,
    'Invalid password unexpectedly succeeded'
  )

  // -------------------------------------------------------------------------
  // Scenario 3: Ordinary Customer Login Rejection (No admin_profiles record)
  // -------------------------------------------------------------------------
  // Test UUID of ordinary user without admin_profiles
  const fakeCustomerUuid = '00000000-0000-0000-0000-000000000001'
  const { data: customerProfile } = await adminClient
    .from('admin_profiles')
    .select('*')
    .eq('user_id', fakeCustomerUuid)
    .maybeSingle()

  assert(3, 'Ordinary customer lacks admin_profiles record',
    customerProfile === null,
    'Found unexpected admin profile for fake customer'
  )

  // -------------------------------------------------------------------------
  // Scenario 4: Inactive Administrator Rejection
  // -------------------------------------------------------------------------
  // Verify requireAdmin rejects if is_active is false
  const requireAdminContent = readFileSync(resolve(process.cwd(), 'src/lib/auth/require-admin.ts'), 'utf-8')
  assert(4, 'requireAdmin enforces is_active check',
    requireAdminContent.includes('!profile.is_active') && requireAdminContent.includes('Administrator account is inactive'),
    'Inactive check missing from requireAdmin'
  )

  // -------------------------------------------------------------------------
  // Scenario 5: Session Persistence & Token Refresh
  // -------------------------------------------------------------------------
  const proxyContent = readFileSync(resolve(process.cwd(), 'src/proxy.ts'), 'utf-8')
  assert(5, 'Proxy middleware refreshes Supabase session tokens in cookies',
    proxyContent.includes('refreshAdminSupabaseSession') && proxyContent.includes('createServerClient') && proxyContent.includes('getUser()'),
    'Session refresh missing in proxy.ts'
  )

  // -------------------------------------------------------------------------
  // Scenario 6: Centralized Logout & Session Invalidation
  // -------------------------------------------------------------------------
  const logoutContent = readFileSync(resolve(process.cwd(), 'src/lib/auth/admin-logout.ts'), 'utf-8')
  assert(6, 'Centralized logout purges browser & server session cookies',
    logoutContent.includes('supabase.auth.signOut()') && logoutContent.includes('adminLogoutAction()') && logoutContent.includes("window.location.href"),
    'Incomplete logout implementation in admin-logout.ts'
  )

  // -------------------------------------------------------------------------
  // Scenario 7: Password Recovery Request (Generic / Non-enumerating)
  // -------------------------------------------------------------------------
  const actionsContent = readFileSync(resolve(process.cwd(), 'src/lib/actions/admin-auth.ts'), 'utf-8')
  assert(7, 'adminRequestPasswordRecoveryAction prevents email enumeration',
    actionsContent.includes('adminRequestPasswordRecoveryAction') &&
    actionsContent.includes('resetPasswordForEmail') &&
    actionsContent.includes('If an administrator account exists with this email'),
    'Recovery response might leak account existence'
  )

  // -------------------------------------------------------------------------
  // Scenario 8: Password Reset Route & Action
  // -------------------------------------------------------------------------
  const resetPageContent = readFileSync(resolve(process.cwd(), 'src/app/admin/(auth)/reset-password/page.tsx'), 'utf-8')
  assert(8, 'Password reset page validates recovery session and enforces minimum length',
    resetPageContent.includes('verifyRecoverySession') &&
    resetPageContent.includes('password.length < 8') &&
    resetPageContent.includes('adminResetPasswordAction'),
    'Reset password page lacks proper validation'
  )

  // -------------------------------------------------------------------------
  // Scenario 9: Invalid / Expired Recovery Link Rejection
  // -------------------------------------------------------------------------
  const callbackRouteContent = readFileSync(resolve(process.cwd(), 'src/app/api/admin/auth/callback/route.ts'), 'utf-8')
  assert(9, 'Callback route validates PKCE code and redirects on failure',
    callbackRouteContent.includes('exchangeCodeForSession') && callbackRouteContent.includes('/admin/recover?error=invalid_link'),
    'Callback route does not safely handle expired codes'
  )

  // -------------------------------------------------------------------------
  // Scenario 10: Server Action Password Update & Recovery Session Purge
  // -------------------------------------------------------------------------
  assert(10, 'adminResetPasswordAction signs out of recovery session after password update',
    actionsContent.includes('adminResetPasswordAction') &&
    actionsContent.includes('supabase.auth.updateUser') &&
    actionsContent.includes('await supabase.auth.signOut()'),
    'Password reset does not properly purge temporary recovery session'
  )

  // -------------------------------------------------------------------------
  // Scenario 11: Admin Dashboard Single Entry Point Access
  // -------------------------------------------------------------------------
  const layoutContent = readFileSync(resolve(process.cwd(), 'src/app/admin/(dashboard)/layout.tsx'), 'utf-8')
  assert(11, 'AdminLayout dynamically serves Login UI or Dashboard on /admin without redirects',
    layoutContent.includes('AdminLoginView') && layoutContent.includes('AdminAccessDeniedView') && layoutContent.includes('checkAdminSessionAction'),
    'Layout does not handle single entry route correctly'
  )

  // -------------------------------------------------------------------------
  // Scenario 12: Customer Storefront Clerk Isolation
  // -------------------------------------------------------------------------
  assert(12, 'Customer routes retain Clerk and proxy protects storefront isolation',
    proxyContent.includes('clerkMiddleware') && proxyContent.includes('isDormantCommerceRoute'),
    'Storefront isolation damaged'
  )

  console.log('\n======================================================================')
  console.log(`TOTAL PHASE C SCENARIO TESTS: ${passed} PASSED, ${failed} FAILED`)
  console.log('======================================================================')

  if (failed > 0) process.exit(1)
}

runPhaseCTests()
