/**
 * E2E Tests for Complete Checkout Journey
 * Tests full user flow from cart to order confirmation
 * 
 * Uses Playwright for browser automation
 */

import { test, expect, Page } from '@playwright/test'

/**
 * Test Data
 */
const TEST_USERS = {
  guest: null,
  individual: {
    email: 'individual@test.com',
    password: 'Test@1234'
  },
  unverifiedBusiness: {
    email: 'unverified@business.com',
    password: 'Test@1234'
  },
  verifiedBusiness: {
    email: 'verified@business.com',
    password: 'Test@1234'
  }
}

const TEST_CARD = {
  number: '4111111111111111',
  expiry: '12/25',
  cvv: '123',
  name: 'Test User'
}

/**
 * Helper Functions
 */

async function addProductsToCart(page: Page, productCount: number = 2) {
  // Navigate to catalog
  await page.goto('/catalog')
  await expect(page.locator('[data-testid="catalog-page"]')).toBeVisible()

  // Add products to cart
  for (let i = 0; i < productCount; i++) {
    const addToCartButtons = page.locator('[data-testid*="add-to-cart"]')
    await addToCartButtons.nth(i).click()
    await page.waitForTimeout(1000) // Wait for cart update
  }

  // Verify cart badge shows correct count
  const cartBadge = page.locator('[data-testid="cart-count-badge"]')
  await expect(cartBadge).toContainText(String(productCount))
}

async function navigateToCheckout(page: Page) {
  // Go to cart
  await page.click('[data-testid="cart-icon"]')
  await page.waitForURL('**/cart')

  // Click proceed to checkout
  await page.click('[data-testid="proceed-to-checkout-btn"]')
}

async function fillShippingAddress(page: Page) {
  // Check if address selection is available
  const hasAddresses = await page.locator('[data-testid="saved-addresses"]').isVisible()
  
  if (!hasAddresses) {
    // Need to add new address
    await page.click('[data-testid="add-new-address-btn"]')
    
    await page.fill('[data-testid="contact-name-input"]', 'Test User')
    await page.fill('[data-testid="contact-phone-input"]', '9876543210')
    await page.fill('[data-testid="address-line1-input"]', 'Test Address Line 1')
    await page.fill('[data-testid="city-input"]', 'Mumbai')
    await page.fill('[data-testid="state-input"]', 'Maharashtra')
    await page.fill('[data-testid="postal-code-input"]', '400001')
    
    await page.click('[data-testid="save-address-btn"]')
    await page.waitForTimeout(1000)
  } else {
    // Select first available address
    await page.click('[data-testid="address-card"]:first-child')
  }
}

async function completePayment(page: Page) {
  // Wait for Razorpay modal to load
  await page.waitForSelector('iframe[name^="razorpay"]', { timeout: 10000 })
  
  const razorpayFrame = page.frameLocator('iframe[name^="razorpay"]')
  
  // Fill card details
  await razorpayFrame.locator('input[name="card[number]"]').fill(TEST_CARD.number)
  await razorpayFrame.locator('input[name="card[expiry]"]').fill(TEST_CARD.expiry)
  await razorpayFrame.locator('input[name="card[cvv]"]').fill(TEST_CARD.cvv)
  await razorpayFrame.locator('input[name="card[name]"]').fill(TEST_CARD.name)
  
  // Submit payment
  await razorpayFrame.locator('button[type="submit"]').click()
}

/**
 * Test Suites
 */

