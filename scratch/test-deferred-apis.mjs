import { createJiti } from 'jiti'
import { resolve } from 'path'

const jiti = createJiti(import.meta.url, {
  alias: {
    '@': resolve(process.cwd(), 'src')
  }
})

const { NextRequest } = jiti('next/server')
const { POST: paymentCreateOrder } = jiti('../src/app/api/payments/create-order/route.ts')
const { POST: paymentVerify } = jiti('../src/app/api/payments/verify/route.ts')
const { POST: ordersPost } = jiti('../src/app/api/orders/route.ts')
const { createOrderFromCart } = jiti('../src/lib/actions/order-creation.ts')

console.log('--- Testing Backend Phase 1 Enforcement ---')
let passed = 0
let failed = 0

async function testApi(name, handler, body) {
  try {
    const req = new NextRequest('http://localhost:3000/api/test', {
      method: 'POST',
      body: JSON.stringify(body || {})
    })
    const res = await handler(req)
    const json = await res.json()
    if (res.status === 403 && json.error && json.error.includes('deferred in Phase 1')) {
      console.log(`  [PASS] ${name} -> Correctly rejected with 403: "${json.error}"`)
      passed++
    } else {
      console.error(`  [FAIL] ${name} -> Unexpected response status:`, res.status, json)
      failed++
    }
  } catch (err) {
    console.error(`  [FAIL] ${name} -> Exception:`, err.message)
    failed++
  }
}

async function testAction(name, action, input) {
  try {
    const res = await action(input)
    if (res.success === false && res.error && res.error.includes('deferred in Phase 1')) {
      console.log(`  [PASS] ${name} -> Correctly rejected: "${res.error}"`)
      passed++
    } else {
      console.error(`  [FAIL] ${name} -> Unexpected result:`, res)
      failed++
    }
  } catch (err) {
    console.error(`  [FAIL] ${name} -> Exception:`, err.message)
    failed++
  }
}

async function run() {
  await testApi('POST /api/payments/create-order', paymentCreateOrder, { orderId: 'test', amount: 100 })
  await testApi('POST /api/payments/verify', paymentVerify, { orderId: 'test' })
  await testApi('POST /api/orders', ordersPost, { cartId: 'test' })
  await testAction('createOrderFromCart server action', createOrderFromCart, { cartId: 'test' })

  console.log(`\nBackend Enforcement Results: ${passed} passed, ${failed} failed.`)
  if (failed > 0) process.exit(1)
}

run()
