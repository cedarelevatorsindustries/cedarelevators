# 🧪 Test Suite Documentation
Cedar Elevator Industries - Checkout Module

---

## 📁 Directory Structure

```
tests/
├── setup.ts                          # Jest test configuration
├── unit/                             # Unit tests
│   └── checkout-actions.test.ts     # Checkout server actions tests
├── integration/                      # Integration tests
│   └── payment-flow.test.ts         # Payment and webhook tests
└── e2e/                             # End-to-end tests
    └── checkout-journey.spec.ts     # Full checkout user journey
```

---

## 🚀 Quick Start

### Install Dependencies

```bash
# Install all dependencies including test frameworks
pnpm install
```

This will install:
- `jest` - Unit testing framework
- `@testing-library/react` - React component testing
- `@testing-library/jest-dom` - DOM matchers
- `@playwright/test` - E2E testing framework
- `ts-jest` - TypeScript support for Jest

### Running Tests

**Unit Tests**
```bash
# Run all unit tests
pnpm test

# Run tests in watch mode (for development)
pnpm test:watch

# Run tests with coverage report
pnpm test:coverage

# Run specific test file
pnpm test checkout-actions.test.ts
```

**Integration Tests**
```bash
# Run integration tests
pnpm test integration/

# Run with verbose output
pnpm test integration/ --verbose
```

**E2E Tests**
```bash
# Run all E2E tests (headless)
pnpm test:e2e

# Run E2E tests in UI mode (interactive)
pnpm test:e2e:ui

# Run E2E tests with browser visible
pnpm test:e2e:headed

# Run specific test file
pnpm test:e2e checkout-journey.spec.ts

# Run tests in specific browser
pnpm test:e2e --project=chromium
pnpm test:e2e --project=firefox
pnpm test:e2e --project=webkit
```

**Run All Tests**
```bash
# Run unit + integration + E2E tests
pnpm test:all
```

---

## 📋 Test Coverage

### Unit Tests Coverage

**Checkout Actions (`checkout-actions.test.ts`)**
- ✅ `checkCheckoutEligibility()` - Authentication, eligibility validation
- ✅ `getBusinessAddresses()` - Fetch addresses, empty state, authentication
- ✅ `addBusinessAddress()` - XSS sanitization, UUID validation, default handling
- ✅ `updateBusinessAddress()` - Update logic, default management
- ✅ `deleteBusinessAddress()` - Soft delete, authentication
- ✅ `getCheckoutSummary()` - GST calculation, empty cart, pricing accuracy
- ✅ `createOrderFromCart()` - Authentication, verification check, cart ownership
- ✅ `getOrderById()` - Fetch with items, not found handling

**Total Unit Tests:** 25+ tests

### Integration Tests Coverage

**Payment Flow (`payment-flow.test.ts`)**
- ✅ Webhook signature verification
- ✅ Payment capture event handling
- ✅ Idempotency protection
- ✅ Order status updates
- ✅ Inventory reduction
- ✅ Cart conversion
- ✅ Payment transaction records
- ✅ Payment timeout handling
- ✅ Razorpay order creation
- ✅ Edge cases (concurrent payments, amount validation, refunds)

**Total Integration Tests:** 15+ tests

### E2E Tests Coverage

**Checkout Journey (`checkout-journey.spec.ts`)**

**User Access Control:**
- ✅ Guest user blocked from checkout
- ✅ Individual user blocked from checkout
- ✅ Unverified business blocked from checkout
- ✅ Verified business allowed full access

**Checkout Flow:**
- ✅ Complete checkout journey (end-to-end)
- ✅ Address selection and management
- ✅ Order review and validation
- ✅ Terms acceptance requirement
- ✅ Payment integration
- ✅ Order confirmation

**Edge Cases:**
- ✅ Empty cart redirect
- ✅ Out of stock handling
- ✅ Profile switching prevention
- ✅ Payment modal cancellation

**Accessibility:**
- ✅ Keyboard navigation
- ✅ ARIA labels and landmarks

**Mobile Responsive:**
- ✅ Mobile layout verification
- ✅ Touch-friendly buttons

**Total E2E Tests:** 20+ scenarios

---

## 🔧 Configuration Files

### Jest Configuration (`jest.config.js`)

```javascript
module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/__tests__/**/*.+(ts|tsx|js)', '**/?(*.)+(spec|test).+(ts|tsx|js)'],
  transform: { '^.+\\.(ts|tsx)$': 'ts-jest' },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  }
}
```

### Playwright Configuration (`playwright.config.ts`)

