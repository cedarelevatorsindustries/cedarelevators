import { readFileSync } from 'fs'
import { resolve } from 'path'

console.log('--- Testing Cedar Elevators Admin Portal Routing & Session Verification ---')

let passed = 0
let failed = 0

function assert(name, condition, details = '') {
  if (condition) {
    console.log(`  [PASS] ${name}`)
    passed++
  } else {
    console.error(`  [FAIL] ${name} ${details}`)
    failed++
  }
}

// 1. Verify proxy.ts logic via source analysis & simulation
const proxyContent = readFileSync(resolve(process.cwd(), 'src/proxy.ts'), 'utf-8')

assert('Proxy does not invoke Clerk auth.protect() for admin', 
  !proxyContent.includes('auth.protect()'),
  'Found auth.protect() in proxy.ts'
)

assert('Proxy handles admin. subdomain routing',
  proxyContent.includes('isAdminSubdomain') && proxyContent.includes('rewrite'),
  'Missing subdomain rewrite in proxy.ts'
)

assert('Proxy redirects legacy /admin/login to /admin',
  proxyContent.includes("url.pathname === '/admin/login'") && proxyContent.includes("NextResponse.redirect(new URL('/admin'"),
  'Missing redirect from /admin/login to /admin'
)

// 2. Verify layout.tsx single-entry dynamic behavior
const layoutContent = readFileSync(resolve(process.cwd(), 'src/app/admin/(dashboard)/layout.tsx'), 'utf-8')

assert('AdminLayout imports AdminLoginView',
  layoutContent.includes('AdminLoginView'),
  'AdminLayout does not import AdminLoginView'
)

assert('AdminLayout imports AdminAccessDeniedView',
  layoutContent.includes('AdminAccessDeniedView'),
  'AdminLayout does not import AdminAccessDeniedView'
)

assert('AdminLayout renders AdminLoginView for unauthenticated visitor on root',
  layoutContent.includes("authStatus === 'unauthenticated'") && layoutContent.includes('<AdminLoginView'),
  'Missing unauthenticated login view render in AdminLayout'
)

assert('AdminLayout denies access for unauthorized customers and inactive admins',
  layoutContent.includes("authStatus === 'unauthorized'") && layoutContent.includes('<AdminAccessDeniedView'),
  'Missing access denied view render in AdminLayout'
)

// 3. Verify legacy /admin/login page redirects to /admin
const loginPageContent = readFileSync(resolve(process.cwd(), 'src/app/admin/(auth)/login/page.tsx'), 'utf-8')
assert('Legacy /admin/login page redirects to /admin',
  loginPageContent.includes("redirect('/admin')"),
  'Legacy /admin/login does not redirect to /admin'
)

// 4. Verify checkAdminSessionAction exists and delegates to requireAdmin
const adminAuthContent = readFileSync(resolve(process.cwd(), 'src/lib/actions/admin-auth.ts'), 'utf-8')
assert('checkAdminSessionAction exported in admin-auth.ts',
  adminAuthContent.includes('export async function checkAdminSessionAction'),
  'Missing checkAdminSessionAction in admin-auth.ts'
)

assert('checkAdminSessionAction enforces requireAdmin',
  adminAuthContent.includes("requireAdmin('staff')"),
  'checkAdminSessionAction does not enforce requireAdmin'
)

console.log(`\nResults: ${passed} passed, ${failed} failed.`)
if (failed > 0) {
  process.exit(1)
}