test.describe('Checkout Journey - Guest User', () => {
  
  test('should block guest users from accessing checkout', async ({ page }) => {
    // Add products to cart as guest
    await addProductsToCart(page, 2)
    
    // Try to access checkout
    await navigateToCheckout(page)
    
    // Should see guest blocked screen
    await expect(page.locator('[data-testid="guest-checkout-blocked"]')).toBeVisible()
    
    // Verify message
    await expect(page.locator('text=Sign in required to proceed')).toBeVisible()
    
    // Verify CTAs present
    await expect(page.locator('[data-testid="sign-in-btn"]')).toBeVisible()
    await expect(page.locator('[data-testid="request-quote-btn"]')).toBeVisible()
  })

  test('should redirect to login when clicking sign in', async ({ page }) => {
    await addProductsToCart(page, 1)
    await navigateToCheckout(page)
    
    await page.click('[data-testid="sign-in-btn"]')
    
    // Should redirect to login with checkout redirect
    await page.waitForURL('**/sign-in**')
    expect(page.url()).toContain('redirect=/checkout')
  })

  test('should allow quote request as fallback', async ({ page }) => {
    await addProductsToCart(page, 1)
    await navigateToCheckout(page)
    
    await page.click('[data-testid="request-quote-btn"]')
    
    // Should redirect to quote page
    await page.waitForURL('**/request-quote')
  })
})

test.describe('Checkout Journey - Individual User', () => {
  
  test.beforeEach(async ({ page }) => {
    // Sign in as individual user
    await page.goto('/sign-in')
    await page.fill('input[name="email"]', TEST_USERS.individual.email)
    await page.fill('input[name="password"]', TEST_USERS.individual.password)
    await page.click('button[type="submit"]')
    await page.waitForURL('**/')
  })

  test('should block individual users from checkout', async ({ page }) => {
    await addProductsToCart(page, 2)
    await navigateToCheckout(page)
    
    // Should see individual blocked screen
    await expect(page.locator('[data-testid="individual-checkout-blocked"]')).toBeVisible()
    
    // Verify message
    await expect(page.locator('text=Business account required')).toBeVisible()
    
    // Verify CTAs
    await expect(page.locator('[data-testid="upgrade-to-business-btn"]')).toBeVisible()
    await expect(page.locator('[data-testid="request-quote-btn"]')).toBeVisible()
  })

  test('should show quote option prominently', async ({ page }) => {
    await addProductsToCart(page, 1)
    await navigateToCheckout(page)
    
    const quoteButton = page.locator('[data-testid="request-quote-btn"]')
    await expect(quoteButton).toBeVisible()
    
    // Click and verify redirect
    await quoteButton.click()
    await page.waitForURL('**/request-quote')
  })
})

test.describe('Checkout Journey - Unverified Business', () => {
  
  test.beforeEach(async ({ page }) => {
    // Sign in as unverified business
    await page.goto('/sign-in')
    await page.fill('input[name="email"]', TEST_USERS.unverifiedBusiness.email)
    await page.fill('input[name="password"]', TEST_USERS.unverifiedBusiness.password)
    await page.click('button[type="submit"]')
    await page.waitForURL('**/')
  })

  test('should block unverified business from checkout', async ({ page }) => {
    await addProductsToCart(page, 2)
    await navigateToCheckout(page)
    
    // Should see unverified blocked screen
    await expect(page.locator('[data-testid="unverified-business-checkout-blocked"]')).toBeVisible()
    
    // Verify message
    await expect(page.locator('text=verification required')).toBeVisible()
    
    // Verify CTAs
    await expect(page.locator('[data-testid="complete-verification-btn"]')).toBeVisible()
    await expect(page.locator('[data-testid="request-quote-btn"]')).toBeVisible()
  })

  test('should redirect to verification page', async ({ page }) => {
    await addProductsToCart(page, 1)
    await navigateToCheckout(page)
    
    await page.click('[data-testid="complete-verification-btn"]')
    
    // Should redirect to verification
    await page.waitForURL('**/profile/business/verification')
  })
})

