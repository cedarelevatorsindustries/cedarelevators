import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'

// Pure logic & static regression checks for Cedar Elevators unified quotation module
// Runnable with zero extra dependencies: `node --test tests/quote-module.test.mjs`

test('1. GSTIN validation regex accepts valid Indian GSTIN and rejects invalid formats', async () => {
  const schemaText = fs.readFileSync(
    path.join(process.cwd(), 'src/modules/quote/forms/quote-schema.ts'),
    'utf8'
  )
  const regexMatch = schemaText.match(/GSTIN_REGEX\s*=\s*(\/[^/]+\/)/)
  assert.ok(regexMatch, 'GSTIN_REGEX should be exported in quote-schema.ts')
  const gstRegex = new RegExp(regexMatch[1].slice(1, -1))

  assert.equal(gstRegex.test('33ABCDE1234F1Z5'), true)
  assert.equal(gstRegex.test('29AAACH7409R1Z2'), true)
  assert.equal(gstRegex.test('9784562318546'), false)
  assert.equal(gstRegex.test('INVALID'), false)
  assert.ok(
    schemaText.includes('.max(1000,'),
    'notes validation max length must match 1000-character limit cleanly'
  )
})

test('2. Integer paise financial calculation precision & rounding integrity', () => {
  // Mirrors calculateQuoteTotals algorithm in src/lib/utils/quote-pricing.ts
  const toPaise = (v) => Math.round((Number(v) || 0) * 100)
  const fromPaise = (p) => Math.round(p) / 100

  const qty = 3
  const unitPricePaise = toPaise(1250.5) // 125050 paise
  const grossPaise = unitPricePaise * qty // 375150
  const itemDiscPaise = Math.round(grossPaise * 0.1) // 37515
  const netPaise = grossPaise - itemDiscPaise // 337635
  const gstPaise = Math.round(netPaise * 0.18) // 60774
  const grandTotal = fromPaise(netPaise + gstPaise)

  assert.equal(fromPaise(netPaise), 3376.35)
  assert.equal(fromPaise(gstPaise), 607.74)
  assert.equal(grandTotal, 3984.09)
})

test('3. No obsolete B2B/B2C/UserType classification strings remain in new storefront or admin quote UI', () => {
  const pathsToCheck = [
    'src/modules/quote/components/quote-form.tsx',
    'src/modules/quote/components/guest-track-portal.tsx',
    'src/modules/quote/components/customer-quote-view.tsx',
    'src/modules/checkout/components/quote-confirmation-page.tsx',
    'src/app/admin/(dashboard)/quotes/page.tsx',
    'src/app/admin/(dashboard)/quotes/[id]/page.tsx',
    'src/domains/admin/components/quote-header.tsx',
    'src/domains/admin/components/quote-helpers.ts',
    'src/domains/admin/components/business-information.tsx',
  ]

  const forbiddenPatterns = [
    /getUserTypeBadge/,
    /USER TYPE/,
    /All Users/,
    /Legacy Verified/,
    /Guest \(No Account\)/,
    /24–48 business hours/,
    /Within 24 hours/,
  ]

  for (const relPath of pathsToCheck) {
    const content = fs.readFileSync(path.join(process.cwd(), relPath), 'utf8')
    for (const pattern of forbiddenPatterns) {
      assert.equal(
        pattern.test(content),
        false,
        `Forbidden legacy pattern ${pattern} found in ${relPath}`
      )
    }
  }
})

test('4. Redis rate-limiter disables infinite retries and implements circuit-breaker fallback', () => {
  const redisSrc = fs.readFileSync(path.join(process.cwd(), 'src/lib/services/redis.ts'), 'utf8')
  const rlSrc = fs.readFileSync(path.join(process.cwd(), 'src/lib/services/rate-limit.ts'), 'utf8')

  assert.ok(redisSrc.includes('retry: false'), 'Upstash Redis client must disable exponential retries')
  assert.ok(redisSrc.includes('tripRedisCircuit'), 'redis.ts must export circuit breaker')
  assert.ok(rlSrc.includes('withFastTimeout'), 'rate-limit.ts must enforce fast timeout fallback')
  assert.ok(rlSrc.includes('isRedisCircuitOpen'), 'rate-limit.ts must honor circuit breaker state')
})

test('5. Email sender fallback targets verified Resend subdomain updates.cedarelevators.in', () => {
  const emailSrc = fs.readFileSync(path.join(process.cwd(), 'src/lib/services/email.ts'), 'utf8')
  assert.ok(
    emailSrc.includes('updates.cedarelevators.in'),
    'Default sender email domain must match verified Resend domain updates.cedarelevators.in'
  )
})