```typescript
export default defineConfig({
  testDir: './tests/e2e',
  timeout: 60 * 1000,
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure'
  },
  projects: [
    { name: 'chromium', use: devices['Desktop Chrome'] },
    { name: 'firefox', use: devices['Desktop Firefox'] },
    { name: 'webkit', use: devices['Desktop Safari'] },
    { name: 'mobile-chrome', use: devices['Pixel 5'] }
  ]
})
```

---

## 📝 Writing New Tests

### Unit Test Example

```typescript
import { myFunction } from '@/lib/actions/my-action'

describe('My Function', () => {
  it('should do something', async () => {
    const result = await myFunction('input')
    expect(result.success).toBe(true)
    expect(result.data).toBeDefined()
  })

  it('should handle errors', async () => {
    const result = await myFunction(null)
    expect(result.success).toBe(false)
    expect(result.error).toBeDefined()
  })
})
```

### E2E Test Example

```typescript
import { test, expect } from '@playwright/test'

test('should complete checkout', async ({ page }) => {
  await page.goto('/checkout')
  await page.fill('[data-testid="address-input"]', 'Test Address')
  await page.click('[data-testid="submit-btn"]')
  await expect(page.locator('[data-testid="success-message"]')).toBeVisible()
})
```

---

## 🐛 Debugging Tests

### Jest Debugging

```bash
# Run tests with verbose output
pnpm test --verbose

# Run single test file
pnpm test checkout-actions.test.ts

# Run tests matching pattern
pnpm test --testNamePattern="should calculate GST"

# Update snapshots
pnpm test -u
```

### Playwright Debugging

```bash
# Run with UI mode (best for debugging)
pnpm test:e2e:ui

# Run with browser visible
pnpm test:e2e:headed

# Run with debug mode
pnpm test:e2e --debug

# Generate trace
pnpm test:e2e --trace on

# View trace file
px playwright show-trace trace.zip
```

### Common Issues

**Issue 1: Tests timing out**
```typescript
// Increase timeout for specific test
test('slow test', async ({ page }) => {
  test.setTimeout(120000) // 2 minutes
  // ... test code
})
```

**Issue 2: Element not found**
```typescript
// Wait for element before interacting
await page.waitForSelector('[data-testid="element"]')
await page.click('[data-testid="element"]')
```

**Issue 3: Mock not working**
```typescript
// Clear mocks before each test
beforeEach(() => {
  jest.clearAllMocks()
})
```

---

## 📊 Test Reports

### Coverage Report

```bash
# Generate coverage report
pnpm test:coverage

# Open HTML report
open coverage/lcov-report/index.html
```

### Playwright Report

```bash
# View test report
px playwright show-report

# Report location: playwright-report/index.html
```

---

## 🔄 CI/CD Integration

### GitHub Actions Example

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'pnpm'
      
      # Install dependencies
      - run: pnpm install
      
      # Run unit tests
      - run: pnpm test:coverage
      
      # Install Playwright browsers
      - run: pnpm exec playwright install --with-deps
      
      # Run E2E tests
      - run: pnpm test:e2e
      
      # Upload test results
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
      
      # Upload coverage
      - uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
```

---

## 📚 Best Practices

### Test Naming
```typescript
// ✅ Good: Descriptive test names
it('should redirect guest users to login page', async () => { })

// ❌ Bad: Vague test names
it('test checkout', async () => { })
```

### Test Independence
```typescript
// ✅ Good: Tests are independent
beforeEach(() => {
  // Reset state before each test
})

// ❌ Bad: Tests depend on each other
let globalState // Don't share state between tests
```

### Use Data Test IDs
```typescript
// ✅ Good: Use data-testid attributes
await page.click('[data-testid="submit-btn"]')

// ❌ Bad: Use fragile selectors
await page.click('.btn.primary.large') // Can break with styling changes
```

### Mock External Services
```typescript
// ✅ Good: Mock external APIs
jest.mock('@/lib/razorpay', () => ({
  createOrder: jest.fn().mockResolvedValue({ id: 'order_123' })
}))

// ❌ Bad: Make real API calls in tests
// This makes tests slow and unreliable
```

---

## 🎯 Test Checklist

Before marking tests complete:

- [ ] All unit tests passing
- [ ] All integration tests passing
- [ ] All E2E tests passing
- [ ] Code coverage >70%
- [ ] No flaky tests
- [ ] Tests run in CI/CD
- [ ] Test documentation updated
- [ ] Manual testing guide followed

---

## 📞 Support

For test-related issues:
- Check [Testing Guide](/docs/TESTING-GUIDE.md)
- Review [Playwright Documentation](https://playwright.dev)
- Review [Jest Documentation](https://jestjs.io)
- Contact: [Dev Team]

---

**Last Updated:** January 2025  
**Status:** ✅ Test Suite Complete