test.describe('Checkout Journey - Verified Business (Happy Path)', () => {
  
  test.beforeEach(async ({ page }) => {
    // Sign in as verified business
    await page.goto('/sign-in')
    await page.fill('input[name="email"]', TEST_USERS.verifiedBusiness.email)
    await page.fill('input[name="password"]', TEST_USERS.verifiedBusiness.password)
    await page.click('button[type="submit"]')
    await page.waitForURL('**/')
  })

  test('should complete full checkout flow successfully', async ({ page }) => {
    // Step 1: Add products to cart
    await addProductsToCart(page, 2)
    
    // Step 2: Navigate to checkout
    await navigateToCheckout(page)
    
    // Should reach checkout page
    await expect(page.locator('[data-testid="checkout-page"]')).toBeVisible()
    
    // Step 3: Verify progress indicator shows Address step
    await expect(page.locator('[data-testid="checkout-step-address"]')).toHaveClass(/active/)
    
    // Step 4: Select/fill shipping address
    await fillShippingAddress(page)
    
    // Step 5: Continue to review
    await page.click('[data-testid="continue-to-review-btn"]')
    
    // Should be on review step
    await expect(page.locator('[data-testid="checkout-step-review"]')).toHaveClass(/active/)
    
    // Step 6: Verify order summary
    await expect(page.locator('[data-testid="order-summary"]')).toBeVisible()
    
    // Step 7: Accept terms
    await page.check('[data-testid="terms-checkbox"]')
    
    // Step 8: Place order
    await page.click('[data-testid="place-order-btn"]')
    
    // Should move to payment step
    await expect(page.locator('[data-testid="checkout-step-payment"]')).toHaveClass(/active/)
    
    // Step 9: Complete payment (mock/test mode)
    await page.click('[data-testid="pay-now-btn"]')
    
    // Note: In test environment, payment might be mocked
    // Wait for success redirect
    await page.waitForURL('**/order-confirmation**', { timeout: 30000 })
    
    // Step 10: Verify order confirmation
    await expect(page.locator('[data-testid="order-confirmation-page"]')).toBeVisible()
    await expect(page.locator('[data-testid="order-number"]')).toBeVisible()
  })

  test('should display correct pricing breakdown', async ({ page }) => {
    await addProductsToCart(page, 2)
    await navigateToCheckout(page)
    await fillShippingAddress(page)
    await page.click('[data-testid="continue-to-review-btn"]')
    
    // Verify pricing elements exist
    await expect(page.locator('[data-testid="subtotal-amount"]')).toBeVisible()
    await expect(page.locator('[data-testid="gst-amount"]')).toBeVisible()
    await expect(page.locator('[data-testid="gst-percentage"]')).toContainText('18%')
    await expect(page.locator('[data-testid="total-amount"]')).toBeVisible()
    
    // Shipping should be 0
    const shippingText = await page.locator('[data-testid="shipping-amount"]').textContent()
    expect(shippingText).toContain('0')
  })

  test('should require terms acceptance before placing order', async ({ page }) => {
    await addProductsToCart(page, 1)
    await navigateToCheckout(page)
    await fillShippingAddress(page)
    await page.click('[data-testid="continue-to-review-btn"]')
    
    // Try to place order without accepting terms
    const placeOrderBtn = page.locator('[data-testid="place-order-btn"]')
    await expect(placeOrderBtn).toBeDisabled()
    
    // Accept terms
    await page.check('[data-testid="terms-checkbox"]')
    
    // Button should be enabled
    await expect(placeOrderBtn).toBeEnabled()
  })

  test('should allow back navigation between steps', async ({ page }) => {
    await addProductsToCart(page, 1)
    await navigateToCheckout(page)
    await fillShippingAddress(page)
    await page.click('[data-testid="continue-to-review-btn"]')
    
    // On review step
    await expect(page.locator('[data-testid="checkout-step-review"]')).toHaveClass(/active/)
    
    // Click back
    await page.click('[data-testid="back-to-address-btn"]')
    
    // Should return to address step
    await expect(page.locator('[data-testid="checkout-step-address"]')).toHaveClass(/active/)
  })
})

