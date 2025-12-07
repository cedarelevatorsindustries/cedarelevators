// Checkout Module - Modular B2B/B2C Checkout System

// Main Templates
export { default as CheckoutTemplate } from './templates/checkout-template'
export { default as OrderConfirmationTemplate } from './templates/order-confirmation-template'

// Context
export { CheckoutProvider, useCheckout } from './context/checkout-context'

// Sections
export { default as ProgressBarSection } from './sections/01-progress-bar-section'
export { default as GuestEmailCaptureSection } from './sections/02-guest-email-capture-section'
export { default as CheckoutBlockedSection } from './sections/03-checkout-blocked-section'
export { default as ShippingAddressSection } from './sections/04-shipping-address-section'
export { default as BillingAddressSection } from './sections/05-billing-address-section'
export { default as DeliveryOptionsSection } from './sections/06-delivery-options-section'
export { default as PaymentMethodSection } from './sections/07-payment-method-section'
export { default as OrderSummarySection } from './sections/08-order-summary-section'
export { default as ThankYouSection } from './sections/09-thank-you-section'

// Components
export { default as CartSummarySticky } from './components/cart-summary-sticky'
export { default as TrustBadges } from './components/trust-badges'
export { default as BulkDiscountCalculator } from './components/bulk-discount-calculator'
export { default as GSTBreakdown } from './components/gst-breakdown'
export { default as WhatsAppButton } from './components/whatsapp-button'
export { default as ExitIntentPopup } from './components/exit-intent-popup'
export { default as AddressForm } from './components/address-form'
export { default as PaymentMethodsB2B } from './components/payment-methods-b2b'
export { default as ThankYouUpsell } from './components/thank-you-upsell'
export { default as CouponCodeInput } from './components/coupon-code-input'

// Types
export * from './types'
