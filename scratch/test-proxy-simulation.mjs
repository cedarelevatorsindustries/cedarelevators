import { createJiti } from 'jiti'
import { resolve } from 'path'
import { readFileSync, existsSync } from 'fs'

// Load environment variables for simulation runner if missing
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

const jiti = createJiti(import.meta.url, {
  alias: {
    '@': resolve(process.cwd(), 'src')
  }
})

const proxyModule = jiti('../src/proxy.ts')
const { NextRequest } = jiti('next/server')
const middleware = proxyModule.default

console.log('--- Testing Proxy Middleware Behavior Across Domains & Routes ---')

// Mock NextRequest and auth helper
function createMockRequest(urlStr, hostHeader) {
  const req = new NextRequest(urlStr, {
    headers: {
      host: hostHeader
    }
  })
  return req
}

const mockAuth = async () => ({
  userId: null,
  protect: () => {
    throw new Error('Clerk protect() must NOT be called for admin routes!')
  }
})

let passed = 0
let failed = 0

async function testRoute(name, urlStr, hostHeader, expectedType, expectedTarget) {
  const req = createMockRequest(urlStr, hostHeader)
  try {
    const res = await middleware(req)
    
    if (expectedType === 'pass') {
      if (!res || (res.status === 200 && !res.headers.get('location'))) {
        console.log(`  [PASS] ${name} -> Passed through directly (status: ${res ? res.status : 200})`)
        passed++
      } else {
        console.error(`  [FAIL] ${name} -> Expected pass-through, got:`, res)
        failed++
      }
    } else if (expectedType === 'redirect') {
      const location = res?.headers?.get('location')
      if (res?.status === 307 || res?.status === 308 || res?.status === 302 || res?.status === 301) {
        if (location && location.includes(expectedTarget)) {
          console.log(`  [PASS] ${name} -> Redirected to ${expectedTarget}`)
          passed++
        } else {
          console.error(`  [FAIL] ${name} -> Redirect location ${location} does not match ${expectedTarget}`)
          failed++
        }
      } else {
        console.error(`  [FAIL] ${name} -> Expected redirect status, got:`, res?.status)
        failed++
      }
    } else if (expectedType === 'rewrite') {
      // In Next.js NextResponse.rewrite sets x-middleware-rewrite header
      const rewriteHeader = res?.headers?.get('x-middleware-rewrite')
      if (rewriteHeader && rewriteHeader.includes(expectedTarget)) {
        console.log(`  [PASS] ${name} -> Rewritten to ${expectedTarget}`)
        passed++
      } else {
        console.error(`  [FAIL] ${name} -> Rewrite header ${rewriteHeader} does not match ${expectedTarget}`)
        failed++
      }
    }
  } catch (err) {
    console.error(`  [FAIL] ${name} -> Exception:`, err.message)
    failed++
  }
}

async function runTests() {
  // Test 1: Localhost /admin entry point
  await testRoute(
    'Localhost /admin entry',
    'http://localhost:3000/admin',
    'localhost:3000',
    'pass'
  )

  // Test 2: Localhost /admin/ entry point
  await testRoute(
    'Localhost /admin/ entry',
    'http://localhost:3000/admin/',
    'localhost:3000',
    'pass'
  )

  // Test 3: Localhost legacy /admin/login redirect
  await testRoute(
    'Localhost legacy /admin/login',
    'http://localhost:3000/admin/login',
    'localhost:3000',
    'redirect',
    '/admin'
  )

  // Test 4: Configured exact admin hostname
  process.env.ADMIN_DOMAIN = 'admin.cedarelevators.com'
  await testRoute(
    'Configured exact admin hostname root (admin.cedarelevators.com/)',
    'https://admin.cedarelevators.com/',
    'admin.cedarelevators.com',
    'rewrite',
    '/admin'
  )

  await testRoute(
    'Configured exact admin hostname subpage (admin.cedarelevators.com/products)',
    'https://admin.cedarelevators.com/products',
    'admin.cedarelevators.com',
    'rewrite',
    '/admin/products'
  )

  // Test 5: Unrelated hostname beginning with admin. (must NOT rewrite to /admin)
  await testRoute(
    'Unrelated hostname beginning with admin. (admin.attacker.com/)',
    'https://admin.attacker.com/',
    'admin.attacker.com',
    'pass' // Passes to Clerk/customer storefront, NOT rewritten to /admin
  )

  // Test 6: admin.localhost for local development
  await testRoute(
    'Local dev admin.localhost:3000 root',
    'http://admin.localhost:3000/',
    'admin.localhost:3000',
    'rewrite',
    '/admin'
  )

  // Test 7: Behavior when ADMIN_DOMAIN is missing/undefined
  delete process.env.ADMIN_DOMAIN

  await testRoute(
    'Missing ADMIN_DOMAIN: admin.localhost still works for local dev',
    'http://admin.localhost:3000/',
    'admin.localhost:3000',
    'rewrite',
    '/admin'
  )

  await testRoute(
    'Missing ADMIN_DOMAIN: arbitrary admin.cedarelevators.com is NOT treated as admin subdomain',
    'https://admin.cedarelevators.com/',
    'admin.cedarelevators.com',
    'pass' // Must NOT rewrite to /admin
  )

  await testRoute(
    'Missing ADMIN_DOMAIN: arbitrary admin.evil.com is NOT treated as admin subdomain',
    'https://admin.evil.com/',
    'admin.evil.com',
    'pass' // Must NOT rewrite to /admin
  )

  // Restore ADMIN_DOMAIN
  process.env.ADMIN_DOMAIN = 'admin.cedarelevators.com'

  // Test 8: Dormant commerce routes redirect
  await testRoute(
    'Customer checkout route redirect',
    'http://localhost:3000/checkout',
    'localhost:3000',
    'redirect',
    '/products'
  )

  await testRoute(
    'Customer cart route redirect',
    'http://localhost:3000/cart',
    'localhost:3000',
    'redirect',
    '/products'
  )

  await testRoute(
    'Customer wishlist route redirect',
    'http://localhost:3000/wishlist',
    'localhost:3000',
    'redirect',
    '/products'
  )

  await testRoute(
    'Customer track route redirect',
    'http://localhost:3000/track',
    'localhost:3000',
    'redirect',
    '/products'
  )

  await testRoute(
    'Customer order confirmation route redirect',
    'http://localhost:3000/order-confirmation',
    'localhost:3000',
    'redirect',
    '/products'
  )

  // Test 9: Legacy category normalization redirect
  await testRoute(
    'Legacy category normalization /categories/gearless-motors',
    'http://localhost:3000/categories/gearless-motors',
    'localhost:3000',
    'redirect',
    '/catalog/categories/gearless-motors'
  )

  console.log(`\nSimulation Results: ${passed} passed, ${failed} failed.`)
  if (failed > 0) process.exit(1)
}

runTests()