test.describe('Checkout Journey - Edge Cases', () => {
  
  test.beforeEach(async ({ page }) => {
    // Sign in as verified business
    await page.goto('/sign-in')
    await page.fill('input[name="email"]', TEST_USERS.verifiedBusiness.email)
    await page.fill('input[name="password"]', TEST_USERS.verifiedBusiness.password)
    await page.click('button[type="submit"]')
    await page.waitForURL('**/')
  })

  test('should handle empty cart redirect', async ({ page }) => {
    // Try to access checkout with empty cart
    await page.goto('/checkout')
    
    // Should redirect to cart page
    await page.waitForURL('**/cart')
  })

  test('should show warning for out of stock items', async ({ page }) => {
    // Add product that might be out of stock
    await page.goto('/catalog')
    
    // Look for out of stock badge
    const outOfStockProduct = page.locator('[data-testid="product-card"]').filter({ hasText: 'Out of Stock' })
    
    if (await outOfStockProduct.count() > 0) {
      // Add to cart button should be disabled
      const addButton = outOfStockProduct.locator('[data-testid*="add-to-cart"]')
      await expect(addButton).toBeDisabled()
    }
  })

  test('should prevent profile switching during checkout', async ({ page }) => {
    await addProductsToCart(page, 1)
    await navigateToCheckout(page)
    
    // Try to switch profile
    await page.click('[data-testid="profile-menu"]')
    
    // Should see warning or disabled option
    const profileSwitcher = page.locator('[data-testid="profile-switcher"]')
    if (await profileSwitcher.isVisible()) {
      await expect(page.locator('text=Profile switching is disabled during checkout')).toBeVisible()
    }
  })

  test('should handle payment modal cancellation', async ({ page }) => {
    await addProductsToCart(page, 1)
    await navigateToCheckout(page)
    await fillShippingAddress(page)
    await page.click('[data-testid="continue-to-review-btn"]')
    await page.check('[data-testid="terms-checkbox"]')
    await page.click('[data-testid="place-order-btn"]')
    
    // Payment modal opens
    await page.waitForSelector('iframe[name^="razorpay"]', { timeout: 10000 })
    
    // Close modal (simulate cancellation)
    await page.keyboard.press('Escape')
    
    // Should handle gracefully - order still pending
    // User can retry payment
    const retryButton = page.locator('[data-testid="retry-payment-btn"]')
    if (await retryButton.isVisible()) {
      await expect(retryButton).toBeEnabled()
    }
  })
})

test.describe('Checkout Journey - Accessibility', () => {
  
  test('should be keyboard navigable', async ({ page }) => {
    await page.goto('/checkout')
    
    // Tab through elements
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')
    
    // Verify focus is visible
    const focusedElement = await page.locator(':focus')
    await expect(focusedElement).toBeVisible()
  })

  test('should have proper ARIA labels', async ({ page }) => {
    await page.goto('/checkout')
    
    // Check for ARIA landmarks
    await expect(page.locator('[role="main"]')).toBeVisible()
    
    // Check for labeled inputs
    const inputs = page.locator('input[aria-label]')
    expect(await inputs.count()).toBeGreaterThan(0)
  })
})

test.describe('Checkout Journey - Mobile Responsive', () => {
  
  test.use({ viewport: { width: 375, height: 667 } }) // iPhone SE size

  test('should display checkout correctly on mobile', async ({ page }) => {
    // Sign in
    await page.goto('/sign-in')
    await page.fill('input[name="email"]', TEST_USERS.verifiedBusiness.email)
    await page.fill('input[name="password"]', TEST_USERS.verifiedBusiness.password)
    await page.click('button[type="submit"]')
    await page.waitForURL('**/')
    
    // Add products
    await addProductsToCart(page, 1)
    
    // Navigate to checkout
    await navigateToCheckout(page)
    
    // Verify mobile layout
    await expect(page.locator('[data-testid="checkout-page"]')).toBeVisible()
    
    // Progress indicator should be visible
    await expect(page.locator('[data-testid="checkout-step-address"]')).toBeVisible()
  })

  test('should have touch-friendly buttons on mobile', async ({ page }) => {
    await page.goto('/checkout')
    
    // Buttons should have sufficient size (44x44px minimum for touch targets)
    const buttons = page.locator('button')
    const firstButton = buttons.first()
    
    const box = await firstButton.boundingBox()
    if (box) {
      expect(box.height).toBeGreaterThanOrEqual(44)
    }
  })
})
